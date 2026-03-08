import React from 'react'
import SectionCard from '../../components/SectionCard.jsx'
import StatusMessage from '../../components/StatusMessage.jsx'

function Timeline() {
  return (
    <SectionCard title="Questionnaire Timeline">
      <StatusMessage label="Current session" value="Session 2 (pending)" />

      <ul>
        <li>Session 1: Baseline questionnaire completed</li>
        <li>Session 2: Weekly check-in pending</li>
        <li>Session 3: Follow-up review planned</li>
      </ul>
    </SectionCard>
  )
}

export default Timeline