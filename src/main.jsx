import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });

  // Simple login form (no Supabase yet)
  const handleRegister = () => {
    if (!formData.email || !formData.password || !formData.username) {
      setMessage('Please fill in all fields');
      return;
    }
    setMessage('Registration would work here!');
    setUser({ username: formData.username });
  };

  const handleLogin = () => {
    setMessage('Login would work here!');
    setUser({ username: 'TestUser' });
  };

  const handleLogout = () => {
    setUser(null);
    setMessage('Logged out');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dbeafe 0%, #fdf4ff 100%)',
      padding: '1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    card: {
      background: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem',
      margin: '0 auto',
      maxWidth: '28rem'
    },
    button: {
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      backgroundColor: '#3b82f6',
      color: 'white',
      width: '100%',
      marginTop: '1rem'
    },
    input: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      marginBottom: '1rem',
      boxSizing: 'border-box'
    }
  };

  if (user) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1>🛡️ Token Exchange</h1>
          <p>Welcome, {user.username}!</p>
          <p>Token features will go here...</p>
          <button onClick={handleLogout} style={{...styles.button, backgroundColor: '#ef4444'}}>
            🚪 Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <h1>🛡️ Token Exchange</h1>
          <p>Secure DOV & DJR token trading</p>
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
          style={styles.input}
          placeholder="Email"
        />

        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          style={styles.input}
          placeholder="Password"
        />

        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value.toUpperCase() })}
          style={styles.input}
          placeholder="Username (ABC123)"
          maxLength={6}
        />

        <button onClick={handleRegister} style={styles.button}>
          Register
        </button>
        
        <button onClick={handleLogin} style={{...styles.button, backgroundColor: '#10b981'}}>
          Login
        </button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
