import React from 'react'
import { mockParticipant } from '../../data/mockParticipant'

export default function Timeline() {

  const sessions = mockParticipant.sessions
  const currentSessionId = mockParticipant.currentSessionId

  const currentSession = sessions.find(
    (s) => s.id === currentSessionId
  )

  return (
    <div>

      <p>
        <strong>Current session:</strong>{' '}
        {currentSession ? currentSession.label : 'Unknown'}
      </p>

      <ul>
        {sessions.map((session) => (
          <li key={session.id}>
            {session.label}
          </li>
        ))}
      </ul>

    </div>
  )
}