async function writeToPod(webId, accessToken, data) {
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

    const podUrl = `${webId}/pod/test.json`

    const response = await fetch(podUrl, {
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
      podUrl,
      responseBody: text,
    }
  } catch (error) {
    return {
      success: false,
      podUrl: webId ? `${webId}/pod/test.json` : null,
      error: error.message,
      errorName: error.name,
      errorStack: error.stack,
    }
  }
}

module.exports = {
  writeToPod,
}