import React from 'react'
import SectionCard from '../../components/SectionCard.jsx'

function ActionPanel() {
  return (
    <SectionCard title="Preventive Action Recommendations">
      <ul>
        <li>Keep a regular bedtime for the next 7 days.</li>
        <li>Add one 20-minute walk after lunch, 3 times this week.</li>
        <li>Complete the next check-in before Friday.</li>
      </ul>
    </SectionCard>
  )
}

export default ActionPanel