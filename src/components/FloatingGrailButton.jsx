import React from 'react'

function FloatingGrailButton({ onGrailClick }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      right: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: 'rgba(210, 105, 30, 0.9)',
      borderRadius: '25px',
      padding: '0.5rem 1rem',
      color: 'white',
      fontSize: '0.9rem',
      fontWeight: '500',
      zIndex: 1000,
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
    }}>
      <button
        onClick={onGrailClick}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '1.2rem',
          cursor: 'pointer',
          padding: '0'
        }}
      >
        🏆
      </button>
      <span>grail // antisocial media</span>
    </div>
  )
}

export default FloatingGrailButton
