import React, { useEffect, useState } from 'react'
import PageShell from './components/PageShell.jsx'
import SectionCard from './components/SectionCard.jsx'
import ErrorBanner from './components/ErrorBanner.jsx'
import ParticipantSummary from './components/ParticipantSummary.jsx'
import Timeline from './features/timeline/Timeline.jsx'
import Explainability from './features/explainability/Explainability.jsx'
import ActionPanel from './features/actions/ActionPanel.jsx'
import {
  getParticipantData,
  getCompletedSessions,
} from './data/getParticipantData.js'

function App() {
  const [participant, setParticipant] = useState(null)
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const data = await getParticipantData()
        setParticipant(data)
        setSelectedSessionId(data.currentSessionId)
      } catch (err) {
        setError(err.message || 'Failed to load participant data.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const completedSessions = participant
    ? getCompletedSessions(participant)
    : []

  const selectedSession =
    completedSessions.find((session) => session.id === selectedSessionId) || null

  return (
    <PageShell
      title="WellData Month-1 PIP Demo"
      subtitle="Participant dashboard for timeline, explainability, and preventive action support."
    >
      <ErrorBanner message={error} />

      {loading && <p>Loading participant data...</p>}

      {!loading && participant && (
        <>
          <SectionCard title="Participant summary">
            <ParticipantSummary
              wellbeing={participant.currentWellbeing}
              recommendations={participant.recommendations}
            />
          </SectionCard>

          <SectionCard title="Questionnaire Timeline">
            <Timeline
              participant={participant}
              selectedSessionId={selectedSessionId}
              onSelectSession={setSelectedSessionId}
            />
          </SectionCard>

          <SectionCard title="Score Explainability">
            <Explainability
              participant={participant}
              selectedSession={selectedSession}
            />
          </SectionCard>

          <SectionCard title="Preventive Action Recommendations">
            <ActionPanel participant={participant} />
          </SectionCard>
        </>
      )}
    </PageShell>
  )
}

export default App