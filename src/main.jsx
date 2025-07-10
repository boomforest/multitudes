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
          <h1>
