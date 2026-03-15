const jwt = require('jsonwebtoken')

function extractWebId(htiToken) {
  try {
    const decoded = jwt.decode(htiToken)
    return decoded?.sub || null
  } catch (error) {
    return null
  }
}

async function exchangeHtiToken(htiToken) {
  const webId = extractWebId(htiToken)

  if (!webId) {
    return {
      success: false,
      error: 'Could not extract WebID from HTI token',
      mode: 'baseline-hti-direct',
    }
  }

  return {
    success: true,
    webId,
    accessToken: htiToken,
    mode: 'baseline-hti-direct',
    message: 'Using HTI token directly as baseline access token',
  }
}

module.exports = {
  extractWebId,
  exchangeHtiToken,
}