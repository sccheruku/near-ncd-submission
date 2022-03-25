### Near Basic Attention Token - Example

This project is inspired by the Brave browser's Basic Attention Token. 

Advertisers can set up ad campaigns and specify the amount of NEAR they want to commit to the campaign. 
They can also specify the minimum number of impressions for the advertisement. 

Blogs can allow visitors to connect to the smart contract, so that ads can be loaded and shown on screen. 


### Structure
`contract` folder contains the smart contract and some tests

`frontend` contains the blog website. This site asks the smart contract to send it a random advertisement. 

`frontend-advertiser` contains the "admin site" which allows advertisers to set up campaigns. 

### Next Steps
- Allow deleting data from contracts after the ad campaign is completed.
- Make ad-views without tracking or linking to the viewer
- `lib.rs->increment_impression` is vulnerable to attack -> someone can call it 100s of times to take funds from the campaign. 

### Instructions to run the project


#### Build and Deploy Smart Contract
```
# Delete contents of contract/neardev
# Build contract
$ env 'RUSTFLAGS=-C link-arg=-s' cargo build --target wasm32-unknown-unknown --release
# Deploy to the testnet
$ near dev-deploy target/wasm32-unknown-unknown/release/nearbasicattentiontoken.wasm
# VERY IMPORTANT: Take note of the contract address. You will need it for next steps
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

### After you have browsed enough, assuming the Campaign Target Impressions have been met. Some funds from the campaign will be added to your account. 

### Demo Video Link


