import React from 'react'

function StatusMessage({ label, value }) {
  return (
    <p className="status-message">
      <strong>{label}:</strong> {value}
    </p>
  )
}

export default StatusMessage