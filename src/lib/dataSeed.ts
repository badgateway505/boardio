import { Client, User, AssetSymbol } from './types';

// ============================================================================
// DEMO CLIENTS
// ============================================================================

export const DEMO_CLIENTS: Client[] = [
    {
        clientId: 'client_a',
        name: 'Alpha Trading Corp',
        userIds: ['user_a1', 'user_a2', 'user_a3'],
    },
    {
        clientId: 'client_b',
        name: 'Beta Investment LLC',
        userIds: ['user_b1', 'user_b2'],
    },
    {
        clientId: 'client_c',
        name: 'Gamma Capital Partners',
        userIds: ['user_c1', 'user_c2', 'user_c3'],
    },
];

// ============================================================================
// DEMO USERS
// ============================================================================

export const DEMO_USERS: User[] = [
    // Client A users
    {
        userId: 'user_a1',
        clientId: 'client_a',
        firstName: 'Alice',
        lastName: 'Anderson',
        balances: {
            BTC: 2.5,
            ETH: 15.3,
            USDT: 50000,
            USDC: 25000,
            BNB: 100,
            SOL: 500,
            XRP: 10000,
            ADA: 20000,
            DOGE: 50000,
            LTC: 150,
        },
    },
    {
        userId: 'user_a2',
        clientId: 'client_a',
        firstName: 'Aaron',
        lastName: 'Adams',
        balances: {
            BTC: 0.5,
            ETH: 5.0,
            USDT: 10000,
            USDC: 5000,
            BNB: 25,
            SOL: 100,
            XRP: 2000,
            ADA: 5000,
            DOGE: 10000,
            LTC: 30,
        },
    },
    {
        userId: 'user_a3',
        clientId: 'client_a',
        firstName: 'Amy',
        lastName: 'Armstrong',
        balances: {
            BTC: 1.0,
            ETH: 8.5,
            USDT: 30000,
            USDC: 15000,
            BNB: 50,
            SOL: 250,
            XRP: 5000,
            ADA: 10000,
            DOGE: 25000,
            LTC: 75,
        },
    },
    // Client B users
    {
        userId: 'user_b1',
        clientId: 'client_b',
        firstName: 'Bob',
        lastName: 'Brown',
        balances: {
            BTC: 5.0,
            ETH: 30.0,
            USDT: 100000,
            USDC: 50000,
            BNB: 200,
            SOL: 1000,
            XRP: 20000,
            ADA: 40000,
            DOGE: 100000,
            LTC: 300,
        },
    },
    {
        userId: 'user_b2',
        clientId: 'client_b',
        firstName: 'Bella',
        lastName: 'Baker',
        balances: {
            BTC: 0.25,
            ETH: 2.5,
            USDT: 5000,
            USDC: 2500,
            BNB: 10,
            SOL: 50,
            XRP: 1000,
            ADA: 2500,
            DOGE: 5000,
            LTC: 15,
        },
    },
    // Client C users
    {
        userId: 'user_c1',
        clientId: 'client_c',
        firstName: 'Charlie',
        lastName: 'Chen',
        balances: {
            BTC: 3.0,
            ETH: 20.0,
            USDT: 75000,
            USDC: 35000,
            BNB: 150,
            SOL: 750,
            XRP: 15000,
            ADA: 30000,
            DOGE: 75000,
            LTC: 225,
        },
    },
    {
        userId: 'user_c2',
        clientId: 'client_c',
        firstName: 'Chloe',
        lastName: 'Clark',
        balances: {
            BTC: 1.5,
            ETH: 10.0,
            USDT: 40000,
            USDC: 20000,
            BNB: 75,
            SOL: 400,
            XRP: 8000,
            ADA: 15000,
            DOGE: 40000,
            LTC: 120,
        },
    },
    {
        userId: 'user_c3',
        clientId: 'client_c',
        firstName: 'Chris',
        lastName: 'Cooper',
        balances: {
            BTC: 0.75,
            ETH: 6.0,
            USDT: 20000,
            USDC: 10000,
            BNB: 40,
            SOL: 200,
            XRP: 4000,
            ADA: 8000,
            DOGE: 20000,
            LTC: 60,
        },
    },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getClientById(clientId: string): Client | undefined {
    return DEMO_CLIENTS.find((c) => c.clientId === clientId);
}

export function getUserById(userId: string): User | undefined {
    return DEMO_USERS.find((u) => u.userId === userId);
}

export function getUsersByClientId(clientId: string): User[] {
    return DEMO_USERS.filter((u) => u.clientId === clientId);
}
