// To conserve gas, efficient serialization is achieved through Borsh (http://borsh.io/)
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedMap};
use near_sdk::json_types::U128;
use near_sdk::serde_json::json;
use near_sdk::{assert_one_yocto, env, near_bindgen, setup_alloc, AccountId, Balance};
use std::collections::HashMap;

use crate::models::*;
use crate::utils::*;

mod models;
mod utils;

setup_alloc!();

// Structs in Rust are similar to other languages, and may include impl keyword as shown below
// Note: the names of the structs are not important when calling the smart contract, but the function names are
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct NearBasicAttentionToken {
  ad_campaigns: UnorderedMap<String, AdCampaign>,
  ad_campaign_impressions: UnorderedMap<String, AdCampaignImpression>,
}

impl Default for NearBasicAttentionToken {
  fn default() -> Self {
    Self {
      ad_campaigns: UnorderedMap::new(StorageKey::AdCampaign),
      ad_campaign_impressions: UnorderedMap::new(StorageKey::AdCampaignImpression),
    }
  }
}

#[near_bindgen]
impl NearBasicAttentionToken {
  #[payable]
  pub fn create_ad_campaign(&mut self, ad_campaign_in: AdCampaign, ad: AdData) -> String {
    // Assert
    assert!(env::attached_deposit() > 1, "Deposit required");
    // Basic validations
    assert!(ad_campaign_in.min_impressions < ad_campaign_in.max_impressions);

    // check id is in format `owner_account_id:ad_campaign_id`
    let formatted_id_starts_with = format!("{}:", env::signer_account_id());
    assert!(ad_campaign_in.id.contains(&formatted_id_starts_with));

    let existng_ad_campaign = self.ad_campaigns.get(&ad_campaign_in.id);
    assert!(
      existng_ad_campaign.is_none(),
      "Store with ID already exists"
    );

    assert_eq!(
      ad_campaign_in.id, ad.id,
      "AdCampaign and AdData Id must match"
    );

    // Apply
    let mut ad_campaign = ad_campaign_in;
    ad_campaign.owner_account_id = env::signer_account_id();
    ad_campaign.amount = env::attached_deposit();
    ad_campaign.status = AdCampaignStatus::ACTIVE;
    ad_campaign.amount_per_impression =
      env::attached_deposit() as u128 / ad_campaign.max_impressions as u128;

    // Add
    self.ad_campaigns.insert(&ad_campaign.id, &ad_campaign);
    let ad_campaign_impressions = &AdCampaignImpression {
      ad_campaign_id: ad_campaign.id,
      impressions: HashMap::new(),
    };
    self.ad_campaign_impressions.insert(
      &ad_campaign_impressions.ad_campaign_id,
      &ad_campaign_impressions,
    );
    let data = match near_sdk::serde_json::to_string(&ad) {
      Ok(v) => v,
      Err(_) => String::from(""),
    };
    env::storage_write(ad.id.as_bytes(), data.as_bytes());
    String::from("OK")
  }

  pub fn list_ad_campaigns(self, owner_account_id: String) -> Vec<AdCampaign> {
    self
      .ad_campaigns
      .values()
      .filter(|vec| vec.owner_account_id == owner_account_id)
      .collect()
  }
  fn list_active_ad_campaigns(self) -> Vec<AdCampaign> {
    self
      .ad_campaigns
      .values()
      .filter(|vec| matches!(vec.status, AdCampaignStatus::ACTIVE))
      .collect()
  }
  pub fn increment_impression(&mut self, ad_campaign_id: String) -> String {
    // Check AdCampaign exists
    let ad_campaign = self
      .ad_campaigns
      .get(&ad_campaign_id)
      .expect("AdCampaign does not exist");

    // Can't do anything if AdCampaign is completed
    if matches!(ad_campaign.status, AdCampaignStatus::COMPLETED) {
      return String::from("OK");
    }

    let mut existing_ad_campaign_impression = self
      .ad_campaign_impressions
      .get(&String::from(format!("{}", ad_campaign_id)))
      .expect("AdCampaignImpression does not exist");

    let _impressions = existing_ad_campaign_impression
      .impressions
      .entry(env::signer_account_id())
      .or_insert(0);
    *_impressions += 1;
    let impressions = *_impressions;

    // Update this impression
    existing_ad_campaign_impression
      .impressions
      .insert(env::signer_account_id(), impressions);
    // Save to contract state
    self.ad_campaign_impressions.insert(
      &existing_ad_campaign_impression.ad_campaign_id,
      &existing_ad_campaign_impression,
    );
    // Update total impressions
    let mut total_impressions = 0;
    for impression in existing_ad_campaign_impression.impressions.values() {
      total_impressions += impression
    }
    env::log(
      String::from(format!(
        "total_impressions: {}, {}",
        total_impressions, impressions
      ))
      .as_bytes(),
    );
    if total_impressions > ad_campaign.min_impressions {
      self.close_ad_campaign(
        ad_campaign_id,
        total_impressions,
        existing_ad_campaign_impression.impressions,
      );
    }

    String::from("OK")
  }

