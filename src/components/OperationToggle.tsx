import React from 'react';

interface OperationToggleProps {
    value: 'withdraw' | 'deposit';
    onChange: (value: 'withdraw' | 'deposit') => void;
}

export function OperationToggle({ value, onChange }: OperationToggleProps) {
    return (
        <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
            <button
                onClick={() => onChange('withdraw')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${value === 'withdraw'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
            >
                Withdraw
            </button>
            <button
                onClick={() => onChange('deposit')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${value === 'deposit'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
            >
                Deposit
            </button>
        </div>
    );
}
