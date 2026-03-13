import React from 'react'

export default function ParticipantSummary({ wellbeing, recommendations }) {
  if (!wellbeing) return null

  return (
    <div>
      <p>
        Current score: <strong>{wellbeing.score}/{wellbeing.maxScore}</strong>
      </p>

      <p>
        Focus area: <strong>{wellbeing.focusDomain}</strong>
      </p>

      <p>
        Recommendations available: <strong>{recommendations?.length ?? 0}</strong>
      </p>
    </div>
  )
}
