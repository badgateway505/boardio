// Sumsub API service for browser environment
// Note: Token generation MUST be done on the backend in production

interface AccessTokenRequest {
    userId: string;
    levelName: string;
    ttlInSecs?: number;
}

interface AccessTokenResponse {
    token: string;
    userId: string;
}

/**
 * Mock function for development - returns a fake token
 * In production, this should call your actual backend API
 */
export async function getMockAccessToken(userId: string): Promise<AccessTokenResponse> {
    console.warn('Using mock access token - implement real backend endpoint for production');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
        token: 'mock-token-' + userId + '-' + Date.now(),
        userId,
    };
}

/**
 * Call your backend API to generate a real Sumsub access token
 * This is a placeholder - implement your actual backend endpoint
 */
export async function generateSumsubAccessToken(
    request: AccessTokenRequest
): Promise<AccessTokenResponse> {
    const { userId, levelName, ttlInSecs = 600 } = request;

    // In production, call your backend API
    const response = await fetch('/api/sumsub/access-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId,
            levelName,
            ttlInSecs,
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to generate access token: ${response.status}`);
    }

    return await response.json();
}
