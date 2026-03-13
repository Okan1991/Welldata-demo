import React, { useState } from 'react'
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

  return (
    <div>
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