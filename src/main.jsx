import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'

// Add Supabase import inside the function to avoid top-level await issues
function App() {
  const [supabase, setSupabase] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });

  // Initialize Supabase when component mounts
  useEffect(() => {
    const initSupabase = async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseClient = createClient(
          import.meta.env.VITE_SUPABASE_URL,
          import.meta.env.VITE_SUPABASE_ANON_KEY
        );
        setSupabase(supabaseClient);
        setMessage('✅ Supabase connected!');
      } catch (error) {
        setMessage('❌ Supabase connection failed');
        console.error('Supabase error:', error);
      }
    };

    initSupabase();
  }, []);

  // Simple login form (with Supabase test)
  const handleRegister = () => {
    if (!formData.email || !formData.password || !formData.username) {
      setMessage('Please fill in all fields');
      return;
    }
    
    if (supabase) {
      setMessage('Supabase is ready for registration!');
    } else {
      setMessage('Supabase not connected yet');
    }
    
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
      borderRadius:
