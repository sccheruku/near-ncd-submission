import { Account, utils, WalletConnection } from "near-api-js"
import { BN } from "bn.js";

type AdCampaignListProps = {
    account: Account,
    wallet?: WalletConnection,
    adCampaigns: any[]
}
export default function AdCampaignList({ account, wallet, adCampaigns }: AdCampaignListProps) {
    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <th className="px-6 py-3">Id</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Target/Max Impressions</th>
                    <th className="px-6 py-3">NEAR</th>
                    <th className="px-6 py-3">Status</th>
                </thead>
                <tbody>
                    {
                        adCampaigns.map((c: any) =>
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{c.id}</td>
                                <td className="px-6 py-4">{c.name}</td>
                                <td className="px-6 py-4">{c.min_impressions}/{c.max_impressions}</td>
                                <td className="px-6 py-4">{c.amount / 1e24}</td>
                                <td className="px-6 py-4">{c.status}</td>
                            </tr>
                        )
                    }
                </tbody>
            </table>
        </div>
    )
}