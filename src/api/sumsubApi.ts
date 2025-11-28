// API endpoint handlers for Sumsub integration
// This file would typically be in your backend (e.g., Express.js, Next.js API routes)
// For this demo, we'll create a mock implementation

import { generateSumsubAccessToken, getMockAccessToken } from '../lib/services/sumsubService';

/**
 * POST /api/sumsub/access-token
 * Generate Sumsub access token for a user
 */
export async function handleAccessTokenRequest(
    userId: string,
    levelName: string
): Promise<{ token: string; userId: string }> {
    try {
        // In production, validate the request and user authentication here

        // For demo purposes, use mock token
        // In production, uncomment the line below and use real Sumsub API
        // const result = await generateSumsubAccessToken({ userId, levelName });

        const result = await getMockAccessToken(userId);

        return result;
    } catch (error) {
        console.error('Error in handleAccessTokenRequest:', error);
        throw new Error('Failed to generate access token');
    }
}

/**
 * Mock API server for development
 * In production, replace this with your actual backend API
 */
export const mockApiServer = {
    async post(url: string, body: any): Promise<any> {
        if (url === '/api/sumsub/access-token') {
            const { userId, levelName } = body;
            return handleAccessTokenRequest(userId, levelName);
        }

        throw new Error(`Unknown endpoint: ${url}`);
    },
};