  pub fn close_ad_campaign(
    &mut self,
    ad_campaign_id: String,
    total_impressions: u8,
    existing_ad_campaign_impressions: HashMap<AccountId, u8>,
  ) -> String {
    let mut ad_campaign = self
      .ad_campaigns
      .get(&ad_campaign_id)
      .expect("AdCampaign is not found");
    // set ad_campaign.status to CLOSED
    ad_campaign.status = AdCampaignStatus::COMPLETED;
    self.ad_campaigns.insert(&ad_campaign_id, &ad_campaign);

    // Payout the ad_campaign members
    let payout_per_viewer_per_view = ad_campaign.amount / total_impressions as u128;
    // loop through, i'm sure there's a better way
    for account_id in existing_ad_campaign_impressions.keys() {
      let _user_impressions = **(existing_ad_campaign_impressions.get(account_id).get_or_insert(&1));
      let payout_for_this_viewer = payout_per_viewer_per_view * (_user_impressions as u128);
      near_sdk::Promise::new(AccountId::from(account_id)).transfer(payout_for_this_viewer);
    }

    String::from("OK")
  }

  pub fn get_random_ad(self) -> String {
    assert!(
      self.ad_campaigns.len() > 0,
      "Wait until atleast one ad campaign is created"
    );

    let rand: usize = *env::random_seed().get(0).unwrap() as usize; // limited to max 256 campaigns ? // as usize probably bad ?
    let ad_campaigns = self.list_active_ad_campaigns();
    let total = ad_campaigns.len();
    let index = rand % total;

    let ad_campaign = match ad_campaigns.get(index) {
      Some(k) => k,
      None => env::panic(String::from("Not found").as_bytes()),
    };
    let key = format!("{}", ad_campaign.id);
    let ad_data_string_raw = match env::storage_read(key.as_bytes()) {
      Some(v) => v,
      None => String::from("").as_bytes().to_vec(),
    };
    let ad_data_string = match String::from_utf8(ad_data_string_raw) {
      Ok(r) => r,
      Err(_) => String::from(""),
    };
    return ad_data_string;
  }

  pub fn get_ad(self, id: String) -> String {
    let ad_data_string_raw = match env::storage_read(&id.as_bytes()) {
      Some(v) => v,
      None => String::from("").as_bytes().to_vec(),
    };
    let ad_data_string = match String::from_utf8(ad_data_string_raw) {
      Ok(r) => r,
      Err(_) => String::from(""),
    };
    return ad_data_string;
  }
}

/*
 * The rest of this file holds the inline tests for the code above
 * Learn more about Rust tests: https://doc.rust-lang.org/book/ch11-01-writing-tests.html
 *
 * To run from contract directory:
 * cargo test -- --nocapture
 *
 * From project root, to run in combination with frontend tests:
 * yarn test
 *
 */
#[cfg(test)]
mod tests {
  use super::*;
  use near_sdk::MockedBlockchain;
  use near_sdk::{testing_env, VMContext};

