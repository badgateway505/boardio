import React from 'react';
import { TravelRuleMode } from '../lib/types';
import { useAppContext } from '../context/AppStateProvider';

export function TravelRuleModeToggle() {
    const { travelRuleMode, setTravelRuleMode } = useAppContext();

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">Travel Rule Integration</h3>
                    <p className="text-xs text-gray-600 mt-1">
                        Select how Travel Rule compliance will be handled
                    </p>
                </div>
                <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                    <button
                        onClick={() => setTravelRuleMode('API')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${travelRuleMode === 'API'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        API
                    </button>
                    <button
                        onClick={() => setTravelRuleMode('SDK')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${travelRuleMode === 'SDK'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        SDK
                    </button>
                </div>
            </div>
        </div>
    );
}
