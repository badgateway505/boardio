import React from 'react';
import { useAppContext } from '../context/AppStateProvider';

export function TransactionHistoryTable() {
    const { currentUserTransactions } = useAppContext();

    if (currentUserTransactions.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h2>
                <p className="text-gray-500 text-sm">No transactions yet</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Date</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Type</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Currency</th>
                            <th className="px-4 py-3 text-right font-medium text-gray-700">Amount</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">From</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">To</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">TX Hash</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">TR Mode</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {currentUserTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-gray-600">
                                    {new Date(tx.createdAt).toLocaleString()}
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${tx.type === 'withdraw'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-green-100 text-green-700'
                                            }`}
                                    >
                                        {tx.type === 'withdraw' ? 'Withdraw' : 'Deposit'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">{tx.asset}</td>
                                <td className="px-4 py-3 text-right font-mono text-gray-900">
                                    {tx.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                                </td>
                                <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                                    {tx.senderName && (
                                        <div>
                                            <div className="font-medium">{tx.senderName}</div>
                                            <div className="text-xs text-gray-500 truncate">{tx.senderAddress}</div>
                                        </div>
                                    )}
                                    {!tx.senderName && <span className="text-gray-400">—</span>}
                                </td>
                                <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                                    {tx.recipientName && (
                                        <div>
                                            <div className="font-medium">{tx.recipientName}</div>
                                            <div className="text-xs text-gray-500 truncate">{tx.recipientAddress}</div>
                                        </div>
                                    )}
                                    {!tx.recipientName && <span className="text-gray-400">—</span>}
                                </td>
                                <td className="px-4 py-3 text-gray-600 max-w-xs truncate font-mono text-xs">
                                    {tx.txHash || <span className="text-gray-400">—</span>}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                        {tx.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                        {tx.travelRuleModeAtSubmission}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
