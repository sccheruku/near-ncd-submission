use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedMap;
use near_sdk::json_types::{U128, U64};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::BorshStorageKey;
use near_sdk::{AccountId, Balance};
use std::collections::HashMap;

/// Helper structure to for keys of the persistent collections.
#[derive(BorshStorageKey, BorshSerialize)]
pub enum StorageKey {
    AdCampaign,
    AdCampaignImpression,
    AdCampaignImpressionPerViewer,
}

#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub enum AdCampaignStatus {
    ACTIVE, COMPLETED
}

#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct AdCampaign {
    pub id: String,
    pub owner_account_id: String,
    pub name: String,
    pub cta: String, // navigate to a url
    pub categories: Vec<String>, // eg. Technology, Medicine, Arts, Politics, Biology etc.
    pub amount: u128,
    pub amount_per_impression: u128, // for estimation only
    pub min_impressions: u8,         // example assumes less than 128 impressions
    pub max_impressions: u8,         // example assumes less than 128 impressions - helpful for cases where few people are the last ones to see the ad at the same time.
    pub status: AdCampaignStatus
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct AdCampaignImpression {
    pub ad_campaign_id: String, // formatted to ad_campaign_id:impression_account_id
    pub impressions: HashMap<AccountId, u8>, 
}

#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct AdData {
    pub id: String,
    pub name: String,
    pub description: String,
}