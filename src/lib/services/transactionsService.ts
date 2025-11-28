import { Transaction, TransactionDraft, TravelRuleMode } from '../types';

let transactionIdCounter = 1;

/**
 * Creates a new transaction from a draft.
 */
export function createTransaction(
    clientId: string,
    userId: string,
    draft: TransactionDraft,
    travelRuleMode: TravelRuleMode
): Transaction {
    const id = `tx_${String(transactionIdCounter++).padStart(6, '0')}`;

    return {
        id,
        clientId,
        userId,
        type: draft.type,
        asset: draft.asset,
        amount: draft.amount,
        createdAt: new Date().toISOString(),
        status: 'Completed',
        senderName: draft.senderName,
        senderAddress: draft.senderAddress,
        recipientName: draft.recipientName,
        recipientAddress: draft.recipientAddress,
        txHash: draft.txHash,
        travelRuleModeAtSubmission: travelRuleMode,
    };
}

/**
 * Filters transactions by client and user.
 */
export function getTransactionsForUser(
    transactions: Transaction[],
    clientId: string,
    userId: string
): Transaction[] {
    return transactions.filter(
        (tx) => tx.clientId === clientId && tx.userId === userId
    );
}
