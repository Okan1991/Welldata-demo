import React, { useState } from 'react'
import { submitSurvey } from '../../data/getParticipantData'
import { getRecommendationsWithMeta } from '../../data/getParticipantData.js'

export default function ActionPanel({
  participant,
  authState,
  surveyPayload = null,
  onAuthUpdate,
}) {
  const [statusMap, setStatusMap] = useState({})
  const [demoResult, setDemoResult] = useState(null)
  const [demoError, setDemoError] = useState('')

  if (!participant) {
    return <p>No participant data available.</p>
  }

  const recommendations = getRecommendationsWithMeta(participant)

  if (!recommendations.length) {
    return <p>No recommendations available.</p>
  }

  function cycleStatus(currentStatus) {
    if (currentStatus === 'pending') return 'acknowledged'
    if (currentStatus === 'acknowledged') return 'completed'
    return 'pending'
  }

  function handleStatusChange(id, fallbackStatus) {
    setStatusMap((prev) => ({
      ...prev,
      [id]: cycleStatus(prev[id] || fallbackStatus),
    }))
  }

  async function handleTestSurveySave() {
    setDemoError('')
    setDemoResult(null)

    try {
      const webId =
        authState?.webId ||
        'https://example.org/profile/card#me'

      const accessToken =
        authState?.umaAccessToken || null

      const resourceUrl =
        authState?.resourceUrl || null

      const result = await submitSurvey(
        webId,
        [
          {
            linkId: 'q1',
            text: 'Stress',
            answer: [{ valueString: 'Often' }],
          },
        ],
        accessToken,
        resourceUrl
      )

      console.log('Survey saved:', result)
      setDemoResult(result)
    } catch (error) {
      console.error(error)
      setDemoError(error.message || 'Survey opslaan mislukt')
    }
  }

  async function handleTokenExchangeTest() {
    setDemoError('')
    setDemoResult(null)

    try {
      const response = await fetch(
        'http://localhost:3000/api/exchange-access-grant',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accessGrantVcId: authState?.accessGrantVcId || null,
          }),
        }
      )

      const result = await response.json()

      console.log('Token exchange result:', result)
      setDemoResult(result)

      if (result?.success && typeof onAuthUpdate === 'function') {
        onAuthUpdate((prev) => ({
          ...prev,
          phase: result?.phase || prev.phase,
          message: result?.message || prev.message,
          umaAccessToken: result?.umaExchange?.accessToken || prev.umaAccessToken,
          resourceUrl:
            result?.accessGrantVcResult?.vc?.credentialSubject?.providedConsent?.forPersonalData ||
            prev.resourceUrl,
        }))
      }
    } catch (error) {
      console.error(error)
      setDemoError('Token exchange test failed')
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleTestSurveySave}
        style={{ marginBottom: '16px' }}
      >
        Test survey save
      </button>

      <button
        type="button"
        onClick={handleTokenExchangeTest}
        style={{ marginBottom: '16px', marginLeft: '8px' }}
      >
        Test token exchange
      </button>

      {demoError && (
        <p style={{ color: 'red', marginBottom: '12px' }}>
          {demoError}
        </p>
      )}

      {demoResult && (
        <div
          style={{
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '16px',
            background: '#f8f8f8',
          }}
        >
          <p><strong>Demo result:</strong></p>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(demoResult, null, 2)}
          </pre>
        </div>
      )}

      {recommendations.map((recommendation) => {
        const currentStatus =
          statusMap[recommendation.id] || recommendation.status

        return (
          <div
            key={recommendation.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '12px',
            }}
          >
            <p>{recommendation.text}</p>

            <p>
              <strong>Status:</strong> {currentStatus}
            </p>

            {recommendation.domainMeta && (
              <>
                <p>
                  <strong>Triggering domain:</strong>{' '}
                  {recommendation.domainMeta.label}
                </p>

                <p>
                  <strong>Code:</strong> {recommendation.domainMeta.code}
                </p>
              </>
            )}

            {recommendation.triggerScore !== null &&
              recommendation.triggerScore !== undefined && (
                <p>
                  <strong>Trigger score:</strong> {recommendation.triggerScore}
                </p>
              )}

            {recommendation.threshold !== null &&
              recommendation.threshold !== undefined && (
                <p>
                  <strong>Threshold:</strong> {recommendation.threshold}
                </p>
              )}

            <button
              type="button"
              onClick={() =>
                handleStatusChange(recommendation.id, recommendation.status)
              }
            >
              Update status
            </button>
          </div>
        )
      })}
    </div>
  )
}