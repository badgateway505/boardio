# Sumsub KYC Integration Guide

This document explains how to integrate Sumsub's KYC verification into the Transact application.

## Overview

The application includes a "Verify me" button in the User Information panel that launches Sumsub's Web SDK for identity verification.

## Current Implementation (Demo Mode)

The current implementation uses **mock tokens** for demonstration purposes. The KYC modal will open and attempt to load the Sumsub SDK, but it won't work without real credentials.

## Production Setup

To enable real KYC verification, follow these steps:

### 1. Get Sumsub Credentials

1. Sign up for a Sumsub account at https://sumsub.com/
2. Get your API credentials from the Sumsub dashboard:
   - **App Token** (`X-App-Token`)
   - **Secret Key** (for HMAC signature)
3. Create a verification level (e.g., "docs") in your Sumsub dashboard

### 2. Set Up Environment Variables

Create a `.env` file in your project root:

```env
VITE_SUMSUB_APP_TOKEN=your_app_token_here
VITE_SUMSUB_SECRET_KEY=your_secret_key_here
```

**⚠️ IMPORTANT**: Never commit these credentials to version control!

### 3. Create Backend API Endpoint

The Sumsub access token generation **must** be done on the backend for security reasons. You cannot expose your secret key in the frontend.

#### Option A: Express.js Backend

Create an API endpoint at `/api/sumsub/access-token`:

```javascript
// server/routes/sumsub.js
const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN;
const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY;
const SUMSUB_BASE_URL = 'https://api.sumsub.com';

// Create HMAC signature
function createSignature(method, url, timestamp, body = '') {
  const data = timestamp + method + url + body;
  return crypto
    .createHmac('sha256', SUMSUB_SECRET_KEY)
    .update(data)
    .digest('hex');
}

// POST /api/sumsub/access-token
router.post('/access-token', async (req, res) => {
  try {
    const { userId, levelName } = req.body;
    const ttlInSecs = 600; // 10 minutes

    const method = 'POST';
    const url = `/resources/accessTokens?userId=${encodeURIComponent(userId)}&ttlInSecs=${ttlInSecs}&levelName=${encodeURIComponent(levelName)}`;
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createSignature(method, url, timestamp);

    const response = await fetch(`${SUMSUB_BASE_URL}${url}`, {
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
      throw new Error(`Sumsub API error: ${response.status}`);
    }

    const data = await response.json();
    res.json({ token: data.token, userId: data.userId });
  } catch (error) {
    console.error('Error generating Sumsub access token:', error);
    res.status(500).json({ error: 'Failed to generate access token' });
  }
});

module.exports = router;
```

#### Option B: Next.js API Route

Create `pages/api/sumsub/access-token.ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN!;
const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY!;
const SUMSUB_BASE_URL = 'https://api.sumsub.com';

function createSignature(method: string, url: string, timestamp: number): string {
  const data = `${timestamp}${method}${url}`;
  return crypto
    .createHmac('sha256', SUMSUB_SECRET_KEY)
    .update(data)
    .digest('hex');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, levelName } = req.body;
    const ttlInSecs = 600;

    const method = 'POST';
    const url = `/resources/accessTokens?userId=${encodeURIComponent(userId)}&ttlInSecs=${ttlInSecs}&levelName=${encodeURIComponent(levelName)}`;
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createSignature(method, url, timestamp);

    const response = await fetch(`${SUMSUB_BASE_URL}${url}`, {
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
      throw new Error(`Sumsub API error: ${response.status}`);
    }

    const data = await response.json();
    res.json({ token: data.token, userId: data.userId });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate access token' });
  }
}
```

### 4. Update Frontend Code

In `src/components/KycModal.tsx`, uncomment the real API call and comment out the mock:

```typescript
// Replace this:
return await mockApiServer.post('/api/sumsub/access-token', {
  userId,
  levelName: 'docs',
});

// With this:
const response = await fetch('/api/sumsub/access-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId, levelName: 'docs' }),
});
return await response.json();
```

### 5. Configure Vite Proxy (Development)

If your backend runs on a different port, configure Vite proxy in `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Your backend server
        changeOrigin: true,
      },
    },
  },
});
```

## Testing

1. Start your backend server
2. Start the Vite dev server: `npm run dev`
3. Select a client and user
4. Click the "Verify me" button
5. The Sumsub SDK should load with real verification flow

## Webhook Integration (Optional)

To receive verification results, set up webhooks in your Sumsub dashboard:

1. Go to Settings → Webhooks
2. Add your webhook URL (e.g., `https://yourdomain.com/api/sumsub/webhook`)
3. Handle webhook events in your backend

Example webhook handler:

```javascript
router.post('/webhook', (req, res) => {
  const event = req.body;
  
  // Verify webhook signature
  // Process verification result
  // Update user status in database
  
  res.status(200).send('OK');
});
```

## Security Considerations

1. **Never expose your Secret Key** in frontend code
2. **Always generate tokens on the backend**
3. **Validate user authentication** before generating tokens
4. **Use HTTPS** in production
5. **Implement rate limiting** on the token endpoint
6. **Verify webhook signatures** from Sumsub

## Resources

- [Sumsub Web SDK Documentation](https://docs.sumsub.com/docs/get-started-with-web-sdk)
- [Generate Access Token API](https://docs.sumsub.com/reference/generate-access-token)
- [Webhook Integration](https://docs.sumsub.com/docs/webhooks)
- [Sumsub Dashboard](https://cockpit.sumsub.com/)

## Troubleshooting

### SDK doesn't load
- Check browser console for errors
- Verify the Sumsub script is loading from CDN
- Check network tab for failed requests

### Token generation fails
- Verify your App Token and Secret Key are correct
- Check the HMAC signature is being generated correctly
- Ensure the timestamp is in Unix format (seconds, not milliseconds)

### Verification doesn't start
- Ensure the `levelName` matches your Sumsub dashboard configuration
- Check that the user ID is valid and unique
- Verify the token hasn't expired (default: 10 minutes)

## Current File Structure

```
src/
├── components/
│   └── KycModal.tsx          # Sumsub SDK integration
├── api/
│   └── sumsubApi.ts          # Mock API (replace with real backend)
└── lib/
    └── services/
        └── sumsubService.ts  # Token generation logic (for backend)
```
