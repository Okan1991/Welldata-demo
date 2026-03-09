import React, { useState } from 'react'
import SectionCard from '../../components/SectionCard.jsx'
import { mockParticipant } from '../../data/mockParticipant'

function ActionPanel() {
  const [status, setStatus] = useState({})
  const recommendations = mockParticipant.recommendations

  function acknowledge(index) {
    setStatus((prev) => ({
      ...prev,
      [index]: 'acknowledged'
    }))
  }

  function complete(index) {
    setStatus((prev) => ({
      ...prev,
      [index]: 'completed'
    }))
  }

  return (
    <SectionCard title="Preventive Action Recommendations">
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {recommendations.map((recommendation, index) => {

          const currentStatus = status[index] || 'pending'

          return (
            <li
              key={index}
              style={{
                marginBottom: '10px',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                background: '#fafafa'
              }}
            >
              <div style={{ marginBottom: '8px' }}>
                {recommendation}
              </div>

              <div style={{ fontSize: '13px', marginBottom: '6px' }}>
                Status: <strong>{currentStatus}</strong>
              </div>

              {currentStatus === 'pending' && (
                <button onClick={() => acknowledge(index)}>
                  Acknowledge
                </button>
              )}

              {currentStatus === 'acknowledged' && (
                <button onClick={() => complete(index)}>
                  Mark completed
                </button>
              )}

              {currentStatus === 'completed' && (
                <span style={{ color: 'green' }}>
                  ✓ Completed
                </span>
              )}

            </li>
          )
        })}
      </ul>
    </SectionCard>
  )
}

export default ActionPanel