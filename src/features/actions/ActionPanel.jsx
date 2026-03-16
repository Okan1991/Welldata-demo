import React, { useState } from 'react'
import {
  submitSurvey,
  getAuthDebugStatus,
} from '../../data/getParticipantData'
import { getRecommendationsWithMeta } from '../../data/getParticipantData.js'

export default function ActionPanel({ participant }) {
  const [statusMap, setStatusMap] = useState({})

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
    try {
      const result = await submitSurvey(
        'https://example.org/profile/card#me',
        [
          {
            linkId: 'q1',
            text: 'Stress',
            answer: [{ valueString: 'Often' }],
          },
        ]
      )

      console.log('Survey saved:', result)
      alert('Survey opgeslagen (test)')
    } catch (error) {
      console.error(error)
      alert('Survey opslaan mislukt')
    }
  }

  async function handleAuthDebugTest() {
    try {
      const result = await getAuthDebugStatus('TEST_TOKEN')

      console.log('Auth debug result:', result)
      alert(JSON.stringify(result, null, 2))
    } catch (error) {
      console.error(error)
      alert('Auth debug test failed')
    }
  }

  async function handleTokenExchangeTest() {
    try {
      const response = await fetch('http://localhost:3000/api/exchange-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          htiToken: 'TEST_TOKEN',
        }),
      })

      const result = await response.json()

      console.log('Token exchange result:', result)
      alert(JSON.stringify(result, null, 2))
    } catch (error) {
      console.error(error)
      alert('Token exchange test failed')
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
        onClick={handleAuthDebugTest}
        style={{ marginBottom: '16px', marginLeft: '8px' }}
      >
        Test auth debug
      </button>

      <button
        type="button"
        onClick={handleTokenExchangeTest}
        style={{ marginBottom: '16px', marginLeft: '8px' }}
      >
        Test token exchange
      </button>

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