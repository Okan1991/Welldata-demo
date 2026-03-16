async function writeToPod({ webId, accessToken, data, resourceUrl }) {
  try {
    if (!webId) {
      return {
        success: false,
        error: 'No WebID provided',
      }
    }

    if (!accessToken) {
      return {
        success: false,
        error: 'No access token provided',
      }
    }

    if (!resourceUrl) {
      return {
        success: false,
        error: 'No resourceUrl provided',
      }
    }

    const response = await fetch(resourceUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const text = await response.text()

    return {
      success: response.ok,
      status: response.status,
      podUrl: resourceUrl,
      responseBody: text,
    }
  } catch (error) {
    return {
      success: false,
      podUrl: resourceUrl || null,
      error: error.message,
      errorName: error.name,
      errorStack: error.stack,
    }
  }
}

module.exports = {
  writeToPod,
}