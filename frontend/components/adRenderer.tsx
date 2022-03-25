import cn from 'classnames'
import { Account, Contract, WalletConnection } from 'near-api-js';
import { useEffect, useState } from 'react';
import { ATTACHED_GAS, _connectToWallet } from '../utils/wallet';
import Container from './container'

export default function AdRenderer() {
    const [ad, setAd] = useState<any>();
    const [walletConnection, setWalletConnection] = useState<WalletConnection>();
    const [account, setAccount] = useState<any>();
    useEffect(() => {
        connectWallet();
    }, []);

    useEffect(() => {
        if (walletConnection) {
            if (walletConnection.getAccountId()) {
                console.log("walletConnection", walletConnection, walletConnection.account());
                setAccount(walletConnection.account());
            }
        }
    }, [walletConnection]);

    useEffect(() => {
        if (account) {
            _doLoadRandomAd();
        }
    }, [account]);

    useEffect(() => {
        if (ad) {
            incrementAdImpression(account, ad).then(console.log).catch(console.error);
        }
    }, [ad])

    function _doLoadRandomAd() {
        loadRandomAd(account)
            .then(setAd)
            .catch(console.error);
    }

    async function connectWallet() {
        setWalletConnection(await _connectToWallet());
    }

    if (!ad) {
        return <></>;
    }
    return (
        <div
            className={cn('border bg-neutral-50 border-neutral-600 mt-10')}
        >
            <Container>
                <div className="py-2 text-center text-sm">
                    AD <span onClick={_doLoadRandomAd}>reload</span>
                </div>
                <div className="py-2 text-center text-sm">
                    <p>{ad.id}</p>
                    <p>{ad.name}</p>
                    <p>{ad.description}</p>
                </div>
            </Container>
        </div>
    )
}


async function loadRandomAd(account: Account): Promise<any> {
    const contract = new Contract(
        account, // the account object that is connecting
        process.env.NEXT_PUBLIC_CONTRACT_NAME!,
        {
            // name of contract you're connecting to
            viewMethods: ["get_random_ad"], // view methods do not change state but usually return a value
            changeMethods: [], // change methods modify state
        }
    ) as any;
    console.log("contract", contract);

    const response = await contract.get_random_ad();
    console.log("response", response);
    return JSON.parse(response);
}

async function incrementAdImpression(account: Account, ad: any) {
    const contract = new Contract(
        account, // the account object that is connecting
        process.env.NEXT_PUBLIC_CONTRACT_NAME!,
        {
            // name of contract you're connecting to
            viewMethods: [], // view methods do not change state but usually return a value
            changeMethods: ["increment_impression"], // change methods modify state
        }
    ) as any;
    console.log("contract", contract);

    const response = await contract.increment_impression({
        args: { ad_campaign_id: ad.id },
        // gas: ATTACHED_GAS,
        meta: "increment_impression"
    });
    console.log("increment_impression", response);
}