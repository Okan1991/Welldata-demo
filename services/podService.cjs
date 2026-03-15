const fetch = require('node-fetch')

async function writeToPod(webId, accessToken, data) {
  try {
    // Voor nu een minimale debug implementatie.
    // Later vervangen we dit met echte Solid Pod write logic.

    return {
      success: true,
      message: 'Simulated pod write (baseline phase)',
      webId,
      storedData: data,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

module.exports = {
  writeToPod,
}