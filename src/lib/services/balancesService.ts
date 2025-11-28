import { User, AssetSymbol } from '../types';

/**
 * Updates a user's balance for a specific asset.
 * Returns the updated user object.
 */
export function updateBalance(
    user: User,
    asset: AssetSymbol,
    delta: number
): User {
    const currentBalance = user.balances[asset] || 0;
    const newBalance = currentBalance + delta;

    return {
        ...user,
        balances: {
            ...user.balances,
            [asset]: Math.max(0, newBalance), // Prevent negative balances
        },
    };
}

/**
 * Checks if a user has sufficient balance for a withdrawal.
 */
export function hasSufficientBalance(
    user: User,
    asset: AssetSymbol,
    amount: number
): boolean {
    const currentBalance = user.balances[asset] || 0;
    return currentBalance >= amount;
}

/**
 * Gets the available balance for a specific asset.
 */
export function getAvailableBalance(
    user: User,
    asset: AssetSymbol
): number {
    return user.balances[asset] || 0;
}
