import { Account, Contract, utils, WalletConnection } from "near-api-js";
import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import { ATTACHED_GAS, _connectToWallet } from "../utils/wallet";

export default function CreatePage(props: any) {
    const [walletConnection, setWalletConnection] = useState<WalletConnection>();
    const [loading, setLoading] = useState(true);
    const [account, setAccount] = useState<any>();
    useEffect(() => {
        connectWallet();
    }, []);

    useEffect(() => {
        if (walletConnection) {
            if (walletConnection.getAccountId()) {
                console.log("walletConnection", walletConnection, walletConnection.account());
                setAccount(walletConnection.account());
                setLoading(false);
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
        walletConnection?.requestSignIn();
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
            <CreateForm account={account} />
        </div>
    )
}

function CreateForm(props: any) {
    const [name, setName] = useState("Sample");
    const [description, setDescription] = useState("Description");
    const [amount, setAmount] = useState(1);
    const [impressions, setImpressions] = useState(1);
    function getRandom() {
        return Math.ceil(Math.random() * 10000);
    }
    async function createAdCampaign() {
        const contract = new Contract(
            props.account, // the account object that is connecting
            process.env.NEXT_PUBLIC_CONTRACT_NAME!,
            {
                // name of contract you're connecting to
                viewMethods: [], // view methods do not change state but usually return a value
                changeMethods: ["create_ad_campaign"], // change methods modify state
            }
        ) as any;
        console.log("contract", contract);

        const ad_campaign_in = {
            id: `${(props.account as Account).accountId}:${getRandom()}`,
            owner_account_id: (props.account as Account).accountId,
            name,
            cta: "not-implemented",
            categories: [],
            amount: 0,
            amount_per_impression: 0, // for estimation only
            min_impressions: impressions,
            max_impressions: impressions + 2, // for simplicity - helpful for cases where few people are the last ones to see the ad at the same time.
            status: "ACTIVE"
        };
        const ad = {
            id: ad_campaign_in.id,
            name: ad_campaign_in.name,
            description
        };

        const response = await contract.create_ad_campaign(
            {
                args: { ad_campaign_in, ad },
                gas: ATTACHED_GAS,
                amount: utils.format.parseNearAmount(amount.toString() || "0"),
                meta: "create_product"
            }
        );
        console.log("response", response);
    }

    return (
        <>
            <div className="shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 bg-white sm:p-6">
                    <div className="grid grid-cols-6 gap-6">
                        <div className="col-span-6 sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Total Impressions
                            </label>
                            <input
                                value={impressions}
                                onChange={(evt) => setImpressions(parseInt(evt.currentTarget.value))}
                                type="number"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>

                        <div className="col-span-6 sm:col-span-4">
                            <label className="block text-sm font-medium text-gray-700">
                                NEAR
                            </label>
                            <input
                                onChange={(evt) => setAmount(parseInt(evt.currentTarget.value))}
                                value={amount}
                                type="number"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>

                        <div className="col-span-6 sm:col-span-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Name
                            </label>
                            <input
                                value={name} onChange={(evt) => setName(evt.currentTarget.value)}
                                type="text"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>

                        <div className="col-span-6 sm:col-span-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <input
                                type="text"
                                value={description} onChange={(evt) => setDescription(evt.currentTarget.value)}
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                </div>
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                    <button
                        onClick={createAdCampaign}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Save
                    </button>
                </div>
            </div>
        </>
    )
}