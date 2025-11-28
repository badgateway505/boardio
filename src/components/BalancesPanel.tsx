import React from 'react';
import { useAppContext } from '../context/AppStateProvider';
import { ASSET_SYMBOLS } from '../lib/types';

export function BalancesPanel() {
    const { currentUser } = useAppContext();

    if (!currentUser) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Balances</h2>
                <p className="text-gray-500 text-sm">Select a user to view balances</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Balances - {currentUser.displayName}
            </h2>
            <div className="grid grid-cols-2 gap-3">
                {ASSET_SYMBOLS.map((asset) => (
                    <div
                        key={asset}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                    >
                        <span className="font-medium text-gray-700">{asset}</span>
                        <span className="text-gray-900 font-mono">
                            {currentUser.balances[asset].toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 8,
                            })}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
