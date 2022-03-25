import Container from './container'
import cn from 'classnames'
import { EXAMPLE_PATH } from '../lib/constants'
import { WalletConnection } from 'near-api-js'
import { useState, useEffect } from 'react'
import { _connectToWallet, _signOutWallet } from '../utils/wallet'

type Props = {
  preview?: boolean
}

// TODO: Use this to trigger wallet authentication
const Alert = ({ preview }: Props) => {
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

  async function connectWallet() {
    setWalletConnection(await _connectToWallet());
  }
  async function signIn() {
    walletConnection?.requestSignIn({
      contractId: process.env.NEXT_PUBLIC_CONTRACT_NAME /// Necessary for the contract to increment_ad_counters without going to wallet
    });
  }

  return (
    <div
      className={cn('border-b', {
        'bg-neutral-800 border-neutral-800 text-white': preview,
        'bg-neutral-50 border-neutral-200': !preview,
      })}
    >
      <Container>
        <div className="py-2 text-center text-sm">
          {
            !account && <span onClick={signIn}>Connect your wallet</span>
          }
          {
            account && <span onClick={() => _signOutWallet(walletConnection!)}>Disconnect your wallet</span>
          }
        </div>
      </Container>
    </div>
  )
}

export default Alert
