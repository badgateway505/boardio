// ============================================================================
// ASSET TYPES
// ============================================================================

export const ASSET_SYMBOLS = [
    'BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'LTC'
] as const;

export type AssetSymbol = typeof ASSET_SYMBOLS[number];

// ============================================================================
// TRAVEL RULE TYPES
// ============================================================================

export type TravelRuleMode = 'API' | 'SDK';

export interface TravelRulePayload {
    transactionType: 'withdraw' | 'deposit';
    asset: AssetSymbol;
    amount: number;
    senderName?: string;
    senderAddress?: string;
    recipientName?: string;
    recipientAddress?: string;
    txHash?: string;
}

export interface TravelRuleApiResult {
    success: boolean;
    message: string;
}

export interface TravelRuleSdkResult {
    success: boolean;
    message: string;
}

// ============================================================================
// CLIENT & USER TYPES
// ============================================================================

export interface Client {
    clientId: string;
    name: string;
    userIds: string[];
}

export interface User {
    userId: string;
    clientId: string;
    firstName: string;
    lastName: string;
    sumsubId?: string;
    balances: Record<AssetSymbol, number>;
}

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export type TransactionType = 'withdraw' | 'deposit';
export type TransactionStatus = 'Completed' | 'Pending';

export interface Transaction {
    id: string;
    clientId: string;
    userId: string;
    type: TransactionType;
    asset: AssetSymbol;
    amount: number;
    createdAt: string; // ISO string
    status: TransactionStatus;
    senderName?: string;
    senderAddress?: string;
    recipientName?: string;
    recipientAddress?: string;
    txHash?: string;
    travelRuleModeAtSubmission: TravelRuleMode;
}

export interface TransactionDraft {
    type: TransactionType;
    asset: AssetSymbol;
    amount: number;
    senderName?: string;
    senderAddress?: string;
    recipientName?: string;
    recipientAddress?: string;
    txHash?: string;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface WithdrawFormData {
    recipientAddress: string;
    recipientName: string;
    amount: string;
    currency: AssetSymbol;
}

export interface DepositFormData {
    senderName: string;
    senderAddress: string;
    txHash: string;
    amount: string;
    currency: AssetSymbol;
}

// ============================================================================
// FEE CONFIGURATION
// ============================================================================

export const TRANSACTION_FEES: Record<AssetSymbol, number> = {
    BTC: 0.0001,
    ETH: 0.001,
    USDT: 1,
    USDC: 1,
    BNB: 0.01,
    SOL: 0.01,
    XRP: 0.1,
    ADA: 1,
    DOGE: 10,
    LTC: 0.01,
};
