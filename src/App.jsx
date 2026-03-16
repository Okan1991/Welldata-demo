import React, { useEffect, useMemo, useState } from 'react'
import PageShell from './components/PageShell.jsx'
import SectionCard from './components/SectionCard.jsx'
import ErrorBanner from './components/ErrorBanner.jsx'
import ParticipantSummary from './components/ParticipantSummary.jsx'
import Timeline from './features/timeline/Timeline.jsx'
import Explainability from './features/explainability/Explainability.jsx'
import ActionPanel from './features/actions/ActionPanel.jsx'
import SurveyForm from './features/survey/SurveyForm.jsx'
import {
  getParticipantData,
  getCompletedSessions,
} from './data/getParticipantData.js'

function average(values) {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function getFocusDomain(domainScores = {}) {
  const entries = Object.entries(domainScores).filter(
    ([, value]) => typeof value === 'number'
  )

  if (!entries.length) return 'stress'

  entries.sort((a, b) => a[1] - b[1])
  return entries[0][0]
}

function buildRecommendations(domainScores = {}) {
  const recommendations = []

  if ((domainScores.stress ?? 10) < 6) {
    recommendations.push({
      id: `rec-stress-${Date.now()}`,
      text: 'Keep a regular bedtime for the next 7 days.',
      triggerDomain: 'stress',
      triggerScore: domainScores.stress,
      threshold: 6,
      status: 'pending',
    })
  }

  if ((domainScores.physical_exercise ?? 10) < 6) {
    recommendations.push({
      id: `rec-exercise-${Date.now()}`,
      text: 'Plan at least 30 minutes of light-to-moderate exercise this week.',
      triggerDomain: 'physical_exercise',
      triggerScore: domainScores.physical_exercise,
      threshold: 6,
      status: 'pending',
    })
  }

  if ((domainScores.social_contact ?? 10) < 6) {
    recommendations.push({
      id: `rec-social-${Date.now()}`,
      text: 'Schedule one meaningful social contact moment in the coming days.',
      triggerDomain: 'social_contact',
      triggerScore: domainScores.social_contact,
      threshold: 6,
      status: 'pending',
    })
  }

  if (!recommendations.length) {
    recommendations.push({
      id: `rec-general-${Date.now()}`,
      text: 'Maintain your current preventive habits and complete the next weekly check-in.',
      triggerDomain: getFocusDomain(domainScores),
      triggerScore: domainScores[getFocusDomain(domainScores)] ?? null,
      threshold: 6,
      status: 'pending',
    })
  }

  return recommendations
}

function buildSummary(newOverallScore, previousOverallScore = null) {
  if (previousOverallScore === null || previousOverallScore === undefined) {
    return 'New questionnaire completed and rendered in the dashboard.'
  }

  if (newOverallScore > previousOverallScore) {
    return 'Overall wellbeing improved compared to the previous session.'
  }

  if (newOverallScore < previousOverallScore) {
    return 'Overall wellbeing declined compared to the previous session.'
  }

  return 'Overall wellbeing remained stable compared to the previous session.'
}

function App() {
  const [userId, setUserId] = useState('A')
  const [participant, setParticipant] = useState(null)
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [authState, setAuthState] = useState({
    htiTokenPresent: false,
    exchangeSuccess: false,
    phase: '',
    message: '',
    accessRequestVcId: '',
    accessGrantVcId: '',
    webId: '',
    umaAccessToken: '',
    resourceUrl: '',
  })

  useEffect(() => {
    async function handleUrlParams() {
      const params = new URLSearchParams(window.location.search)
      const htiToken = params.get('hti_token')
      const accessGrantId = params.get('access_grant_id')

      // Handle access grant callback (from consent redirect)
      if (accessGrantId) {
        console.log('Access grant received:', accessGrantId)
        window.history.replaceState({}, document.title, '/')

        setAuthState((prev) => ({
          ...prev,
          accessGrantVcId: accessGrantId,
          message: 'Access grant received — ready for UMA token exchange.',
        }))
        return
      }

      if (!htiToken) return

      setAuthState((prev) => ({
        ...prev,
        htiTokenPresent: true,
        message: 'HTI token received from WeAre callback.',
      }))

      try {
        const response = await fetch('http://localhost:3000/api/exchange-token-real', {
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

        setAuthState({
          htiTokenPresent: true,
          exchangeSuccess: Boolean(result?.success),
          phase: result?.phase || '',
          message: result?.message || '',
          accessRequestVcId: result?.accessRequestVcId || '',
          accessGrantVcId: result?.accessGrantVcId || '',
          webId: result?.webId || '',
          umaAccessToken: result?.umaExchange?.accessToken || '',
          resourceUrl:
            result?.accessGrantVcResult?.vc?.credentialSubject?.providedConsent?.forPersonalData ||
            'https://storage.sandbox-pod.datanutsbedrijf.be/ba1e8848-96c6-40d4-b8ea-1638a61b6cc0/book_index',
        })
      } catch (error) {
        console.error(error)
        setAuthState({
          htiTokenPresent: true,
          exchangeSuccess: false,
          phase: '3E',
          message: 'HTI exchange from URL failed.',
          accessRequestVcId: '',
          accessGrantVcId: '',
          webId: '',
          umaAccessToken: '',
          resourceUrl: '',
        })
      }
    }

    handleUrlParams()
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

  function handleSurveySubmitted({ domainScores, saveResult }) {
    const sessionId = `session-${Date.now()}`

    setParticipant((prev) => {
      if (!prev) return prev

      const previousSession =
        prev.sessions?.find((session) => session.id === prev.currentSessionId) || null

      const scoreValues = Object.values(domainScores).map((value) => Number(value))
      const overallScore = Math.round(average(scoreValues) * 10)
      const focusDomain = getFocusDomain(domainScores)
      const sessionDate = new Date().toISOString().slice(0, 10)

      const newSession = {
        id: sessionId,
        date: sessionDate,
        label: 'Live questionnaire completed',
        status: 'completed',
        overallScore,
        domainScores,
      }

      const updatedParticipant = {
        ...prev,
        currentSessionId: sessionId,
        sessions: [...(prev.sessions || []), newSession],
        currentWellbeing: {
          score: overallScore,
          maxScore: 100,
          sessionId,
          summary: buildSummary(overallScore, previousSession?.overallScore ?? null),
          focusDomain,
        },
        recommendations: buildRecommendations(domainScores),
        lastSurveySaveResult: saveResult,
      }

      return updatedParticipant
    })

    setSelectedSessionId(sessionId)
  }

  const completedSessions = useMemo(
    () => (participant ? getCompletedSessions(participant) : []),
    [participant]
  )

  const selectedSession =
    completedSessions.find((session) => session.id === selectedSessionId) || null

  return (
    <PageShell
      title="WellData Month-1 PIP Demo"
      subtitle="Participant dashboard for timeline, explainability, and preventive action support."
    >
      <ErrorBanner message={error} />

      <SectionCard title="WeAre / Solid authorization status">
        <p><strong>HTI token received:</strong> {authState.htiTokenPresent ? 'Yes' : 'No'}</p>
        <p><strong>Backend exchange successful:</strong> {authState.exchangeSuccess ? 'Yes' : 'No'}</p>
        <p><strong>Phase:</strong> {authState.phase || 'Not started'}</p>
        <p><strong>Status message:</strong> {authState.message || 'No authorization event yet.'}</p>
        <p><strong>Access Request VC ID:</strong> {authState.accessRequestVcId || 'Not available'}</p>

        {authState.accessRequestVcId && !authState.accessGrantVcId && (
          <button
            onClick={async () => {
              const res = await fetch('http://localhost:3000/api/start-consent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessRequestVcId: authState.accessRequestVcId }),
              })
              const data = await res.json()
              if (data.consentUrl) {
                window.location.href = data.consentUrl
              }
            }}
            style={{
              padding: '8px 16px',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '8px',
            }}
          >
            Start consent flow
          </button>
        )}

        {authState.accessGrantVcId && (
          <p><strong>Access Grant VC ID:</strong> {authState.accessGrantVcId}</p>
        )}

        <p><strong>WebID:</strong> {authState.webId || 'Not available in current frontend state'}</p>
        <p><strong>UMA token present:</strong> {authState.umaAccessToken ? 'Yes' : 'No'}</p>
        <p>
          <strong>Authorized resource:</strong>{' '}
          {authState.resourceUrl ||
            'https://storage.sandbox-pod.datanutsbedrijf.be/ba1e8848-96c6-40d4-b8ea-1638a61b6cc0/book_index'}
        </p>
      </SectionCard>

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

      {!loading && participant && (
        <SectionCard title="Questionnaire input">
          <SurveyForm
            participant={participant}
            authState={authState}
            onSurveySubmitted={handleSurveySubmitted}
          />
        </SectionCard>
      )}

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
            <ActionPanel
              participant={participant}
              authState={authState}
              surveyPayload={null}
              onAuthUpdate={setAuthState}
            />
          </SectionCard>
        </>
      )}
    </PageShell>
  )
}

export default App