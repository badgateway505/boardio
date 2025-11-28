import { useEffect, useRef, useState } from 'react';
import { generateSumsubAccessToken } from '../lib/services/sumsubService';

interface KycModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onSuccess?: () => void;
}

export function KycModal({ isOpen, onClose, userId, onSuccess }: KycModalProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !userId) return;

        const launchSumsubSdk = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Get access token from our backend
                const getAccessToken = async () => {
                    try {
                        return await generateSumsubAccessToken({
                            userId,
                            levelName: 'docs',
                        });
                    } catch (err) {
                        console.error('Error fetching access token:', err);
                        throw new Error('Failed to get access token');
                    }
                };

                const { token } = await getAccessToken();

                // Load Sumsub SDK script if not already loaded
                if (!window.snsWebSdk) {
                    await loadSumsubScript();
                }

                // Launch Sumsub SDK
                const snsWebSdkInstance = window.snsWebSdk
                    .init(token, async () => {
                        // Token expiration handler - get a new token
                        const newToken = await getAccessToken();
                        return newToken.token;
                    })
                    .withConf({
                        lang: 'en',
                        email: userId,
                        theme: 'light',
                    })
                    .withOptions({ addViewportTag: false, adaptIframeHeight: true })
                    .on('idCheck.onStepCompleted', (payload: any) => {
                        console.log('Step completed:', payload);
                    })
                    .on('idCheck.onApplicantSubmitted', (payload: any) => {
                        console.log('Applicant submitted:', payload);
                        if (onSuccess) {
                            onSuccess();
                        }
                    })
                    .on('idCheck.onError', (error: any) => {
                        console.error('Sumsub error:', error);
                        setError('An error occurred during verification');
                    })
                    .build();

                // Mount SDK to container
                if (containerRef.current) {
                    snsWebSdkInstance.launch(containerRef.current);
                }

                setIsLoading(false);
            } catch (err) {
                console.error('Error launching Sumsub SDK:', err);
                setError(err instanceof Error ? err.message : 'Failed to launch verification');
                setIsLoading(false);
            }
        };

        launchSumsubSdk();
    }, [isOpen, userId, onSuccess]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">KYC Verification</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    {isLoading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading verification...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Sumsub SDK will be mounted here */}
                    <div ref={containerRef} id="sumsub-websdk-container"></div>
                </div>
            </div>
        </div>
    );
}

// Helper function to load Sumsub script
function loadSumsubScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (document.getElementById('sumsub-script')) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.id = 'sumsub-script';
        script.src = 'https://static.sumsub.com/idensic/static/sns-websdk-builder.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Sumsub SDK script'));
        document.body.appendChild(script);
    });
}

// Type declaration for Sumsub SDK
declare global {
    interface Window {
        snsWebSdk: any;
    }
}
