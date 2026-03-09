import React from 'react'
import SectionCard from '../../components/SectionCard.jsx'
import { mockParticipant } from '../../data/mockParticipant'

function Explainability() {

  const wellbeing = mockParticipant.wellbeing

  return (
    <SectionCard title="Score Explainability">
      <p>
        Current wellbeing score: <strong>{wellbeing.score} / 100</strong>
      </p>

      <ul>
        {wellbeing.factors.map((factor) => (
          <li key={factor.key}>
            {factor.label}: {factor.value}
          </li>
        ))}
      </ul>

    </SectionCard>
  )
}

export default Explainability