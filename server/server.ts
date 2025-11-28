import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import dotenv from 'dotenv'
import { getAllClients, createClient, getAllUsers, createUser, updateUser } from './api.js'

dotenv.config()

const app = express()
const PORT = 3001

// Sumsub configuration
const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN
const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY
const SUMSUB_BASE_URL = 'https://api.sumsub.com'

// Validate configuration
if (!SUMSUB_APP_TOKEN || !SUMSUB_SECRET_KEY) {
    console.warn('⚠️ WARNING: Sumsub credentials not configured!')
    console.warn('Please set SUMSUB_APP_TOKEN and SUMSUB_SECRET_KEY in your .env file')
}

// Helper: Create HMAC SHA256 signature for Sumsub API
function createSumsubSignature(method: string, url: string, timestamp: number, body: string = '') {
    const data = `${timestamp}${method}${url}${body}`
    return crypto
        .createHmac('sha256', SUMSUB_SECRET_KEY!)
        .update(data)
        .digest('hex')
}

// Middleware
app.use(cors())
app.use(express.json())

// ============================================================================
// CLIENTS
// ============================================================================

app.get('/api/clients', async (req, res) => {
    try {
        const clients = await getAllClients()
        res.json(clients)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch clients' })
    }
})

app.post('/api/clients', async (req, res) => {
    try {
        const client = await createClient(req.body)
        res.json(client)
    } catch (error) {
        res.status(500).json({ error: 'Failed to create client' })
    }
})

// ============================================================================
// USERS
// ============================================================================

app.get('/api/users', async (req, res) => {
    try {
        const users = await getAllUsers()
        res.json(users)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' })
    }
})

app.post('/api/users', async (req, res) => {
    try {
        const user = await createUser(req.body)
        res.json(user)
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' })
    }
})

app.patch('/api/users/:userId', async (req, res) => {
    try {
        const user = await updateUser(req.params.userId, req.body)
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }
        res.json(user)
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' })
    }
})

// ============================================================================
// SUMSUB INTEGRATION
// ============================================================================

// POST /api/sumsub/access-token
app.post('/api/sumsub/access-token', async (req, res) => {
    try {
        const { userId, levelName } = req.body

        if (!userId || !levelName) {
            return res.status(400).json({ error: 'Missing required fields: userId and levelName' })
        }

        if (!SUMSUB_APP_TOKEN || !SUMSUB_SECRET_KEY) {
            return res.status(500).json({ error: 'Sumsub credentials not configured' })
        }

        console.log(`📝 Generating access token for user: ${userId}, level: ${levelName}`)

        const method = 'POST'
        const ttlInSecs = 600
        const path = `/resources/accessTokens?userId=${encodeURIComponent(userId)}&ttlInSecs=${ttlInSecs}&levelName=${encodeURIComponent(levelName)}`
        const timestamp = Math.floor(Date.now() / 1000)
        const signature = createSumsubSignature(method, path, timestamp)

        const response = await fetch(`${SUMSUB_BASE_URL}${path}`, {
            method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-App-Token': SUMSUB_APP_TOKEN,
                'X-App-Access-Sig': signature,
                'X-App-Access-Ts': timestamp.toString(),
            },
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ Sumsub API error:', response.status, errorText)
            return res.status(response.status).json({ error: 'Sumsub API error', details: errorText })
        }

        const data = await response.json()
        res.json({ token: data.token, userId: data.userId })

    } catch (error: any) {
        console.error('❌ Error generating access token:', error)
        res.status(500).json({ error: 'Failed to generate access token', message: error.message })
    }
})

// POST /api/sumsub/create-applicant
app.post('/api/sumsub/create-applicant', async (req, res) => {
    try {
        const { externalUserId, firstName, lastName } = req.body

        if (!externalUserId || !firstName || !lastName) {
            return res.status(400).json({ error: 'Missing required fields: externalUserId, firstName, lastName' })
        }

        if (!SUMSUB_APP_TOKEN || !SUMSUB_SECRET_KEY) {
            return res.status(500).json({ error: 'Sumsub credentials not configured' })
        }

        console.log(`👤 Creating applicant for user: ${externalUserId} (${firstName} ${lastName})`)

        const method = 'POST'
        const levelName = 'docs'
        const path = `/resources/applicants?levelName=${encodeURIComponent(levelName)}`
        const timestamp = Math.floor(Date.now() / 1000)

        const requestBody = JSON.stringify({
            externalUserId,
            fixedInfo: { firstName, lastName }
        })

        const signature = createSumsubSignature(method, path, timestamp, requestBody)

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
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ Sumsub API error:', response.status, errorText)
            return res.status(response.status).json({ error: 'Sumsub API error', details: errorText })
        }

        const data = await response.json()
        console.log('✅ Applicant created successfully:', data.id)

        res.json({ applicantId: data.id, externalUserId: data.externalUserId })

    } catch (error: any) {
        console.error('❌ Error creating applicant:', error)
        res.status(500).json({ error: 'Failed to create applicant', message: error.message })
    }
})

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Transact backend server is running',
        configured: !!(SUMSUB_APP_TOKEN && SUMSUB_SECRET_KEY),
        db: 'server/db.json'
    })
})

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`)
    console.log(`📊 Database: server/db.json`)
})
