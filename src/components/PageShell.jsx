import React from 'react'

function PageShell({ title, subtitle, children }) {
  return (
    <main className="page-shell">
      <header className="page-header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>
      <div className="dashboard-grid">{children}</div>
    </main>
  )
}

export default PageShell