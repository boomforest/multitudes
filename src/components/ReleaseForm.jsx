import React from 'react'

function ReleaseForm({ 
  tokenType, 
  onBack, 
  message, 
  releaseData, 
  setReleaseData, 
  isReleasing, 
  onRelease 
}) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5dc',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem 1rem'
    }}>
      <div style={{
        maxWidth: '400px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: '2rem',
            left: '2rem',
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '20px',
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>

        <h1 style={{
          fontSize: '3rem',
          color: '#8b4513',
          marginBottom: '2rem',
          fontWeight: 'normal'
        }}>
          Release {tokenType}
        </h1>

        {message && (
          <div style={{
            padding: '1rem',
            marginBottom: '2rem',
            backgroundColor: message.includes('Released') ? '#d4edda' : '#f8d7da',
            color: message.includes('Released') ? '#155724' : '#721c24',
            borderRadius: '20px'
          }}>
            {message}
          </div>
        )}

        <div style={{ marginBottom: '2rem' }}>
          <input
            type="number"
            value={releaseData.amount}
            onChange={(e) => setReleaseData({ ...releaseData, amount: e.target.value })}
            placeholder="Amount to Release"
            min="0"
            step="0.01"
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1.2rem',
              border: '2px solid #8b4513',
              borderRadius: '25px',
              textAlign: 'center',
              marginBottom: '1rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          <input
            type="text"
            value={releaseData.reason}
            onChange={(e) => setReleaseData({ ...releaseData, reason: e.target.value })}
            placeholder="Reason (optional)"
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1.2rem',
              border: '2px solid #8b4513',
              borderRadius: '25px',
              textAlign: 'center',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          onClick={() => onRelease(tokenType)}
          disabled={isReleasing}
          style={{
            background: 'linear-gradient(45deg, #8b4513, #a0522d)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            padding: '1rem 3rem',
            fontSize: '1.2rem',
            fontWeight: '500',
            cursor: 'pointer',
            opacity: isReleasing ? 0.5 : 1,
            boxShadow: '0 4px 15px rgba(139, 69, 19, 0.3)'
          }}
        >
          {isReleasing ? 'Releasing...' : 'Release'}
        </button>
      </div>
    </div>
  )
}

export default ReleaseForm
