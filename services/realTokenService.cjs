const jwt = require('jsonwebtoken')

function inspectHtiToken(htiToken) {
  const decoded = jwt.decode(htiToken)

  return {
    webId: decoded?.sub || null,
    issuer: decoded?.iss || null,
    audience: decoded?.aud || null,
    resource: decoded?.resource || null,
    definition: decoded?.definition || null,
    htiVersion: decoded?.['hti-version'] || null,
    issuedAt: decoded?.iat || null,
    expiresAt: decoded?.exp || null,
    jti: decoded?.jti || null,
  }
}

async function authenticateWeAreClient() {
  const oidcHost = process.env.WE_ARE_OIDC_HOST
  const clientId = process.env.WE_ARE_OIDC_CLIENT_ID
  const clientSecret = process.env.WE_ARE_OIDC_CLIENT_SECRET

  if (!oidcHost || !clientId || !clientSecret) {
    return {
      success: false,
      phase: '3E',
      message: 'Missing We.Are OIDC configuration',
      configPreview: {
        oidcHost: oidcHost || null,
        clientId: clientId || null,
        clientSecretPresent: Boolean(clientSecret),
      },
    }
  }

  try {
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    })

    const response = await fetch(`${oidcHost}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    const rawText = await response.text()

    let parsed = null
    try {
      parsed = JSON.parse(rawText)
    } catch {
      parsed = null
    }

    if (!response.ok) {
      return {
        success: false,
        phase: '3E',
        message: 'We.Are client authentication failed',
        status: response.status,
        responseBody: parsed || rawText,
        configPreview: {
          oidcHost,
          clientId,
          clientSecretPresent: true,
        },
      }
    }

    const decodedIdToken = parsed?.id_token
      ? jwt.decode(parsed.id_token)
      : null

    return {
      success: true,
      phase: '3E',
      message: 'We.Are client authentication succeeded',
      status: response.status,
      accessTokenPresent: Boolean(parsed?.access_token),
      idTokenPresent: Boolean(parsed?.id_token),
      refreshTokenPresent: Boolean(parsed?.refresh_token),
      weAreWebId: decodedIdToken?.webid || decodedIdToken?.sub || null,
      accessToken: parsed?.access_token || null,
      idToken: parsed?.id_token || null,
      tokenPreview: parsed?.access_token
        ? `${parsed.access_token.slice(0, 20)}...`
        : null,
    }
  } catch (error) {
    return {
      success: false,
      phase: '3E',
      message: 'We.Are client authentication request failed',
      error: error.message,
      configPreview: {
        oidcHost: oidcHost || null,
        clientId: clientId || null,
        clientSecretPresent: Boolean(clientSecret),
      },
    }
  }
}

async function fetchVcConfiguration() {
  const vcHost = process.env.VC_HOST

  if (!vcHost) {
    return {
      success: false,
      phase: '3E',
      message: 'Missing VC_HOST configuration',
    }
  }

  try {
    const response = await fetch(`${vcHost}/.well-known/vc-configuration`)
    const rawText = await response.text()

    let parsed = null
    try {
      parsed = JSON.parse(rawText)
    } catch {
      parsed = null
    }

    if (!response.ok) {
      return {
        success: false,
        phase: '3E',
        message: 'VC configuration fetch failed',
        status: response.status,
        responseBody: parsed || rawText,
      }
    }

    return {
      success: true,
      phase: '3E',
      message: 'VC configuration fetched successfully',
      status: response.status,
      issuerService: parsed?.issuerService || null,
      derivationService: parsed?.derivationService || null,
      queryService: parsed?.queryService || null,
    }
  } catch (error) {
    return {
      success: false,
      phase: '3E',
      message: 'VC configuration request failed',
      error: error.message,
    }
  }
}

async function createAccessRequest({
  issuerService,
  accessToken,
  htiToken,
  webId,
  personalDataUrl,
}) {
  if (!issuerService || !accessToken || !htiToken || !webId || !personalDataUrl) {
    return {
      success: false,
      phase: '3E',
      message: 'Missing input for access request creation',
      inputPreview: {
        issuerService: issuerService || null,
        accessTokenPresent: Boolean(accessToken),
        htiTokenPresent: Boolean(htiToken),
        webId: webId || null,
        personalDataUrl: personalDataUrl || null,
      },
    }
  }

  const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const payload = {
    credential: {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://schema.inrupt.com/credentials/v1.jsonld',
      ],
      type: ['VerifiableCredential', 'SolidAccessRequest'],
      expirationDate,
      credentialSubject: {
        hasConsent: {
          mode: [
            'http://www.w3.org/ns/auth/acl#Read',
            'http://www.w3.org/ns/auth/acl#Append',
            'http://www.w3.org/ns/auth/acl#Write',
          ],
          hasStatus: 'https://w3id.org/GConsent#ConsentStatusRequested',
          forPersonalData: [personalDataUrl],
          forPurpose: [
            'https://utils.we-are-health.be/data/vocab/sharing/container-sharing-purpose#_ContainerSharingPurpose',
          ],
          isConsentForDataSubject: webId,
        },
      },
    },
  }

  try {
    const response = await fetch(issuerService, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const rawText = await response.text()

    let parsed = null
    try {
      parsed = JSON.parse(rawText)
    } catch {
      parsed = null
    }

    if (!response.ok) {
      return {
        success: false,
        phase: '3E',
        message: 'Access request creation failed',
        status: response.status,
        requestBody: payload,
        responseBody: parsed || rawText,
      }
    }

    return {
      success: true,
      phase: '3E',
      message: 'Access request creation succeeded',
      status: response.status,
      requestBody: payload,
      responseBody: parsed || rawText,
    }
  } catch (error) {
    return {
      success: false,
      phase: '3E',
      message: 'Access request request failed',
      error: error.message,
      requestBody: payload,
    }
  }
}

async function exchangeHtiTokenReal(htiToken) {
  if (!htiToken) {
    return {
      success: false,
      error: 'Missing htiToken',
    }
  }

  const inspection = inspectHtiToken(htiToken)
  const clientAuth = await authenticateWeAreClient()
  const vcConfig = await fetchVcConfiguration()

  const accessRequest = await createAccessRequest({
    issuerService: vcConfig?.issuerService,
    accessToken: clientAuth?.accessToken,
    htiToken,
    webId: inspection?.webId,
    personalDataUrl:
      'https://storage.sandbox-pod.datanutsbedrijf.be/ba1e8848-96c6-40d4-b8ea-1638a61b6cc0/book_index',
  })

  return {
    success: Boolean(accessRequest?.success),
    phase: '3E',
    message: accessRequest?.success
      ? 'HTI token processed and access request created successfully'
      : 'HTI token processed but access request creation failed',
    receivedHtiToken: true,
    htiTokenPreview: `${htiToken.slice(0, 20)}...`,
    ...inspection,
    clientAuth,
    vcConfig,
    accessRequest,
    accessRequestVcId: accessRequest?.responseBody?.id || null,
    nextStep: accessRequest?.success
      ? 'Continue toward consent / UMA flow'
      : 'Inspect access request response and fix the failing upstream dependency',
  }
}

async function fetchUmaConfiguration() {
  const umaHost = process.env.UMA_HOST

  if (!umaHost) {
    return {
      success: false,
      phase: '3F',
      message: 'Missing UMA_HOST configuration',
    }
  }

  try {
    const response = await fetch(`${umaHost}/.well-known/uma2-configuration`)
    const rawText = await response.text()

    let parsed = null
    try {
      parsed = JSON.parse(rawText)
    } catch {
      parsed = null
    }

    if (!response.ok) {
      return {
        success: false,
        phase: '3F',
        message: 'UMA configuration fetch failed',
        status: response.status,
        responseBody: parsed || rawText,
      }
    }

    return {
      success: true,
      phase: '3F',
      message: 'UMA configuration fetched successfully',
      status: response.status,
      tokenEndpoint: parsed?.token_endpoint || null,
      permissionEndpoint: parsed?.permission_endpoint || null,
      issuer: parsed?.issuer || null,
      raw: parsed,
    }
  } catch (error) {
    return {
      success: false,
      phase: '3F',
      message: 'UMA configuration request failed',
      error: error.message,
    }
  }
}

async function fetchAccessGrantVc(accessGrantVcId, idToken) {
  if (!accessGrantVcId || !idToken) {
    return {
      success: false,
      phase: '3F',
      message: 'Missing accessGrantVcId or idToken',
      inputPreview: {
        accessGrantVcId: accessGrantVcId || null,
        idTokenPresent: Boolean(idToken),
      },
    }
  }

  try {
    const response = await fetch(accessGrantVcId, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${idToken}`,
        Accept: 'application/json',
      },
    })

    const rawText = await response.text()

    let parsed = null
    try {
      parsed = JSON.parse(rawText)
    } catch {
      parsed = null
    }

    if (!response.ok) {
      return {
        success: false,
        phase: '3F',
        message: 'Access grant VC fetch failed',
        status: response.status,
        responseBody: parsed || rawText,
      }
    }

    return {
      success: true,
      phase: '3F',
      message: 'Access grant VC fetched successfully',
      status: response.status,
      vc: parsed || rawText,
    }
  } catch (error) {
    return {
      success: false,
      phase: '3F',
      message: 'Access grant VC request failed',
      error: error.message,
    }
  }
}

async function getUmaTicket(resourceUrl) {
  if (!resourceUrl) {
    return {
      success: false,
      phase: 'UMA_TICKET',
      message: 'Missing resourceUrl',
    }
  }

  try {
    const response = await fetch(resourceUrl, {
      method: 'HEAD',
      headers: {
        Accept: '*/*',
      },
    })

    const wwwAuthenticate = response.headers.get('www-authenticate') || ''
    const ticketMatch = wwwAuthenticate.match(/ticket="([^"]+)"/)
    const asUriMatch = wwwAuthenticate.match(/as_uri="([^"]+)"/)

    const umaTicket = ticketMatch ? ticketMatch[1] : null
    const asUri = asUriMatch ? asUriMatch[1] : null

    return {
      success: Boolean(umaTicket),
      phase: 'UMA_TICKET',
      message: umaTicket
        ? 'UMA ticket retrieved'
        : 'UMA ticket not found in www-authenticate header',
      status: response.status,
      wwwAuthenticate,
      umaTicket,
      asUri,
    }
  } catch (error) {
    return {
      success: false,
      phase: 'UMA_TICKET',
      message: 'HEAD request for UMA ticket failed',
      error: error.message,
    }
  }
}

function buildUmaClaimToken(accessGrantVc) {
  if (!accessGrantVc) {
    return null
  }

  const vp = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiablePresentation'],
    verifiableCredential: [accessGrantVc],
  }

  return Buffer.from(JSON.stringify(vp)).toString('base64')
}

