import React, { useState } from 'react';
import { useAppContext } from '../context/AppStateProvider';
import { ASSET_SYMBOLS, AssetSymbol, WithdrawFormData, TRANSACTION_FEES } from '../lib/types';
import { getAvailableBalance } from '../lib/services/balancesService';

interface WithdrawFormProps {
    onSuccess: () => void;
    onError: (message: string) => void;
}

export function WithdrawForm({ onSuccess, onError }: WithdrawFormProps) {
    const { currentUser, submitWithdraw } = useAppContext();

    // Form State
    const [withdrawTo, setWithdrawTo] = useState<'myself' | 'another'>('myself');
    const [recipientFirstName, setRecipientFirstName] = useState('');
    const [recipientLastName, setRecipientLastName] = useState('');

    const [formData, setFormData] = useState<Omit<WithdrawFormData, 'recipientName'>>({
        recipientAddress: '',
        amount: '',
        currency: 'BTC',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const availableBalance = currentUser
        ? getAvailableBalance(currentUser, formData.currency)
        : 0;

    const amount = parseFloat(formData.amount) || 0;
    const fee = TRANSACTION_FEES[formData.currency];
    const youWillReceive = Math.max(0, amount - fee);

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleMaxClick = () => {
        setFormData((prev) => ({ ...prev, amount: availableBalance.toString() }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser) {
            onError('No user selected');
            return;
        }

        // Validation
        if (!formData.recipientAddress.trim()) {
            onError('Recipient address is required');
            return;
        }

        let finalRecipientName = '';

        if (withdrawTo === 'myself') {
            finalRecipientName = `${currentUser.firstName} ${currentUser.lastName}`;
        } else {
            if (!recipientFirstName.trim() || !recipientLastName.trim()) {
                onError('Recipient first and last names are required');
                return;
            }
            finalRecipientName = `${recipientFirstName.trim()} ${recipientLastName.trim()}`;
        }

        if (amount <= 0) {
            onError('Amount must be greater than 0');
            return;
        }
        if (amount > availableBalance) {
            onError('Insufficient balance');
            return;
        }

        setIsSubmitting(true);
        try {
            await submitWithdraw({
                type: 'withdraw',
                asset: formData.currency,
                amount,
                recipientAddress: formData.recipientAddress,
                recipientName: finalRecipientName,
            });

            // Reset form
            setFormData({
                recipientAddress: '',
                amount: '',
                currency: 'BTC',
            });
            setRecipientFirstName('');
            setRecipientLastName('');
            setWithdrawTo('myself');

            onSuccess();
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Withdrawal failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!currentUser) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-gray-500 text-sm">Select a user to withdraw</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Withdraw Crypto</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Currency */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency
                    </label>
                    <select
                        value={formData.currency}
                        onChange={(e) => handleChange('currency', e.target.value as AssetSymbol)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {ASSET_SYMBOLS.map((asset) => (
                            <option key={asset} value={asset}>
                                {asset}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                        Available: {availableBalance.toLocaleString(undefined, { maximumFractionDigits: 8 })}{' '}
                        {formData.currency}
                    </p>
                </div>

                {/* Amount */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            step="any"
                            value={formData.amount}
                            onChange={(e) => handleChange('amount', e.target.value)}
                            placeholder="0.00"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={handleMaxClick}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium transition-colors"
                        >
                            Max
                        </button>
                    </div>
                </div>

                {/* Withdraw To Switch */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Withdraw To
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="withdrawTo"
                                value="myself"
                                checked={withdrawTo === 'myself'}
                                onChange={() => setWithdrawTo('myself')}
                                className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-900">Myself</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="withdrawTo"
                                value="another"
                                checked={withdrawTo === 'another'}
                                onChange={() => setWithdrawTo('another')}
                                className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-900">Another Person</span>
                        </label>
                    </div>
                </div>

                {/* Recipient Name Fields (Conditional) */}
                {withdrawTo === 'another' && (
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                First Name
                            </label>
                            <input
                                type="text"
                                value={recipientFirstName}
                                onChange={(e) => setRecipientFirstName(e.target.value)}
                                placeholder="First Name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name
                            </label>
                            <input
                                type="text"
                                value={recipientLastName}
                                onChange={(e) => setRecipientLastName(e.target.value)}
                                placeholder="Last Name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                )}

                {/* Recipient Address */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Recipient Address
                    </label>
                    <input
                        type="text"
                        value={formData.recipientAddress}
                        onChange={(e) => handleChange('recipientAddress', e.target.value)}
                        placeholder="Enter crypto address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Fee and You Will Receive */}
                {amount > 0 && (
                    <div className="bg-gray-50 rounded-md p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Transaction Fee:</span>
                            <span className="font-medium text-gray-900">
                                {fee} {formData.currency}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">You will receive:</span>
                            <span className="font-semibold text-gray-900">
                                {youWillReceive.toLocaleString(undefined, { maximumFractionDigits: 8 })}{' '}
                                {formData.currency}
                            </span>
                        </div>
                    </div>
                )}

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <p className="text-xs text-yellow-800">
                        ⚠️ Crypto withdrawals are irreversible. Double-check the address before submitting.
                    </p>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
                >
                    {isSubmitting ? 'Processing...' : 'Withdraw'}
                </button>
            </form>
        </div>
    );
}
