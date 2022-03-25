import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { keyStores, connect, ConnectConfig, WalletConnection, Account, Contract } from "near-api-js";
import { useEffect, useState } from 'react';
import Link from 'next/link'
import { signTransaction } from 'near-api-js/lib/transaction';
import Navbar from '../components/navbar';
import { _connectToWallet } from '../utils/wallet';
import AdCampaignList from '../components/AdCampaignList';


const Home: NextPage = () => {
  const [walletConnection, setWalletConnection] = useState<WalletConnection>();
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<any>();
  const [adCampaigns, setAdCampaigns] = useState([]);
  useEffect(() => {
    connectWallet();
  }, []);

  useEffect(() => {
    if (walletConnection) {
      if (walletConnection.getAccountId()) {
        console.log("walletConnection", walletConnection, walletConnection.account());
        setAccount(walletConnection.account());
      }
      else {
        setLoading(false);
      }
    }
  }, [walletConnection]);

  useEffect(() => {
    if (account) {
      loadAdCampaigns();
    }
  }, [account]);

  // list_ad_campaigns
  async function loadAdCampaigns() {
    const contract = new Contract(
      account, // the account object that is connecting
      process.env.NEXT_PUBLIC_CONTRACT_NAME!,
      {
        // name of contract you're connecting to
        viewMethods: ["list_ad_campaigns"], // view methods do not change state but usually return a value
        changeMethods: [], // change methods modify state
      }
    ) as any;
    console.log("contract", contract);

    const response = await contract.list_ad_campaigns({ owner_account_id: account.accountId });
    setAdCampaigns(response);
    setLoading(false);
  }

  async function connectWallet() {
    setWalletConnection(await _connectToWallet());
  }

  async function signIn() {
    walletConnection?.requestSignIn({
      // contractId: process.env.NEXT_PUBLIC_CONTRACT_NAME
    });
  }

  if (loading) {
    return <>Loading...</>
  }

  if (!account) {
    return (
      <button onClick={signIn} className="mt-6 w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Wallet login
      </button>
    )
  }

  return (
    <div>
      <Navbar account={account} wallet={walletConnection} />
      <AdCampaignList account={account} wallet={walletConnection} adCampaigns={adCampaigns} />
    </div>
  )
}
export default Home
