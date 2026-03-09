import React from 'react'
import SectionCard from '../../components/SectionCard.jsx'
import { mockParticipant } from '../../data/mockParticipant'

function ActionPanel() {
  const recommendations = mockParticipant.recommendations

  return (
    <SectionCard title="Preventive Action Recommendations">
      <ul>
        {recommendations.map((recommendation, index) => (
          <li key={index}>{recommendation}</li>
        ))}
      </ul>
    </SectionCard>
  )
}

export default ActionPanel