import {
    TravelRuleMode,
    TravelRulePayload,
    TravelRuleApiResult,
    TravelRuleSdkResult,
    TransactionDraft,
} from '../types';

// ============================================================================
// TRAVEL RULE SERVICE (STUB IMPLEMENTATION)
// ============================================================================

/**
 * Prepares a Travel Rule payload from a transaction draft.
 */
export function preparePayload(draft: TransactionDraft): TravelRulePayload {
    return {
        transactionType: draft.type,
        asset: draft.asset,
        amount: draft.amount,
        senderName: draft.senderName,
        senderAddress: draft.senderAddress,
        recipientName: draft.recipientName,
        recipientAddress: draft.recipientAddress,
        txHash: draft.txHash,
    };
}

/**
 * Submits Travel Rule data via API mode (stub).
 * In production, this would make an HTTP request to your backend
 * which then communicates with Sumsub's Travel Rule API.
 */
export async function submitViaApi(
    payload: TravelRulePayload
): Promise<TravelRuleApiResult> {
    console.log('🔵 [Travel Rule API Mode]');
    console.log('Payload that would be sent to Sumsub API:', payload);
    console.log('---');

    // Simulate async API call
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
        success: true,
        message: 'Travel Rule API submission successful (stub)',
    };
}

/**
 * Launches the Sumsub SDK flow for Travel Rule (stub).
 * In production, this would initialize and launch the Sumsub SDK
 * which handles the Travel Rule flow in a modal/iframe.
 */
export async function launchSdkFlow(
    payload: TravelRulePayload
): Promise<TravelRuleSdkResult> {
    console.log('🟢 [Travel Rule SDK Mode]');
    console.log('Payload that would be passed to Sumsub SDK:', payload);
    console.log('In production, this would launch the Sumsub SDK modal.');
    console.log('---');

    // Simulate async SDK flow
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
        success: true,
        message: 'Travel Rule SDK flow completed (stub)',
    };
}

/**
 * Main entry point for Travel Rule processing.
 * Routes to the appropriate handler based on the selected mode.
 */
export async function processTravelRule(
    draft: TransactionDraft,
    mode: TravelRuleMode
): Promise<TravelRuleApiResult | TravelRuleSdkResult> {
    const payload = preparePayload(draft);

    if (mode === 'API') {
        return submitViaApi(payload);
    } else {
        return launchSdkFlow(payload);
    }
}
