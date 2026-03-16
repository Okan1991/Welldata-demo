// server.cjs
require('dotenv').config()

const express = require('express')
const cors = require('cors')

const surveyRoutes = require('./routes/surveyRoutes.cjs')
const authRoutes = require('./routes/authRoutes.cjs')

const {
  exchangeHtiToken,
} = require('./services/tokenService.cjs')

const {
  exchangeHtiTokenReal,
  exchangeAccessGrantForToken,
} = require('./services/realTokenService.cjs')

const { writeToPod } = require('./services/podService.cjs')

const app = express()
const PORT = process.env.PORT || 3000

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5174'
const WEARE_AUTH_BASE_URL = process.env.WEARE_AUTH_BASE_URL || ''
const WEARE_CLIENT_ID = process.env.WEARE_CLIENT_ID || ''
const WEARE_REDIRECT_URI =
  process.env.WEARE_REDIRECT_URI || 'http://localhost:3000/oidc_redirect'

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', surveyRoutes)
app.use('/api', authRoutes)

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
  lastReceivedHtiTokenPreview: null,
  lastCallbackMethod: null,
  lastCallbackPayload: null,
  lastUpdatedAt: null,
}

// ------------------------------
// Helpers
// ------------------------------
function updateAuthStateFromExchange(result, htiToken) {
  authState = {
    ...authState,
    isLoggedIn: Boolean(result?.success),
    htiTokenPresent: Boolean(htiToken),
    webId: result?.webId || null,
    accessTokenPresent: Boolean(result?.accessToken),
    exchangeMode: result?.mode || null,
    lastExchangeMessage: result?.message || null,
    lastReceivedHtiTokenPreview: htiToken ? `${htiToken.slice(0, 20)}...` : null,
    lastUpdatedAt: new Date().toISOString(),
  }
}

function updateCallbackDebugState(method, payload) {
  authState = {
    ...authState,
    lastCallbackMethod: method,
    lastCallbackPayload: payload,
    lastUpdatedAt: new Date().toISOString(),
  }
}

function buildWeAreLoginUrl() {
  if (!WEARE_AUTH_BASE_URL || !WEARE_CLIENT_ID) {
    return null
  }

  const params = new URLSearchParams({
    client_id: WEARE_CLIENT_ID,
    redirect_uri: WEARE_REDIRECT_URI,
  })

  return `${WEARE_AUTH_BASE_URL}?${params.toString()}`
}

// ------------------------------
// Health check
// ------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'welldata-demo backend is running',
    timestamp: new Date().toISOString(),
    frontendUrl: FRONTEND_URL,
    redirectUri: WEARE_REDIRECT_URI,
  })
})

// ------------------------------
// Start WeAre / HTI login
// ------------------------------
app.get('/api/auth/start', (req, res) => {
  const loginUrl = buildWeAreLoginUrl()

  if (!loginUrl) {
    return res.status(500).json({
      success: false,
      error: 'Missing WEARE_AUTH_BASE_URL or WEARE_CLIENT_ID in .env',
    })
  }

  return res.redirect(loginUrl)
})

// ------------------------------
// OIDC / HTI callback route
// ------------------------------
app.all('/oidc_redirect', (req, res) => {
  const htiToken =
    req.body?.hti_token ||
    req.body?.token ||
    req.query?.hti_token ||
    req.query?.token ||
    null

  console.log('OIDC callback hit')
  console.log('method:', req.method)
  console.log('query:', req.query)
  console.log('body:', req.body)

  updateCallbackDebugState(req.method, {
    query: req.query,
    bodyKeys: Object.keys(req.body || {}),
    queryKeys: Object.keys(req.query || {}),
    htiTokenFound: Boolean(htiToken),
  })

  if (!htiToken) {
    return res.redirect(`${FRONTEND_URL}/?error=no_token_received`)
  }

  return res.redirect(
    `${FRONTEND_URL}/?hti_token=${encodeURIComponent(htiToken)}`
  )
})

// ------------------------------
// Auth status route
// ------------------------------
app.get('/api/auth/status', (req, res) => {
  res.json({
    success: true,
    authState,
  })
})

// ------------------------------
// Exchange HTI token route
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
// Real token exchange route
// ------------------------------
app.post('/api/exchange-token-real', async (req, res) => {
  try {
    const { htiToken } = req.body || {}
    const result = await exchangeHtiTokenReal(htiToken)
    return res.json(result)
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'exchange-token-real failed',
    })
  }
})

// ------------------------------
// Consent start route
// ------------------------------
app.post('/api/start-consent', async (req, res) => {
  const { accessRequestVcId } = req.body || {}

  if (!accessRequestVcId) {
    return res.status(400).json({
      success: false,
      error: 'Missing accessRequestVcId',
    })
  }

  const consentBaseUrl = 'https://we-are-acc.vito.be/nl/access-request'
  const redirectUrl = 'http://localhost:3000/access-grant-callback'

  const consentUrl =
    `${consentBaseUrl}?requestVcUrl=${encodeURIComponent(accessRequestVcId)}&redirectUrl=${encodeURIComponent(redirectUrl)}`

  return res.json({
    success: true,
    phase: '3E',
    message: 'Consent URL prepared',
    accessRequestVcId,
    redirectUrl,
    consentUrl,
    nextStep: 'Open consentUrl in browser and capture access-grant-id on redirect',
  })
})

// ------------------------------
// Access grant callback route
// ------------------------------
app.get('/access-grant-callback', (req, res) => {
  const accessGrantId = req.query['access-grant-id'] || req.query.access_grant
  const approved = req.query.approved

  console.log('Consent callback — approved:', approved, 'grant:', accessGrantId)

  if (approved === 'true' && accessGrantId) {
    return res.redirect(
      `${FRONTEND_URL}/?access_grant_id=${encodeURIComponent(accessGrantId)}`
    )
  }

  return res.redirect(`${FRONTEND_URL}/?error=consent_denied`)
})

// ------------------------------
// Access grant exchange route
// ------------------------------
app.post('/api/exchange-access-grant', async (req, res) => {
  try {
    const { accessGrantVcId } = req.body || {}
    const result = await exchangeAccessGrantForToken(accessGrantVcId)
    return res.json(result)
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'exchange-access-grant failed',
    })
  }
})

// ------------------------------
// Pod write debug route
// ------------------------------
app.post('/api/test-pod-write', async (req, res) => {
  try {
    const { webId, accessToken, data } = req.body || {}

    const result = await writeToPod(
      webId,
      accessToken,
      data || {
        test: 'welldata-demo write test',
        timestamp: new Date().toISOString(),
      }
    )

    return res.json(result)
  } catch (error) {
    console.error('Pod write error:', error)

    return res.status(500).json({
      success: false,
      error: error.message || 'Pod write failed',
    })
  }
})

// ------------------------------
// Participant data route
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
  console.log(`frontend expected at ${FRONTEND_URL}`)
  console.log(`oidc callback configured as ${WEARE_REDIRECT_URI}`)
})