# Backend Server for Sumsub Integration

This directory contains a simple Express.js backend server that implements proper Sumsub API authentication.

## Why a Backend Server?

Sumsub requires **HMAC SHA256 authentication** for API requests. This MUST be done on the backend because:

1. **Security**: Your Secret Key would be exposed if used in the browser
2. **Best Practice**: Token generation should happen server-side
3. **Sumsub Requirement**: The authentication flow requires server-side crypto operations

## Authentication Implementation

The server implements Sumsub's authentication as per their [official documentation](https://docs.sumsub.com/reference/authentication):

```
X-App-Token: <your_app_token>
X-App-Access-Ts: <unix_timestamp>
X-App-Access-Sig: HMAC-SHA256(secret_key, timestamp + method + url + body)
```

## Quick Start

### 1. Install Dependencies

```bash
cd backend-example
npm install express cors dotenv
```

### 2. Configure Credentials

Copy the example environment file and add your Sumsub credentials:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials from the [Sumsub dashboard](https://cockpit.sumsub.com/):

```env
SUMSUB_APP_TOKEN=your_actual_app_token
SUMSUB_SECRET_KEY=your_actual_secret_key
PORT=3001
```

### 3. Run the Server

```bash
node server.js
```

You should see:
```
🚀 Sumsub Backend Server Started
📡 Server running on http://localhost:3001
✅ Sumsub credentials configured: true
```

### 4. Update Frontend

In `src/components/KycModal.tsx`, uncomment the real API call:

```typescript
// Replace the mock API call with:
const response = await fetch('http://localhost:3001/api/sumsub/access-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId, levelName: 'docs' }),
});
return await response.json();
```

## API Endpoints

### POST /api/sumsub/access-token

Generate a Sumsub access token for a user.

**Request:**
```json
{
  "userId": "user_a1",
  "levelName": "docs"
}
```

**Response:**
```json
{
  "token": "act-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "userId": "user_a1"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Sumsub backend server is running",
  "configured": true
}
```

## Testing

Test the endpoint with curl:

```bash
curl -X POST http://localhost:3001/api/sumsub/access-token \
  -H "Content-Type: application/json" \
  -d '{"userId":"test_user","levelName":"docs"}'
```

## Production Deployment

For production, you should:

1. **Use a proper backend framework** (Express, Next.js API routes, etc.)
2. **Add authentication** - Verify the requesting user is authorized
3. **Add rate limiting** - Prevent abuse
4. **Use environment variables** - Never hardcode credentials
5. **Enable HTTPS** - Secure communication
6. **Add logging** - Monitor token generation
7. **Handle errors properly** - Return appropriate error codes

## File Structure

```
backend-example/
├── server.js           # Express server with Sumsub integration
├── sumsubBackend.ts    # TypeScript implementation (for reference)
├── .env.example        # Environment variables template
└── README.md           # This file
```

## Integration with Frontend

The frontend (Vite dev server on port 5173) needs to communicate with this backend (port 3001).

### Option 1: CORS (Current Setup)

The server enables CORS, allowing requests from any origin. This works for development.

### Option 2: Vite Proxy (Recommended for Development)

Add to `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

Then update frontend to use `/api/sumsub/access-token` (without the full URL).

## Troubleshooting

### "Sumsub credentials not configured"
- Make sure you created `.env` file (not `.env.example`)
- Verify your credentials are correct
- Restart the server after changing `.env`

### "CORS error"
- Make sure the backend server is running
- Check that CORS is enabled in `server.js`
- Or use Vite proxy (see above)

### "Sumsub API error: 401"
- Your App Token or Secret Key is incorrect
- Check credentials in Sumsub dashboard
- Verify the HMAC signature is being generated correctly

### "Sumsub API error: 400"
- The `levelName` doesn't exist in your Sumsub configuration
- Create the verification level in Sumsub dashboard
- Or use an existing level name

## Security Notes

⚠️ **NEVER commit your `.env` file to version control!**

The `.gitignore` should include:
```
.env
.env.local
```

## Resources

- [Sumsub Authentication Docs](https://docs.sumsub.com/reference/authentication)
- [Generate Access Token API](https://docs.sumsub.com/reference/generate-access-token)
- [Sumsub Dashboard](https://cockpit.sumsub.com/)
