import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [message, setMessage] = useState('');

  const handleRegister = () => {
    if (!formData.email || !formData.password || !formData.username) {
      setMessage('Please fill in all fields');
      return;
    }
    setMessage('Registration successful!');
    setUser({ username: formData.username });
  };

  const handleLogout = () => {
    setUser(null);
    setMessage('Logged out');
    setFormData({ email: '', password: '', username: '' });
  };

  if (user) {
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
          <p>Welcome, {user.username}!</p>
          <p>Your token balances will appear here...</p>
          <button 
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>
    );
  }

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
        width: '100%',
        maxWidth: '28rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1>🛡️ Token Exchange</h1>
          <p style={{ color: '#6b7280' }}>Secure DOV & DJR token trading</p>
        </div>

        {message && (
          <div style={{
            padding: '0.75rem',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
            backgroundColor: message.includes('successful') ? '#d1fae5' : '#fee2e2',
            color: message.includes('successful') ? '#065f46' : '#991b1b'
          }}>
            {message}
          </div>
        )}

        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Email"
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
            boxSizing: 'border-box'
          }}
        />

        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Password"
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
            boxSizing: 'border-box'
          }}
        />

        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value.toUpperCase() })}
          placeholder="Username (ABC123)"
          maxLength={6}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
            boxSizing: 'border-box'
          }}
        />

        <button 
          onClick={handleRegister}
          style={{
            width: '100%',
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Register & Login
        </button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
