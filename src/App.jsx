import React from 'react'
import PageShell from './components/PageShell.jsx'
import Timeline from './features/timeline/Timeline.jsx'
import Explainability from './features/explainability/Explainability.jsx'
import ActionPanel from './features/actions/ActionPanel.jsx'
import { mockParticipant } from './data/mockParticipant'

function App() {

  const wellbeing = mockParticipant.wellbeing
  const recommendations = mockParticipant.recommendations

  return (
    <PageShell
      title="WellData Month-1 PIP Demo"
      subtitle="Simple participant dashboard for timeline, explainability, and preventive actions."
    >

      <div
        style={{
          border: '1px solid #ddd',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          background: '#f5f7fa'
        }}
      >
        <strong>Participant summary</strong>

        <div style={{ marginTop: '8px' }}>
          Current score: <strong>{wellbeing.score}/100</strong>
        </div>

        <div>
          Focus area: <strong>{wellbeing.focusArea}</strong>
        </div>

        <div>
          Recommendations available: <strong>{recommendations.length}</strong>
        </div>

      </div>

      <Timeline />

      <Explainability />

      <ActionPanel />

    </PageShell>
  )
}

export default App