async function exchangeUmaTicket({
  tokenEndpoint,
  umaTicket,
  umaClaimToken,
  idToken,
}) {
  if (!tokenEndpoint || !umaTicket || !umaClaimToken || !idToken) {
    return {
      success: false,
      phase: 'UMA_EXCHANGE',
      message: 'Missing required UMA exchange input',
      inputPreview: {
        tokenEndpointPresent: Boolean(tokenEndpoint),
        umaTicketPresent: Boolean(umaTicket),
        umaClaimTokenPresent: Boolean(umaClaimToken),
        idTokenPresent: Boolean(idToken),
      },
    }
  }

  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket',
    ticket: umaTicket,
    claim_token: umaClaimToken,
    claim_token_format: 'https://www.w3.org/TR/vc-data-model/#json-ld',
  })

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    const rawText = await response.text()

    let parsedBody = null
    try {
      parsedBody = rawText ? JSON.parse(rawText) : null
    } catch {
      parsedBody = rawText
    }

    if (!response.ok) {
      return {
        success: false,
        phase: 'UMA_EXCHANGE',
        message: 'UMA token exchange failed',
        status: response.status,
        responseBody: parsedBody,
      }
    }

    return {
      success: true,
      phase: 'UMA_EXCHANGE',
      message: 'UMA token exchange succeeded',
      status: response.status,
      accessTokenPresent: Boolean(parsedBody?.access_token),
      tokenType: parsedBody?.token_type ?? null,
      expiresIn: parsedBody?.expires_in ?? null,
      scope: parsedBody?.scope ?? null,
      accessToken: parsedBody?.access_token ?? null,
      responseBody: parsedBody,
    }
  } catch (error) {
    return {
      success: false,
      phase: 'UMA_EXCHANGE',
      message: 'UMA token exchange request failed',
      error: error.message,
    }
  }
}

async function exchangeAccessGrantForToken(accessGrantVcId) {
  if (!accessGrantVcId) {
    return {
      success: false,
      phase: '3F',
      error: 'Missing accessGrantVcId',
    }
  }

  const clientAuth = await authenticateWeAreClient()
  const umaConfig = await fetchUmaConfiguration()
  const accessGrantVcResult = await fetchAccessGrantVc(
    accessGrantVcId,
    clientAuth?.idToken
  )

  const resourceUrl =
    'https://storage.sandbox-pod.datanutsbedrijf.be/ba1e8848-96c6-40d4-b8ea-1638a61b6cc0/book_index'

  const ticketResult = await getUmaTicket(resourceUrl)

  const umaClaimToken = buildUmaClaimToken(accessGrantVcResult?.vc)

  const umaExchange = await exchangeUmaTicket({
    tokenEndpoint: umaConfig?.tokenEndpoint,
    umaTicket: ticketResult?.umaTicket,
    umaClaimToken,
    idToken: clientAuth?.idToken,
  })

  return {
    success: Boolean(umaExchange?.success),
    phase: '3F',
    message: umaExchange?.success
      ? 'Access grant processed and UMA token exchange succeeded'
      : 'Access grant processed but UMA token exchange failed',
    accessGrantVcId,
    clientAuth,
    umaConfig,
    accessGrantVcResult,
    ticketResult,
    umaClaimTokenPresent: Boolean(umaClaimToken),
    umaExchange,
    nextStep: umaExchange?.success
      ? 'Use final access token for protected resource access'
      : 'Inspect UMA exchange response and retry token exchange if needed',
  }
}

module.exports = {
  inspectHtiToken,
  authenticateWeAreClient,
  fetchVcConfiguration,
  createAccessRequest,
  exchangeHtiTokenReal,
  fetchUmaConfiguration,
  fetchAccessGrantVc,
  getUmaTicket,
  buildUmaClaimToken,
  exchangeUmaTicket,
  exchangeAccessGrantForToken,
}