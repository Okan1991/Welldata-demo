import React, { useState } from 'react'
import SectionCard from '../../components/SectionCard.jsx'
import { mockParticipant } from '../../data/mockParticipant'

function ActionPanel() {
  const [acknowledged, setAcknowledged] = useState({})
  const recommendations = mockParticipant.recommendations

  function toggleAcknowledged(index) {
    setAcknowledged((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  return (
    <SectionCard title="Preventive Action Recommendations">
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {recommendations.map((recommendation, index) => (
          <li
            key={index}
            style={{
              marginBottom: '10px',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              background: '#fafafa',
            }}
          >
            <div style={{ marginBottom: '6px' }}>{recommendation}</div>

            <button onClick={() => toggleAcknowledged(index)}>
              {acknowledged[index] ? 'Acknowledged' : 'Mark as acknowledged'}
            </button>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}

export default ActionPanel