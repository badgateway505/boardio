/**
 * Simple Express.js Backend Server for Sumsub Integration
 * 
 * This is a minimal backend server that handles Sumsub access token generation
 * with proper HMAC authentication.
 * 
 * To run this server:
 * 1. npm install express cors dotenv
 * 2. Create .env file with your Sumsub credentials
 * 3. node backend-example/server.js
 */

import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Sumsub configuration
const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN;
const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY;
const SUMSUB_BASE_URL = 'https://api.sumsub.com';

// Validate configuration
if (!SUMSUB_APP_TOKEN || !SUMSUB_SECRET_KEY) {
    console.error('❌ ERROR: Sumsub credentials not configured!');
    console.error('Please set SUMSUB_APP_TOKEN and SUMSUB_SECRET_KEY in your .env file');
    process.exit(1);
}

/**
 * Create HMAC SHA256 signature for Sumsub API
 * https://docs.sumsub.com/reference/authentication
 */
function createSumsubSignature(method, url, timestamp, body = '') {
    const data = `${timestamp}${method}${url}${body}`;
    return crypto
        .createHmac('sha256', SUMSUB_SECRET_KEY)
        .update(data)
        .digest('hex');
}

/**
 * POST /api/sumsub/access-token
 * Generate Sumsub access token with proper authentication
 */
app.post('/api/sumsub/access-token', async (req, res) => {
    try {
        const { userId, levelName } = req.body;

        // Validate request
        if (!userId || !levelName) {
            return res.status(400).json({
                error: 'Missing required fields: userId and levelName'
            });
        }

        console.log(`📝 Generating access token for user: ${userId}, level: ${levelName}`);

        // Build API request
        const method = 'POST';
        const ttlInSecs = 600; // 10 minutes
        // User requested endpoint for SDK
        const path = '/resources/accessTokens/sdk';
        const timestamp = Math.floor(Date.now() / 1000);

        // Request body
        const requestBody = JSON.stringify({
            userId,
            levelName,
            ttlInSecs
        });

        // Create signature including body
        const signature = createSumsubSignature(method, path, timestamp, requestBody);

        // Call Sumsub API
        const response = await fetch(`${SUMSUB_BASE_URL}${path}`, {
            method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-App-Token': SUMSUB_APP_TOKEN,
                'X-App-Access-Sig': signature,
                'X-App-Access-Ts': timestamp.toString(),
            },
            body: requestBody,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Sumsub API error:', response.status, errorText);
            return res.status(response.status).json({
                error: 'Sumsub API error',
                details: errorText
            });
        }

        const data = await response.json();
        console.log('✅ Access token generated successfully');

        res.json({
            token: data.token,
            userId: data.userId
        });

    } catch (error) {
        console.error('❌ Error generating access token:', error);
        res.status(500).json({
            error: 'Failed to generate access token',
            message: error.message
        });
    }
});

/**
 * POST /api/sumsub/create-applicant
 * Create Sumsub applicant with proper authentication
 */
app.post('/api/sumsub/create-applicant', async (req, res) => {
    try {
        const { externalUserId, firstName, lastName } = req.body;

        // Validate request
        if (!externalUserId || !firstName || !lastName) {
            return res.status(400).json({
                error: 'Missing required fields: externalUserId, firstName, lastName'
            });
        }

        console.log(`👤 Creating applicant for user: ${externalUserId} (${firstName} ${lastName})`);

        // Build API request
        const method = 'POST';
        const levelName = 'docs';
        const path = `/resources/applicants?levelName=${encodeURIComponent(levelName)}`;
        const timestamp = Math.floor(Date.now() / 1000);

        // Request body
        const requestBody = JSON.stringify({
            externalUserId,
            fixedInfo: {
                firstName,
                lastName
            }
        });

        // IMPORTANT: Include body in signature for POST requests with body
        const signature = createSumsubSignature(method, path, timestamp, requestBody);

        // Call Sumsub API
        const response = await fetch(`${SUMSUB_BASE_URL}${path}`, {
            method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-App-Token': SUMSUB_APP_TOKEN,
                'X-App-Access-Sig': signature,
                'X-App-Access-Ts': timestamp.toString(),
            },
            body: requestBody,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Sumsub API error:', response.status, errorText);
            return res.status(response.status).json({
                error: 'Sumsub API error',
                details: errorText
            });
        }

        const data = await response.json();
        console.log('✅ Applicant created successfully:', data.id);

        res.json({
            applicantId: data.id,
            externalUserId: data.externalUserId
        });

    } catch (error) {
        console.error('❌ Error creating applicant:', error);
        res.status(500).json({
            error: 'Failed to create applicant',
            message: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Sumsub backend server is running',
        configured: !!(SUMSUB_APP_TOKEN && SUMSUB_SECRET_KEY)
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 Sumsub Backend Server Started');
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`✅ Sumsub credentials configured: ${!!(SUMSUB_APP_TOKEN && SUMSUB_SECRET_KEY)}`);
    console.log('\nEndpoints:');
    console.log(`  POST http://localhost:${PORT}/api/sumsub/access-token`);
    console.log(`  GET  http://localhost:${PORT}/health`);
});