  // mock the context for testing, notice "signer_account_id" that was accessed above from env::
  fn get_context(input: Vec<u8>, is_view: bool) -> VMContext {
    VMContext {
      current_account_id: "alice_near".to_string(),
      signer_account_id: "bob_near".to_string(),
      signer_account_pk: vec![0, 1, 2],
      predecessor_account_id: "carol_near".to_string(),
      input,
      block_index: 0,
      block_timestamp: 0,
      account_balance: 0,
      account_locked_balance: 0,
      storage_usage: 0,
      attached_deposit: 0,
      prepaid_gas: 10u64.pow(18),
      random_seed: vec![0, 1, 2],
      is_view,
      output_data_receivers: vec![],
      epoch_height: 19,
    }
  }

  #[test]
  fn test_create_ad_campaign() {
    let mut context = get_context(vec![], false);
    let attached_deposit = ntoy(1);
    context.attached_deposit = attached_deposit;
    testing_env!(context);
    let mut contract = NearBasicAttentionToken::default();
    let ad_campaign_data = AdCampaign {
      name: String::from("Campaign Name"),
      cta: String::from("https://google.com"),
      // description: String::from("Some campaign description"),
      categories: vec![String::from("Technology"), String::from("Biology")],
      amount: attached_deposit,
      min_impressions: u8::from(100),
      max_impressions: u8::from(110),
      owner_account_id: String::from("bob_near"),
      amount_per_impression: 0 as u128,
      id: format!("{}:{}", String::from("bob_near"), "0"),
      status: AdCampaignStatus::ACTIVE,
    };

    let ad = AdData {
      id: String::from("null"),
      name: String::from("Campaign Name"),
      description: String::from("Some Ad Desc"),
    };

    assert_eq!(
      "OK".to_string(),
      contract.create_ad_campaign(ad_campaign_data, ad)
    );
  }

  // increment_impression
  fn test_increment_impression() {
    let mut context = get_context(vec![], false);
    let attached_deposit = ntoy(1);

    testing_env!(context);
    let mut contract = NearBasicAttentionToken::default();
    let ad_campaign_id = format!("{}:{}", "near_test", "0");
    let ad_campaign_data = AdCampaign {
      name: String::from("Campaign Name"),
      cta: String::from("https://google.com"),
      // description: String::from("Some campaign description"),
      categories: vec![String::from("Technology"), String::from("Biology")],
      amount: attached_deposit,
      min_impressions: u8::from(100),
      max_impressions: u8::from(110),
      owner_account_id: String::from("bob_near"),
      amount_per_impression: 0 as u128,
      id: format!("{}:{}", String::from("bob_near"), "0"),
      status: AdCampaignStatus::ACTIVE,
    };
    contract
      .ad_campaigns
      .insert(&ad_campaign_id, &ad_campaign_data);
    assert_eq!(
      String::from("OK"),
      contract.increment_impression(ad_campaign_id)
    );
  }

  // close_ad_campaign and payout
  fn test_close_ad_campaign() {
    let mut context = get_context(vec![], false);
    let attached_deposit = ntoy(1);

    testing_env!(context);
    let mut contract = NearBasicAttentionToken::default();
    let ad_campaign_id = format!("{}:{}", "near_test", "0");
    let ad_campaign_data = AdCampaign {
      name: String::from("Campaign Name"),
      cta: String::from("https://google.com"),
      // description: String::from("Some campaign description"),
      categories: vec![String::from("Technology"), String::from("Biology")],
      amount: attached_deposit,
      min_impressions: u8::from(0),
      max_impressions: u8::from(1),
      owner_account_id: String::from("bob_near"),
      amount_per_impression: 0 as u128,
      id: format!("{}:{}", String::from("bob_near"), "0"),
      status: AdCampaignStatus::ACTIVE,
    };
    contract
      .ad_campaigns
      .insert(&ad_campaign_id, &ad_campaign_data);

    contract.increment_impression(ad_campaign_id); // This should trigger campaign to be closed
    assert!(matches!(
      contract
        .ad_campaigns
        .get(&format!("{}:{}", "near_test", "0"))
        .expect("")
        .status,
      AdCampaignStatus::COMPLETED
    ));
  }
}
