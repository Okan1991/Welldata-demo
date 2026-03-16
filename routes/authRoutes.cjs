const express = require('express')
const jwt = require('jsonwebtoken')

const router = express.Router()

const { exchangeHtiToken } = require('../services/tokenService.cjs')

router.get('/auth/debug-status', async (req, res) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.json({
      authenticated: false,
      message: 'No authorization header found',
    })
  }

  const token = authHeader.replace('Bearer ', '')
  const result = await exchangeHtiToken(token)

  res.json(result)
})

router.post('/auth/decode-hti', (req, res) => {
  try {
    const { htiToken } = req.body || {}

    if (!htiToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing htiToken',
      })
    }

    const decoded = jwt.decode(htiToken, { complete: true })

    return res.json({
      success: true,
      decoded,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to decode HTI token',
    })
  }
})

module.exports = router