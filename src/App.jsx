import React from 'react'

function App() {
  return (
    <main className="page">
      <h1>WellData Month-1 PIP Demo</h1>
      <p className="subtitle">A simple participant view for the month-1 check-in.</p>

      <section>
        <h2>Questionnaire Timeline</h2>
        <ul>
          <li>Session 1: Baseline questionnaire completed</li>
          <li>Session 2: Weekly check-in pending</li>
          <li>Session 3: Follow-up review planned</li>
        </ul>
      </section>

      <section>
        <h2>Score Explainability</h2>
        <p>
          Current wellbeing score: <strong>72 / 100</strong>. Main contributors are sleep quality,
          activity consistency, and stress check-ins.
        </p>
      </section>

      <section>
        <h2>Preventive Action Recommendations</h2>
        <ul>
          <li>Keep a regular bedtime for the next 7 days.</li>
          <li>Add one 20-minute walk after lunch, 3 times this week.</li>
          <li>Complete the next check-in before Friday.</li>
        </ul>
      </section>
    </main>
  )
}

export default App
