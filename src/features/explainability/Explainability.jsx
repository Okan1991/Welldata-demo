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

      <p>
        <strong>Summary:</strong> {wellbeing.summary}
      </p>

      <p>
        <strong>Focus area:</strong> {wellbeing.focusArea}
      </p>

      <div style={{ marginTop: '10px' }}>
        {wellbeing.factors.map((factor) => (
          <div
            key={factor.key}
            style={{
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              marginBottom: '6px',
              background: '#fafafa',
            }}
          >
            <strong>{factor.label}</strong>
            <div>{factor.value}</div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

export default Explainability