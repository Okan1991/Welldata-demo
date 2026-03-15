// server.cjs
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const surveyRoutes = require('./routes/surveyRoutes.cjs')

const {
  exchangeHtiToken,
} = require('./services/tokenService.cjs')

const {
  writeToPod,
} = require('./services/podService.cjs')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/api', surveyRoutes)

// ------------------------------
// In-memory auth debug state
// ------------------------------
let authState = {
  isLoggedIn: false,
  htiTokenPresent: false,
  webId: null,
  accessTokenPresent: false,
  exchangeMode: null,
  lastExchangeMessage: null,
  lastUpdatedAt: null,
}

// ------------------------------
// Helpers
// ------------------------------
function updateAuthStateFromExchange(result, htiToken) {
  authState = {
    isLoggedIn: Boolean(result?.success),
    htiTokenPresent: Boolean(htiToken),
    webId: result?.webId || null,
    accessTokenPresent: Boolean(result?.accessToken),
    exchangeMode: result?.mode || null,
    lastExchangeMessage: result?.message || null,
    lastUpdatedAt: new Date().toISOString(),
  }
}

function ensureDataDir() {
  const dir = path.join(__dirname, 'data')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

// ------------------------------
// Health check
// ------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'welldata-demo backend is running',
    timestamp: new Date().toISOString(),
  })
})

// ------------------------------
// 1. OIDC / HTI callback route
// ------------------------------
// Expected: VITO / localhost bridge POSTs a token here
app.post('/oidc_redirect', (req, res) => {
  const { token } = req.body || {}

  if (!token) {
    return res.redirect('/?error=no_token_received')
  }

  // Redirect token back to frontend for now.
  // Later this can be hardened if needed.
  return res.redirect(`/?hti_token=${encodeURIComponent(token)}`)
})

// ------------------------------
// 2. Auth status route
// ------------------------------
app.get('/api/auth/status', (req, res) => {
  res.json({
    success: true,
    authState,
  })
})

// ------------------------------
// 3. Exchange HTI token route
// ------------------------------
app.post('/api/exchange-token', async (req, res) => {
  try {
    const { htiToken } = req.body || {}

    if (!htiToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing htiToken',
      })
    }

    const result = await exchangeHtiToken(htiToken)

    updateAuthStateFromExchange(result, htiToken)

    return res.json(result)
  } catch (error) {
    console.error('Exchange token error:', error)

    return res.status(500).json({
      success: false,
      error: error.message || 'Token exchange failed',
    })
  }
})

// ------------------------------
// 4. Pod write debug route
// ------------------------------
app.post('/api/test-pod-write', async (req, res) => {
  try {
    const { webId, accessToken, data } = req.body || {}

    if (!webId) {
      return res.status(400).json({
        success: false,
        error: 'Missing webId',
      })
    }

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing accessToken',
      })
    }

    const payload =
      data ||
      {
        message: 'Test write from welldata-demo',
        source: 'welldata-demo',
        timestamp: new Date().toISOString(),
      }

    const result = await writeToPod(webId, accessToken, payload)

    return res.json(result)
  } catch (error) {
    console.error('Pod write error:', error)

    return res.status(500).json({
      success: false,
      error: error.message || 'Pod write failed',
    })
  }
})

/*
// ------------------------------
// 5. Local survey save fallback
// ------------------------------
app.post('/api/survey/save', async (req, res) => {
  try {
    const {
      webId = null,
      timestamp = new Date().toISOString(),
      fhirData = null,
      podStatus = null,
    } = req.body || {}

    const dir = ensureDataDir()

    const safeTime = timestamp.replace(/[:.]/g, '-')
    const filename = `survey-save-${safeTime}.json`
    const filepath = path.join(dir, filename)

    const payload = {
      savedAt: new Date().toISOString(),
      webId,
      timestamp,
      podStatus,
      fhirData,
    }

    fs.writeFileSync(filepath, JSON.stringify(payload, null, 2), 'utf-8')

    return res.json({
      success: true,
      message: 'Survey data saved locally',
      filename,
      filepath,
    })
  } catch (error) {
    console.error('Survey save error:', error)

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to save survey data',
    })
  }
})
*/  

// ------------------------------
// 6. Participant data route
// ------------------------------
app.get('/api/participant', (req, res) => {
  res.json({
    success: true,
    participant: {
      participantId: 'P-001',
      name: 'Backend Participant A',
      currentSessionId: 'session-2',
      sessions: [
        {
          id: 'session-1',
          date: '2026-03-01',
          label: 'Baseline questionnaire completed',
          status: 'completed',
          overallScore: 68,
          domainScores: {
            stress: 5.5,
            physical_exercise: 7.0,
            daily_life: 7.5,
            social_contact: 8.0,
            alcohol: 6.0,
            smoking: 7.0,
          },
        },
        {
          id: 'session-2',
          date: '2026-03-08',
          label: 'Weekly check-in',
          status: 'completed',
          overallScore: 72,
          domainScores: {
            stress: 5.0,
            physical_exercise: 7.5,
            daily_life: 8.0,
            social_contact: 8.5,
            alcohol: 6.5,
            smoking: 7.0,
          },
        },
      ],
      currentWellbeing: {
        score: 72,
        maxScore: 100,
        sessionId: 'session-2',
        summary: 'Overall wellbeing slightly improved compared to last week.',
        focusDomain: 'stress',
      },
      recommendations: [
        {
          id: 'rec-1',
          text: 'Keep a regular bedtime for the next 7 days.',
          triggerDomain: 'stress',
          triggerScore: 5.0,
          threshold: 6.0,
          status: 'pending',
        },
      ],
    },
  })
})

// ------------------------------
// 404 fallback
// ------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  })
})

// ------------------------------
// Start server
// ------------------------------
app.listen(PORT, () => {
  console.log(`welldata-demo backend listening on http://localhost:${PORT}`)
})