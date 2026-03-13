import React, { useState } from 'react'
import {
  getCompletedSessions,
  getSessionDomainBreakdown,
  compareSessions,
} from '../../data/getParticipantData.js'

export default function Timeline({ participant }) {
  const completedSessions = getCompletedSessions(participant)

  const [selectedSessionId, setSelectedSessionId] = useState(
    participant?.currentSessionId
  )
  const [compareSessionId, setCompareSessionId] = useState(null)

  const selectedSession = completedSessions.find(
    (s) => s.id === selectedSessionId
  )

  const compareSession = completedSessions.find(
    (s) => s.id === compareSessionId
  )

  if (!completedSessions.length) {
    return <p>No completed sessions available.</p>
  }

  return (
    <div>
      <h3>Timeline</h3>

      {completedSessions.map((session) => (
        <div key={session.id} style={{ marginBottom: '8px' }}>
          <button onClick={() => setSelectedSessionId(session.id)}>
            {session.date} — score {session.overallScore}
          </button>{' '}
          <button onClick={() => setCompareSessionId(session.id)}>
            Compare
          </button>
        </div>
      ))}

      {selectedSession && (
        <div style={{ marginTop: '16px' }}>
          <h4>Session breakdown</h4>

          {getSessionDomainBreakdown(selectedSession).map((domain) => (
            <div key={domain.key}>
              {domain.label}: {domain.score}
            </div>
          ))}
        </div>
      )}

      {selectedSession && compareSession && (
        <div style={{ marginTop: '16px' }}>
          <h4>Session comparison</h4>

          {compareSessions(compareSession, selectedSession).map((row) => (
            <div key={row.key}>
              {row.label}: {row.scoreA} → {row.scoreB} (Δ {row.delta})
            </div>
          ))}
        </div>
      )}
    </div>
  )
}