import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  const [supabase, setSupabase] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize Supabase
  useEffect(() => {
    const initSupabase = async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const client = createClient(
          import.meta.env.VITE_SUPABASE_URL,
          import.meta.env.VITE_SUPABASE_ANON_KEY
        );
        setSupabase(client);
        setMessage('✅ Supabase connected!');

        // Check if user is already logged in
        const { data: { session } } = await client.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id, client);
        }
      } catch (error) {
        setMessage('❌ Supabase connection failed');
        console.error('Supabase error:', error);
      }
    };

    initSupabase();
  }, []);

  const loadUserProfile = async (userId, client = supabase) => {
    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Profile error:', error);
        setMessage('Profile not found');
      } else {
        setProfile(data);
        setMessage(`Welcome back, ${data.username}!`);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleRegister = async () => {
    if (!supabase) {
      setMessage('Please wait for connection...');
      return;
    }

    if (!formData.email || !formData.password || !formData.username) {
      setMessage('Please fill in all fields');
      return;
    }

    if (!/^[A-Z]{3}[0-9]{3}$/.test(formData.username)) {
      setMessage('Username must be 3 letters + 3 numbers (e.g., ABC123)');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username
          }
        }
      });

      if (error) {
        setMessage('Registration failed: ' + error.message);
      } else {
        setMessage('✅ Registration successful!');
        setUser(data.user);
        // Try to load profile after a short delay
        setTimeout(() => loadUserProfile(data.user.id), 1000);
      }
    } catch (err) {
      setMessage('❌ Registration error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!supabase) {
      setMessage('Please wait for connection...');
      return;
    }

    if (!formData.email || !formData.password) {
      setMessage('Please fill in email and password');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) {
        setMessage('Login failed: ' + error.message);
      } else {
        setMessage('✅ Login successful!');
        setUser(data.user);
        await loadUserProfile(data.user.id);
      }
    } catch (err) {
      setMessage('❌ Login error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setMessage('Logged out');
    setFormData({ email: '', password: '', username: '' });
  };

  // Format numbers with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0);
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
          maxWidth: '32rem',
          width: '100%'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1>🛡️ Token Exchange</h1>
            <p>Welcome, {profile?.username || user.email}!</p>
          </div>

          {/* Token Balances */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Your Tokens</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                padding: '1rem',
                borderRadius: '0.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontWeight: '600', color: '#1e40af', margin: 0 }}>Palomas (DOV)</h3>
                    <p style={{ fontSize: '0.875rem', color: '#3730a3', margin: '0.25rem 0 0 0' }}>Doves</p>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>
                    {formatNumber(profile?.dov_balance)}
                  </div>
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
                padding: '1rem',
                borderRadius: '0.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontWeight: '600', color: '#7c3aed', margin: 0 }}>Palomitas (DJR)</h3>
                    <p style={{ fontSize: '0.875rem', color: '#6b21a8', margin: '0.25rem 0 0 0' }}>Little Doves</p>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7c3aed' }}>
                    {formatNumber(profile?.djr_balance)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.5rem 1rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '500'
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

        {/* Login/Register Tabs */}
        <div style={{ display: 'flex', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('login')}
            style={{
              flex: 1,
              padding: '0.5rem 1rem',
              backgroundColor: activeTab === 'login' ? '#3b82f6' : '#e5e7eb',
              color: activeTab === 'login' ? 'white' : '#374151',
              border: 'none',
              borderTopLeftRadius: '0.375rem',
              borderBottomLeftRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('register')}
            style={{
              flex: 1,
              padding: '0.5rem 1rem',
              backgroundColor: activeTab === 'register' ? '#3b82f6' : '#e5e7eb',
              color: activeTab === 'register' ? 'white' : '#374151',
              border: 'none',
              borderTopRightRadius: '0.375rem',
              borderBottomRightRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Register
          </button>
        </div>

        {message && (
          <div style={{
            padding: '0.75rem',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
            backgroundColor: message.includes('✅') ? '#d1fae5' : message.includes('❌') ? '#fee2e2' : '#fef3c7',
            color: message.includes('✅') ? '#065f46' : message.includes('❌') ? '#991b1b' : '#92400e'
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

        {activeTab === 'register' && (
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
        )}

        <button 
          onClick={activeTab === 'login' ? handleLogin : handleRegister}
          disabled={loading || !supabase}
          style={{
            width: '100%',
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '500',
            opacity: (loading || !supabase) ? 0.5 : 1
          }}
        >
          {loading ? 'Loading...' : (activeTab === 'login' ? 'Login' : 'Register')}
        </button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
