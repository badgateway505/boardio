/**
 * Backend API Endpoint for Sumsub Access Token Generation
 * This file should be placed in your backend server (Node.js/Express)
 * 
 * IMPORTANT: This MUST run on the backend, never in the browser!
 */

import crypto from 'crypto';

// Load from environment variables - NEVER hardcode these!
const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN;
const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY;
const SUMSUB_BASE_URL = 'https://api.sumsub.com';

if (!SUMSUB_APP_TOKEN || !SUMSUB_SECRET_KEY) {
    throw new Error('Sumsub credentials not configured. Set SUMSUB_APP_TOKEN and SUMSUB_SECRET_KEY environment variables.');
}

/**
 * Create HMAC SHA256 signature for Sumsub API authentication
 * As per: https://docs.sumsub.com/reference/authentication
 */
function createSumsubSignature(
    method: string,
    url: string,
    timestamp: number,
    body: string = ''
): string {
    // Signature = HMAC-SHA256(secret_key, timestamp + method + url + body)
    const data = `${timestamp}${method}${url}${body}`;

    return crypto
        .createHmac('sha256', SUMSUB_SECRET_KEY)
        .update(data)
        .digest('hex');
}

/**
 * Generate Sumsub access token with proper authentication
 * 
 * @param userId - Unique user identifier
 * @param levelName - Verification level (e.g., 'docs', 'basic-kyc-level')
 * @param ttlInSecs - Token time-to-live in seconds (default: 600 = 10 minutes)
 * @returns Access token and user ID
 */
export async function generateSumsubAccessToken(
    userId: string,
    levelName: string,
    ttlInSecs: number = 600
): Promise<{ token: string; userId: string }> {

    // Build the API endpoint URL
    const method = 'POST';
    const path = `/resources/accessTokens?userId=${encodeURIComponent(userId)}&ttlInSecs=${ttlInSecs}&levelName=${encodeURIComponent(levelName)}`;

    // Generate timestamp (Unix time in seconds)
    const timestamp = Math.floor(Date.now() / 1000);

    // Create HMAC signature
    const signature = createSumsubSignature(method, path, timestamp);

    // Make authenticated request to Sumsub API
    const response = await fetch(`${SUMSUB_BASE_URL}${path}`, {
        method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-App-Token': SUMSUB_APP_TOKEN,
            'X-App-Access-Sig': signature,
            'X-App-Access-Ts': timestamp.toString(),
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Sumsub API error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
        });
        throw new Error(`Sumsub API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return {
        token: data.token,
        userId: data.userId,
    };
}

/**
 * Express.js route handler example
 */
export async function handleAccessTokenRequest(req: any, res: any) {
    try {
        // Validate request
        const { userId, levelName } = req.body;

        if (!userId || !levelName) {
            return res.status(400).json({
                error: 'Missing required fields: userId and levelName'
            });
        }

        // TODO: Add your authentication/authorization here
        // Verify that the requesting user is authenticated and authorized
        // to generate a token for this userId

        // Generate access token with proper Sumsub authentication
        const result = await generateSumsubAccessToken(userId, levelName);

        res.json(result);
    } catch (error) {
        console.error('Error generating access token:', error);
        res.status(500).json({
            error: 'Failed to generate access token',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

/**
 * Example: Express.js route setup
 * 
 * import express from 'express';
 * import { handleAccessTokenRequest } from './sumsubBackend';
 * 
 * const app = express();
 * app.use(express.json());
 * 
 * app.post('/api/sumsub/access-token', handleAccessTokenRequest);
 * 
 * app.listen(3001, () => {
 *   console.log('Server running on port 3001');
 * });
 */

/**
 * Example: Next.js API route (pages/api/sumsub/access-token.ts)
 * 
 * import type { NextApiRequest, NextApiResponse } from 'next';
 * import { generateSumsubAccessToken } from '@/lib/sumsubBackend';
 * 
 * export default async function handler(
 *   req: NextApiRequest,
 *   res: NextApiResponse
 * ) {
 *   if (req.method !== 'POST') {
 *     return res.status(405).json({ error: 'Method not allowed' });
 *   }
 * 
 *   try {
 *     const { userId, levelName } = req.body;
 *     const result = await generateSumsubAccessToken(userId, levelName);
 *     res.json(result);
 *   } catch (error) {
 *     res.status(500).json({ error: 'Failed to generate token' });
 *   }
 * }
 */
