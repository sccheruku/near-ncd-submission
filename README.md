### Near Basic Attention Token - Example

This project is inspired by the Brave browser's Basic Attention Token. 

Advertisers can set up ad campaigns and specify the amount of NEAR they want to commit to the campaign. 
They can also specify the minimum number of impressions for the advertisement. 

Blogs can allow visitors to connect to the smart contract, so that ads can be loaded and shown on screen. 


### Structure
`contract` folder contains the smart contract and some tests

`frontend` contains the blog website. This site asks the smart contract to send it a random advertisement. 

`frontend-advertiser` contains the "admin site" which allows advertisers to set up campaigns. 

### Instructions to run the project


#### Build and Deploy Smart Contract
```
# Delete contents of contract/neardev
# Build contract
$ env 'RUSTFLAGS=-C link-arg=-s' cargo build --target wasm32-unknown-unknown --release
# Deploy to the testnet
$ near dev-deploy target/wasm32-unknown-unknown/release/nearbasicattentiontoken.wasm
# VERY IMPORTANT: Take note of the contract address in `contract/neardev/dev-account.env`. You will need it for next steps
```

### Setup a campaign
```
# cd into frontend-advertiser
$ cd frontend-advertiser
# install packages
$ npm install
# VERY IMPORTANT: update the .env.local file with the contract address that was deployed. 
# start the project locally
$ npm run dev
# Visit the app on http://localhost:3001
```

### Browse the blog as a visitor
```
# cd into frontend
$ cd frontend
# install packages
$ npm install
# VERY IMPORTANT: update the .env.local file with the contract address that was deployed. 
# start the project locally
$ npm run dev
# Visit the app on http://localhost:3000
```

### Run e2e example
```
# cd into ts-scripts
# open e2e.ts file for more info
$ npm run ts-node -- e2e.ts
```


### Viewer Rewards
After you have browsed enough, assuming the Campaign Target Impressions have been met. Some funds from the campaign will be added to your account. 

You can checkout this Transaction for an example of how it works: https://explorer.testnet.near.org/transactions/oHiSSuPgrB9ihLsKwAp3bguUMqT38VHhmxNoCevneTr
The last viewer triggers the campaign to close. At this point, `lib.rs->close_ad_campaign` is called and the smart contract calculates the payouts for each viewer based on the number of times they saw the advertisements. 


### Demo Video Link
https://www.loom.com/share/2a063740fa2545b1b863cc03e5927dd6

### Closing remarks and Next Steps
- Allow deleting data from contracts after the ad campaign is completed.
- Make ad-views without tracking or linking to the viewer
- `lib.rs->increment_impression` is vulnerable to attack -> someone can call it 100s of times to take funds from the campaign. 

This project can be improved upon but a production worthy app might require a combination of smart contracts to orchestrate advertisements and track impressions without giving away the near addresses of people that have viewed the app. It may not be ideal for privacy. 