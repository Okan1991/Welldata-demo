import React from 'react'
import PageShell from './components/PageShell.jsx'
import Timeline from './features/timeline/Timeline.jsx'
import Explainability from './features/explainability/Explainability.jsx'
import ActionPanel from './features/actions/ActionPanel.jsx'

function App() {
  return (
    <PageShell
      title="WellData Month-1 PIP Demo"
      subtitle="Simple participant dashboard for timeline, explainability, and preventive actions."
    >
      <Timeline />
      <Explainability />
      <ActionPanel />
    </PageShell>
  )
}

export default App