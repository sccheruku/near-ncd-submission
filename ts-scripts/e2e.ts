// This file performs an end to end test of a single campaign. 
// First, we will create a campaign with 1 NEAR, and 1 target impression. 
// Then we will increment the impressions on that campaign. This is equivalent to viewing the ad while browsing. 

import { Account, connect, ConnectConfig, Contract, InMemorySigner, keyStores, Signer, utils, WalletConnection } from "near-api-js";
import * as cla from "command-line-args";
const ATTACHED_GAS = "300000000000000";
const YOCTO_NEAR = "1000000000000000000000000";

function getConfig(contractName: string) {
    return {
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        contractName: contractName,
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://explorer.testnet.near.org',
        keyStore: new keyStores.UnencryptedFileSystemKeyStore(`${process.env['HOME']}/.near-credentials`),
        headers: {}
    };
}

async function execute() {
    const options = cla([
        {
            name: "contractName", alias: "c", type: String, defaultValue: "dev-1648174658203-18596152676037",
        },
        {
            name: "campaignAdminAccountId", alias: "a", type: String, defaultValue: "dev-1644725625435-61013382261879",
        },
        {
            name: "viewerAccountId", alias: "v", type: String, defaultValue: "encode-hack-marketplace.testnet",
        },
    ]);

    try {
        console.log(options);
        await run(options);
    }
    catch (error) {
        console.error(error as any);
    }

}

function initContract(contractName: string, account: Account) {
    return new Contract(
        account, // the account object that is connecting
        contractName,
        {
            // name of contract you're connecting to
            viewMethods: [], // view methods do not change state but usually return a value
            changeMethods: ["create_ad_campaign", "increment_impression"], // change methods modify state
        }
    );
}

async function run(options: any) {
    const near = await connect(getConfig(options.campaignName) as any);
    const campaignAdminAccount = await near.account(options.campaignAdminAccountId);
    const viewerAccount = await near.account(options.viewerAccountId);

    // Basic check to see if we can connect to accounts
    console.log("campaignAdminAccount.getAccountBalance", await campaignAdminAccount.getAccountBalance());
    console.log("viewerAccount.getAccountBalance", await viewerAccount.getAccountBalance());

    // Create a campaign
    const { ad_campaign_in, ad } = setupAdCampaign(campaignAdminAccount);
    const createAdCampaignResult = await createAdCampaign(campaignAdminAccount, ad_campaign_in, ad, options.contractName);
    console.log("createAdCampaignResult", createAdCampaignResult);

    let incrementImpressionResult = await incrementImpression(viewerAccount, ad_campaign_in, options.contractName);
    console.log("1. incrementImpressionResult", createAdCampaignResult);
    incrementImpressionResult = await incrementImpression(viewerAccount, ad_campaign_in, options.contractName);
    console.log("2. incrementImpressionResult", createAdCampaignResult);

    // campaignAdminAccount should decrease by 1 NEAR
    // viewerAccount should increase by 1 NEAR
    console.log("campaignAdminAccount.getAccountBalance", await campaignAdminAccount.getAccountBalance());
    console.log("viewerAccount.getAccountBalance", await viewerAccount.getAccountBalance());
}


function setupAdCampaign(account: Account) {
    const impressions = 1;
    const ad_campaign_in = {
        id: `${(account as Account).accountId}:${getRandom()}`,
        owner_account_id: (account as Account).accountId,
        name: "Name",
        cta: "not-implemented",
        categories: [],
        amount: 0, // smart contract calculates this
        amount_per_impression: 0, // smart contract calculates this
        min_impressions: impressions,
        max_impressions: impressions + 2, // for simplicity - helpful for cases where few people are the last ones to see the ad at the same time.
        status: "ACTIVE"
    };
    const ad = {
        id: ad_campaign_in.id,
        name: ad_campaign_in.name,
        description: "Test ad description"
    };

    return { ad_campaign_in, ad };
}

function getRandom() {
    return Math.ceil(Math.random() * 10000);
}

async function createAdCampaign(account: Account, ad_campaign_in: any, ad: any, contractName: string) {
    const contract: any = initContract(contractName, account);
    console.log("Contract", contract);
    return await contract.create_ad_campaign(
        {
            args: { ad_campaign_in, ad },
            gas: ATTACHED_GAS,
            amount: utils.format.parseNearAmount("1"), // 1 NEAR by default - easy to test
            meta: "create_ad_campaign"
        }
    );
}


async function incrementImpression(account: Account, ad: any, contractName: string) {
    const contract: any = initContract(contractName, account);
    return await contract.increment_impression({
        args: { ad_campaign_id: ad.id },
        meta: "increment_impression"
    });
}

execute();


/*
Sample output:

> ts-scripts@1.0.0 ts-node
> ts-node "./e2e.ts"

{
  contractName: 'dev-1648174658203-18596152676037',
  campaignAdminAccountId: 'dev-1644725625435-61013382261879',
  viewerAccountId: 'encode-hack-marketplace.testnet'
}
campaignAdminAccount.getAccountBalance {
  total: '188999270627772399999999999',
  stateStaked: '3621820000000000000000000',
  staked: '0',
  available: '185377450627772399999999999'
}
viewerAccount.getAccountBalance {
  total: '216995873505662567100000006',
  stateStaked: '3171400000000000000000000',
  staked: '0',
  available: '213824473505662567100000006'
}
Contract Contract {
  account: Account {
    accessKeyByPublicKeyCache: {},
    connection: Connection {
      networkId: 'testnet',
      provider: [JsonRpcProvider],
      signer: [InMemorySigner]
    },
    accountId: 'dev-1644725625435-61013382261879'
  },
  contractId: 'dev-1648174658203-18596152676037',
  create_ad_campaign: [Function: create_ad_campaign],
  increment_impression: [Function: increment_impression]
}
createAdCampaignResult OK
Receipt: GMQf6icfL4S1z4nK4amf1tW7sNaibaYv429z91z36oHN
        Log [dev-1648174658203-18596152676037]: total_impressions: 1, 1
1. incrementImpressionResult OK
Receipts: 5nL6Gf5m1ADpMVuCGos1zNL6LiU5qiRd5xCps12w61hk, q8CXFCJksvjXac54tJ134FzXSdwHp6qiK3YxGivrv6i
        Log [dev-1648174658203-18596152676037]: total_impressions: 2, 2
2. incrementImpressionResult OK
campaignAdminAccount.getAccountBalance {
  total: '187998113104546921299999999',
  stateStaked: '3621820000000000000000000',
  staked: '0',
  available: '184376293104546921299999999'
}
viewerAccount.getAccountBalance {
  total: '217993694491604669800000006',
  stateStaked: '3171400000000000000000000',
  staked: '0',
  available: '214822294491604669800000006'
}
*/