// To conserve gas, efficient serialization is achieved through Borsh (http://borsh.io/)
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedMap;
use near_sdk::serde_json::json;
use near_sdk::{env, near_bindgen, setup_alloc, assert_one_yocto};

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
}

impl Default for NearBasicAttentionToken {
  fn default() -> Self {
    Self {
      ad_campaigns: UnorderedMap::new(StorageKey::AdCampaign),
    }
  }
}

#[near_bindgen]
impl NearBasicAttentionToken {
  #[payable]
  pub create_ad_campaign(&mut self, ad_campaign: AdCampaign) -> String {
    assert_one_yocto();
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
    let context = get_context(vec![], false);
    testing_env!(context);
    let mut contract = NearBasicAttentionToken::default();
    let ad_campaign_data = json!({
      "name": "Campaign Name",
      "cta": "https://google.com",
      "description": "Some campaign description",
      "Categories": ["Technology", "Biology"],
      "amount": ntoy(1),
      "min_impressions": 100,
      "max_impressions": 110,
    })
    .to_string();
    assert_eq!(
      "0".to_string(),
      contract.create_ad_campaign(ad_campaign_data)
    );
  }

  // increment_impression

  // close_ad_campaign

  // payout
}
