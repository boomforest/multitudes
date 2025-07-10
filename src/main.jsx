import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  const [message, setMessage] = useState('App loaded successfully! 🎉');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dbeafe 0%, #fdf4ff 100%)',
      padding: '1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        padding: '1.5rem',
        maxWidth: '28rem',
        textAlign: 'center'
      }}>
        <h1>🛡️ Token Exchange</h1>
        <p>{message}</p>
        <p>Ready to add Supabase features step by step!</p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
