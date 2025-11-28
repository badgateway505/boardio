import React, { useState } from 'react';
import { useAppContext } from '../context/AppStateProvider';
import { ASSET_SYMBOLS, DepositFormData } from '../lib/types';

interface DepositFormProps {
    onSuccess: () => void;
    onError: (message: string) => void;
}

export function DepositForm({ onSuccess, onError }: DepositFormProps) {
    const { currentUser, submitDeposit } = useAppContext();
    const [formData, setFormData] = useState<DepositFormData>({
        senderName: '',
        senderAddress: '',
        txHash: '',
        amount: '',
        currency: 'BTC',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (field: keyof DepositFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser) {
            onError('No user selected');
            return;
        }

        const amount = parseFloat(formData.amount) || 0;

        // Validation
        if (!formData.senderName.trim()) {
            onError('Sender name is required');
            return;
        }
        if (!formData.senderAddress.trim()) {
            onError('Sender address is required');
            return;
        }
        if (!formData.txHash.trim()) {
            onError('Transaction hash is required');
            return;
        }
        if (amount <= 0) {
            onError('Amount must be greater than 0');
            return;
        }

        setIsSubmitting(true);
        try {
            await submitDeposit({
                type: 'deposit',
                asset: formData.currency,
                amount,
                senderName: formData.senderName,
                senderAddress: formData.senderAddress,
                txHash: formData.txHash,
            });

            // Reset form
            setFormData({
                senderName: '',
                senderAddress: '',
                txHash: '',
                amount: '',
                currency: 'BTC',
            });

            onSuccess();
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Deposit failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!currentUser) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-gray-500 text-sm">Select a user to deposit</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Deposit Crypto</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Currency */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency
                    </label>
                    <select
                        value={formData.currency}
                        onChange={(e) => handleChange('currency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {ASSET_SYMBOLS.map((asset) => (
                            <option key={asset} value={asset}>
                                {asset}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Amount */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount
                    </label>
                    <input
                        type="number"
                        step="any"
                        value={formData.amount}
                        onChange={(e) => handleChange('amount', e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Sender Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sender Full Name
                    </label>
                    <input
                        type="text"
                        value={formData.senderName}
                        onChange={(e) => handleChange('senderName', e.target.value)}
                        placeholder="Enter sender name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Sender Address */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sender Address
                    </label>
                    <input
                        type="text"
                        value={formData.senderAddress}
                        onChange={(e) => handleChange('senderAddress', e.target.value)}
                        placeholder="Enter crypto address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Transaction Hash */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transaction Hash
                    </label>
                    <input
                        type="text"
                        value={formData.txHash}
                        onChange={(e) => handleChange('txHash', e.target.value)}
                        placeholder="Enter transaction hash"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
                >
                    {isSubmitting ? 'Processing...' : 'Deposit'}
                </button>
            </form>
        </div>
    );
}
