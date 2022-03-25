import { WalletConnection } from "near-api-js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { _signOutWallet } from "../utils/wallet";

export default function Navbar({ account, wallet }: any) {
    function isPathActive(pathname: string) {
        return location.pathname == pathname;
    }
    function getClassName(pathname: string) {
        if (isPathActive(pathname)) {
            return "bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium"
        }
        return "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
    }

    return (
        <nav className="bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link href="/">
                                    <a className={getClassName("/")}>
                                        AdCampaigns
                                    </a>
                                </Link>
                                <Link href="/create">
                                    <a className={getClassName("/create")}>
                                        Create
                                    </a>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6 text-white">
                            {account.accountId}
                            <button onClick={() => _signOutWallet(wallet)} className="m-4">Logout</button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}
