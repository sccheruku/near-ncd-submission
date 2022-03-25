This project is inspired by the Brave browser's Basic Attention Token


```
pub struct AdCampaign {
    pub id: String,
    pub name: String,
    pub cta: String, // navigate to a url
    pub description: String,
    pub categories: Vec<String>, // eg. Technology, Medicine, Arts, Politics, Biology etc.
    pub amount: u128,
    pub amount_per_impression: u128, // for estimation only
    pub min_impressions: u8, // example assumes less than 128 impressions
    pub max_impressions: u8, // example assumes less than 128 impressions
}

```


Run it

read contract instructions

build and deploy contract

start advertisement site - or try it out on vercel 
for fast payouts, please set impressions to 10-25 (or you might have to keep refreshing the screen for a while you fulfil the impression requirements)

start blog site - or start it on vercel