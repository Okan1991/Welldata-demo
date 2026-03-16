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
  const [userId, setUserId] = useState('A')
  const [participant, setParticipant] = useState(null)
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
  async function handleHtiTokenFromUrl() {
    const params = new URLSearchParams(window.location.search)
    const htiToken = params.get('hti_token')

    if (!htiToken) return

    try {
      console.log('HTI token received in URL:', htiToken)

      const response = await fetch('http://localhost:3000/api/exchange-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          htiToken,
        }),
      })

      const result = await response.json()

      console.log('HTI exchange result:', result)
      alert(JSON.stringify(result, null, 2))
    } catch (error) {
      console.error(error)
      alert('HTI exchange from URL failed')
    }
  }

  handleHtiTokenFromUrl()
}, [])

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError('')
        const data = await getParticipantData(userId)
        setParticipant(data)
        setSelectedSessionId(data.currentSessionId)
      } catch (err) {
        setError(err.message || 'Failed to load participant data.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [userId])

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

      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="userSelect" style={{ marginRight: '8px' }}>
          Demo user:
        </label>

        <select
          id="userSelect"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        >
          <option value="A">User A</option>
          <option value="B">User B</option>
        </select>
      </div>

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