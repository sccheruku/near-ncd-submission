use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::json_types::{U128, U64};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::BorshStorageKey;

/// Helper structure to for keys of the persistent collections.
#[derive(BorshStorageKey, BorshSerialize)]
pub enum StorageKey {
    AdCampaign
}

#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct AdCampaign {
    pub id: String,
    pub name: String,
    pub cta: String, // navigate to a url
    pub description: String,
    pub categories: Vec<String>, // eg. Technology, Medicine, Arts, Politics, Biology etc.
    pub amount: U128,
    pub amount_per_impression: U128, // for estimation only
    pub min_impressions: U64,        // example assumes less than 128 impressions
    pub max_impressions: U64,        // example assumes less than 128 impressions
}
