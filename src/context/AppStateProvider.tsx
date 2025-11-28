import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
    Client,
    User,
    Transaction,
    TransactionDraft,
    TravelRuleMode,
} from '../lib/types';
import { DEMO_CLIENTS, DEMO_USERS } from '../lib/dataSeed';
import { updateBalance, hasSufficientBalance } from '../lib/services/balancesService';
import { createTransaction, getTransactionsForUser } from '../lib/services/transactionsService';
import { processTravelRule } from '../lib/services/travelRuleService';

// ============================================================================
// CONTEXT TYPES
// ============================================================================

interface AppState {
    // Selection state
    selectedClientId: string | null;
    selectedUserId: string | null;
    travelRuleMode: TravelRuleMode;

    // Data
    clients: Client[];
    users: User[];
    transactions: Transaction[];

    // Computed
    currentUser: User | null;
    availableUsers: User[];
    currentUserTransactions: Transaction[];
}

interface AppActions {
    selectClient: (clientId: string) => void;
    selectUser: (userId: string) => void;
    setTravelRuleMode: (mode: TravelRuleMode) => void;
    submitWithdraw: (draft: TransactionDraft) => Promise<void>;
    submitDeposit: (draft: TransactionDraft) => Promise<void>;
    addUser: (firstName: string, lastName: string, userId: string) => void;
    addClient: (clientName: string, clientId: string) => void;
    updateUserSumsubId: (userId: string, sumsubId: string) => void;
}

type AppContextType = AppState & AppActions;

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const AppContext = createContext<AppContextType | null>(null);

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within AppStateProvider');
    }
    return context;
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface AppStateProviderProps {
    children: React.ReactNode;
}

