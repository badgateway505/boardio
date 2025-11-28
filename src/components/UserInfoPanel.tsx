import { useState } from 'react';
import { useAppContext } from '../context/AppStateProvider';
import { AssetSymbol } from '../lib/types';

interface UserInfoPanelProps {
    onVerifyClick: () => void;
    onPushToSumsub: () => void;
}

export function UserInfoPanel({ onVerifyClick, onPushToSumsub }: UserInfoPanelProps) {
    const { currentUser } = useAppContext();
    const [isPushing, setIsPushing] = useState(false);

    if (!currentUser) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>
                <p className="text-gray-500 text-sm">Select a user to view information</p>
            </div>
        );
    }

    // Get top 5 balances by amount
    const balanceEntries = Object.entries(currentUser.balances) as [AssetSymbol, number][];
    const topBalances = balanceEntries
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const fullName = `${currentUser.firstName} ${currentUser.lastName}`;

    const handlePushToSumsub = async () => {
        setIsPushing(true);
        try {
            await onPushToSumsub();
        } finally {
            setIsPushing(false);
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold text-gray-900">User Information</h2>
                <div className="flex gap-2">
                    {currentUser.sumsubId ? (
                        <button
                            disabled
                            className="px-3 py-1.5 bg-white border-2 border-solid border-green-500 text-green-700 text-sm rounded-md flex items-center gap-2 cursor-default font-medium"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                            Already in Sumsub
                        </button>
                    ) : (
                        <button
                            onClick={handlePushToSumsub}
                            disabled={isPushing}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {isPushing ? 'Pushing...' : 'Push to Sumsub'}
                        </button>
                    )}
                    <button
                        onClick={onVerifyClick}
                        className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors font-medium"
                    >
                        Verify me
                    </button>
                </div>
            </div>

            {/* User Details */}
            <div className="space-y-3 mb-6">
                <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Full Name</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{fullName}</p>
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">User ID</label>
                    <p className="text-sm font-mono text-gray-900 mt-1">{currentUser.userId}</p>
                </div>
                {currentUser.sumsubId && (
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">Sumsub ID</label>
                        <p className="text-sm font-mono text-gray-900 mt-1">{currentUser.sumsubId}</p>
                    </div>
                )}
            </div>

            {/* Balances */}
            <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Top Balances</h3>
                <div className="space-y-2">
                    {topBalances.map(([asset, balance]) => (
                        <div
                            key={asset}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded-md"
                        >
                            <span className="text-sm font-medium text-gray-700">{asset}</span>
                            <span className="text-sm text-gray-900 font-mono">
                                {balance.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 8,
                                })}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
