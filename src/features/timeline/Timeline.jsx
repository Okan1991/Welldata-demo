import React from 'react'
import SectionCard from '../../components/SectionCard.jsx'
import StatusMessage from '../../components/StatusMessage.jsx'
import { mockParticipant } from '../../data/mockParticipant'

function Timeline() {
  const sessions = mockParticipant.sessions
  const currentSessionId = mockParticipant.currentSessionId

  const currentSession = sessions.find((s) => s.id === currentSessionId)

  return (
    <SectionCard title="Questionnaire Timeline">
      <StatusMessage
        label="Current session"
        value={currentSession ? currentSession.label : 'Unknown'}
      />

      <ul>
        {sessions.map((session) => (
          <li key={session.id}>
            <strong>{session.date}</strong> — {session.label} — Status: {session.status}
            {session.overallScore !== null ? ` — Score: ${session.overallScore}/100` : ''}
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}

export default Timeline