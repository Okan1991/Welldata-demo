export default function ErrorBanner({ message }) {
  if (!message) return null

  return (
    <div
      style={{
        padding: '12px',
        background: '#ffe5e5',
        border: '1px solid #ffb3b3',
        borderRadius: '6px',
        marginBottom: '16px',
        color: '#900',
      }}
    >
      <strong>Error:</strong> {message}
    </div>
  )
}