export function AppStateProvider({ children }: AppStateProviderProps) {
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [travelRuleMode, setTravelRuleMode] = useState<TravelRuleMode>('API');
    const [clients, setClients] = useState<Client[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Load clients and users from backend on mount
    useEffect(() => {
        // Load clients
        fetch('http://localhost:3001/api/clients')
            .then(res => res.json())
            .then(data => {
                setClients(data)
                // If no clients exist, load demo data
                if (data.length === 0) {
                    setClients(DEMO_CLIENTS)
                }
            })
            .catch(err => {
                console.error('Failed to load clients:', err)
                // Fallback to demo data on error
                setClients(DEMO_CLIENTS)
            })

        // Load users
        fetch('http://localhost:3001/api/users')
            .then(res => res.json())
            .then(data => {
                setUsers(data)
                // If no users exist, load demo data
                if (data.length === 0) {
                    setUsers(DEMO_USERS)
                }
            })
            .catch(err => {
                console.error('Failed to load users:', err)
                // Fallback to demo data on error
                setUsers(DEMO_USERS)
            })
    }, [])

    // Computed values
    const currentUser = selectedUserId
        ? users.find((u) => u.userId === selectedUserId) || null
        : null;
    const availableUsers = selectedClientId
        ? users.filter((u) => u.clientId === selectedClientId)
        : [];
    const currentUserTransactions =
        selectedClientId && selectedUserId
            ? getTransactionsForUser(transactions, selectedClientId, selectedUserId)
            : [];

    // Actions
    const selectClient = useCallback((clientId: string) => {
        setSelectedClientId(clientId);
        setSelectedUserId(null); // Reset user selection when client changes
    }, []);

    const selectUser = useCallback((userId: string) => {
        setSelectedUserId(userId);
    }, []);

    const submitWithdraw = useCallback(
        async (draft: TransactionDraft) => {
            if (!selectedClientId || !selectedUserId || !currentUser) {
                throw new Error('No user selected');
            }

            // Validate sufficient balance
            if (!hasSufficientBalance(currentUser, draft.asset, draft.amount)) {
                throw new Error('Insufficient balance');
            }

            // Process Travel Rule
            await processTravelRule(draft, travelRuleMode);

            // Update balance (subtract)
            const updatedUser = updateBalance(currentUser, draft.asset, -draft.amount);
            setUsers((prev) =>
                prev.map((u) => (u.userId === selectedUserId ? updatedUser : u))
            );

            // Create transaction
            const newTransaction = createTransaction(
                selectedClientId,
                selectedUserId,
                draft,
                travelRuleMode
            );
            setTransactions((prev) => [newTransaction, ...prev]);
        },
        [selectedClientId, selectedUserId, currentUser, travelRuleMode]
    );

    const submitDeposit = useCallback(
        async (draft: TransactionDraft) => {
            if (!selectedClientId || !selectedUserId || !currentUser) {
                throw new Error('No user selected');
            }

            // Process Travel Rule
            await processTravelRule(draft, travelRuleMode);

            // Update balance (add)
            const updatedUser = updateBalance(currentUser, draft.asset, draft.amount);
            setUsers((prev) =>
                prev.map((u) => (u.userId === selectedUserId ? updatedUser : u))
            );

            // Create transaction
            const newTransaction = createTransaction(
                selectedClientId,
                selectedUserId,
                draft,
                travelRuleMode
            );
            setTransactions((prev) => [newTransaction, ...prev]);
        },
        [selectedClientId, selectedUserId, currentUser, travelRuleMode]
    );

    const addUser = useCallback(
        async (firstName: string, lastName: string, userId: string) => {
            if (!selectedClientId) {
                throw new Error('No client selected');
            }

            // Check if userId already exists
            const existingUser = users.find((u) => u.userId === userId);
            if (existingUser) {
                throw new Error('User ID already exists');
            }

            // Create new user with zero balances
            const newUser: User = {
                userId,
                clientId: selectedClientId,
                firstName,
                lastName,
                balances: {
                    BTC: 0,
                    ETH: 0,
                    USDT: 0,
                    USDC: 0,
                    BNB: 0,
                    SOL: 0,
                    XRP: 0,
                    ADA: 0,
                    DOGE: 0,
                    LTC: 0,
                },
            };

            // Save to backend
            try {
                const response = await fetch('http://localhost:3001/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newUser)
                })
                const savedUser = await response.json()

                // Update local state
                setUsers((prev) => [...prev, savedUser]);
                setSelectedUserId(userId);
            } catch (error) {
                console.error('Failed to save user to backend:', error)
                // Still update local state even if backend fails
                setUsers((prev) => [...prev, newUser]);
                setSelectedUserId(userId);
            }
        },
        [selectedClientId, users]
    );

    const updateUserSumsubId = useCallback(async (userId: string, sumsubId: string) => {
        // Update backend
        try {
            await fetch(`http://localhost:3001/api/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sumsubId })
            })
        } catch (error) {
            console.error('Failed to update user sumsubId in backend:', error)
        }

        // Update local state
        setUsers((prev) =>
            prev.map((u) => (u.userId === userId ? { ...u, sumsubId } : u))
        );
    }, []);

    const addClient = useCallback(
        async (clientName: string, clientId: string) => {
            // Check if clientId already exists
            const existingClient = clients.find((c) => c.clientId === clientId);
            if (existingClient) {
                throw new Error('Client ID already exists');
            }

            // Create new client with empty user list
            const newClient: Client = {
                clientId,
                name: clientName,
                userIds: [],
            };

            // Save to backend
            try {
                const response = await fetch('http://localhost:3001/api/clients', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newClient)
                })
                const savedClient = await response.json()

                // Update local state
                setClients((prev) => [...prev, savedClient]);
                setSelectedClientId(savedClient.clientId);
            } catch (error) {
                console.error('Failed to save client to backend:', error)
                // Still update local state even if backend fails
                setClients((prev) => [...prev, newClient]);
                setSelectedClientId(newClient.clientId);
            }
        },
        [clients]
    );

    const value: AppContextType = {
        // State
        selectedClientId,
        selectedUserId,
        travelRuleMode,
        clients,
        users,
        transactions,
        currentUser,
        availableUsers,
        currentUserTransactions,

        // Actions
        selectClient,
        selectUser,
        setTravelRuleMode,
        submitWithdraw,
        submitDeposit,
        addUser,
        addClient,
        updateUserSumsubId,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
