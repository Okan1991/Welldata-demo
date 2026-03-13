import React from 'react'
import { getSortedDomains } from '../../data/getParticipantData.js'

export default function Explainability({ participant, selectedSession }) {
  if (!participant || !selectedSession) {
    return <p>No completed session selected.</p>
  }

  const domains = getSortedDomains(selectedSession)
  const wellbeing = participant.currentWellbeing

  return (
    <div>
      <p>
        Current wellbeing score: <strong>{wellbeing.score} / {wellbeing.maxScore}</strong>
      </p>

      <p>
        <strong>Summary:</strong> {wellbeing.summary}
      </p>

      <p>
        <strong>Focus area:</strong> {wellbeing.focusDomain}
      </p>

      <div style={{ marginTop: '16px' }}>
        {domains.map((domain, index) => {
          const isLow = index < 3
          const isHigh = index >= domains.length - 3

          return (
            <div
              key={domain.key}
              style={{
                border: '1px solid #ddd',
                borderRadius: '6px',
                padding: '10px',
                marginBottom: '8px',
                background: isLow ? '#ffeaea' : isHigh ? '#eaf7ea' : '#fff',
              }}
            >
              <div>
                <strong>{domain.label}</strong>: {domain.score}
              </div>

              <div style={{ fontSize: '0.9rem', color: '#555' }}>
                {domain.meta.system} — {domain.meta.code}
              </div>

              <div style={{ fontSize: '0.9rem', color: '#555' }}>
                {domain.meta.description}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}