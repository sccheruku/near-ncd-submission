import { connect, ConnectConfig, keyStores, WalletConnection } from "near-api-js";

export async function _connectToWallet() {
    const nearConfig = {
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        contractName: process.env.NEXT_PUBLIC_CONTRACT_NAME,
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://explorer.testnet.near.org',
    };

    // create a keyStore for signing transactions using the user's key
    // which is located in the browser local storage after user logs in
    const keyStore = new keyStores.BrowserLocalStorageKeyStore();

    // Initializing connection to the NEAR testnet
    const near = await connect({
        keyStore,
        ...nearConfig,
        headers: {},
    } as ConnectConfig);

    // Initialize wallet connection
    return new WalletConnection(near, null);
}

export function _signOutWallet(wallet: WalletConnection) {
    wallet.signOut();
    window.location.replace(window.location.origin);
};

export const ATTACHED_GAS = "300000000000000";
