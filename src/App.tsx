import React, { useState } from 'react';
import { AppStateProvider, useAppContext } from './context/AppStateProvider';
import { ClientSelector } from './components/ClientSelector';
import { UserSelector } from './components/UserSelector';
import { OperationToggle } from './components/OperationToggle';
import { TravelRuleModeToggle } from './components/TravelRuleModeToggle';
import { UserInfoPanel } from './components/UserInfoPanel';
import { WithdrawForm } from './components/WithdrawForm';
import { DepositForm } from './components/DepositForm';
import { TransactionHistoryTable } from './components/TransactionHistoryTable';
import { AddUserModal } from './components/AddUserModal';
import { AddClientModal } from './components/AddClientModal';
import { KycModal } from './components/KycModal';
import { useToast } from './components/Toast';

function AppContent() {
    const [operation, setOperation] = useState<'withdraw' | 'deposit'>('withdraw');
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
    const [isKycModalOpen, setIsKycModalOpen] = useState(false);
    const { showToast, ToastComponent } = useToast();
    const { addUser, addClient, selectedClientId, currentUser, updateUserSumsubId } = useAppContext();

    const handleSuccess = () => {
        const message =
            operation === 'withdraw'
                ? 'Withdrawal submitted successfully'
                : 'Deposit recorded successfully';
        showToast(message, 'success');
    };

    const handleError = (message: string) => {
        showToast(message, 'error');
    };

    const handleAddUser = (firstName: string, lastName: string, userId: string) => {
        try {
            addUser(firstName, lastName, userId);
            setIsAddUserModalOpen(false);
            showToast('User created successfully', 'success');
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to create user', 'error');
        }
    };

    const handleAddClient = (clientName: string, clientId: string) => {
        try {
            addClient(clientName, clientId);
            setIsAddClientModalOpen(false);
            showToast('Client created successfully', 'success');
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to create client', 'error');
        }
    };

    const handleKycSuccess = () => {
        showToast('KYC verification completed successfully', 'success');
        setIsKycModalOpen(false);
    };

    const handlePushToSumsub = async () => {
        if (!currentUser) return;

        try {
            // Call backend API (proxied via Vite)
            const response = await fetch('/api/sumsub/create-applicant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    externalUserId: currentUser.userId,
                    firstName: currentUser.firstName,
                    lastName: currentUser.lastName,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                updateUserSumsubId(currentUser.userId, data.applicantId);
                showToast(`Applicant created in Sumsub (ID: ${data.applicantId})`, 'success');
            } else {
                // Try to get error details from response
                const errorText = await response.text();
                let errorMessage = 'Failed to create applicant';
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.error || errorJson.message || errorMessage;
                } catch (e) {
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Sumsub API Error:', error);
            showToast(
                error instanceof Error ? error.message : 'Failed to push to Sumsub',
                'error'
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {ToastComponent}

            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Transact</h1>
                    <p className="text-sm text-gray-600">Crypto Exchange Demo</p>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Selectors */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <div className="flex flex-wrap gap-6">
                        <ClientSelector onAddClientClick={() => setIsAddClientModalOpen(true)} />
                        <UserSelector onAddUserClick={() => setIsAddUserModalOpen(true)} />
                    </div>
                </div>

                {/* Travel Rule Mode */}
                <div className="mb-6">
                    <TravelRuleModeToggle />
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Left Column: User Info */}
                    <div className="lg:col-span-1">
                        <UserInfoPanel
                            onVerifyClick={() => setIsKycModalOpen(true)}
                            onPushToSumsub={handlePushToSumsub}
                        />
                    </div>

                    {/* Right Column: Forms */}
                    <div className="lg:col-span-2">
                        <div className="mb-4">
                            <OperationToggle value={operation} onChange={setOperation} />
                        </div>
                        {operation === 'withdraw' ? (
                            <WithdrawForm onSuccess={handleSuccess} onError={handleError} />
                        ) : (
                            <DepositForm onSuccess={handleSuccess} onError={handleError} />
                        )}
                    </div>
                </div>

                {/* Transaction History */}
                <TransactionHistoryTable />
            </main>

            {/* Add User Modal */}
            <AddUserModal
                isOpen={isAddUserModalOpen}
                onClose={() => setIsAddUserModalOpen(false)}
                onSubmit={handleAddUser}
                clientId={selectedClientId}
            />

            {/* Add Client Modal */}
            <AddClientModal
                isOpen={isAddClientModalOpen}
                onClose={() => setIsAddClientModalOpen(false)}
                onSubmit={handleAddClient}
            />

            {/* KYC Modal */}
            {currentUser && (
                <KycModal
                    isOpen={isKycModalOpen}
                    onClose={() => setIsKycModalOpen(false)}
                    userId={currentUser.userId}
                    onSuccess={handleKycSuccess}
                />
            )}
        </div>
    );
}

function App() {
    return (
        <AppStateProvider>
            <AppContent />
        </AppStateProvider>
    );
}

export default App;
