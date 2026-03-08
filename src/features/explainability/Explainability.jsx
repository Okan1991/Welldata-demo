import React from 'react'
import SectionCard from '../../components/SectionCard.jsx'

function Explainability() {
  return (
    <SectionCard title="Score Explainability">
      <p>
        Current wellbeing score: <strong>72 / 100</strong>
      </p>
      <ul>
        <li>Sleep quality: stable</li>
        <li>Activity consistency: moderate improvement</li>
        <li>Stress check-ins: mixed over the past week</li>
      </ul>
    </SectionCard>
  )
}

export default Explainability