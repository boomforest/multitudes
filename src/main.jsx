import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Simple icons as text (since we can't import lucide-react easily in single file)
const Icons = {
  Shield: () => <span>🛡️</span>,
  Eye: () => <span>👁️</span>,
  EyeOff: () => <span>🙈</span>,
  Send: () => <span>📤</span>,
  Search: () => <span>🔍</span>,
  User: () => <span>👤</span>,
  LogOut: () => <span>🚪</span>,
  History: () => <span>📜</span>
};

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [allProfiles, setAllProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [searchTerm, setSearchTerm] = useState('');
  const [transferData, setTransferData] = useState({
    recipient: '',
    token: 'DOV',
    amount: ''
  });
  const [message, setMessage] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });

  // Initialize auth state
  useEffect(() => {
    getInitialSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load profiles when user logs in
  useEffect(() => {
    if (user) {
      loadProfiles();
    }
  }, [user]);

  const getInitialSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await loadUserProfile(session.user.id);
    }
    setLoading(false);
  };

  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage('Error loading profile');
    }
  };

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAllProfiles(data);
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  // Generate random username
  const generateUsername = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let username = '';
    
    for (let i = 0; i < 3; i++) {
      username += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (let i = 0; i < 3; i++) {
      username += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return username;
  };

  // Validate username format
  const validateUsername = (username) => {
    const regex = /^[A-Z]{3}[0-9]{3}$/;
    return regex.test(username);
  };

  // Handle registration
  const handleRegister = async () => {
    const email = formData.email.trim();
    const password = formData.password;
    const username = formData.username.trim().toUpperCase();

    if (!email || !password || !username) {
      setMessage('Please fill in all fields');
      return;
    }

    if (!validateUsername(username)) {
      setMessage('Username must be 3 letters followed by 3 numbers (e.g., ABC123)');
      return;
    }

    if (password.length < 8) {
      setMessage('Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage('Registration successful!');
      setFormData({ email: '', password: '', username: '' });
      
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle login
  const handleLogin = async () => {
    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setMessage('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setMessage('Invalid email or password');
        return;
      }

      setMessage('Login successful!');
      setFormData({ email: '', password: '', username: '' });
      
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setMessage('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handle token transfer
  const handleTransfer = async () => {
    const recipient = transferData.recipient.trim().toUpperCase();
    const amount = parseFloat(transferData.amount);

    if (!recipient || !amount) {
      setMessage('Please fill in recipient and amount');
      return;
    }

    if (amount <= 0) {
      setMessage('Amount must be greater than 0');
      return;
    }

    try {
      setIsTransferring(true);
      
      const { data, error } = await supabase
        .rpc('transfer_tokens', {
          recipient_username: recipient,
          token_type: transferData.token,
          amount: amount
        });

      if (error) throw error;

      if (data.success) {
        setMessage(data.message);
        setTransferData({ recipient: '', token: 'DOV', amount: '' });
        // Reload profiles to update balances
        loadProfiles();
        loadUserProfile(user.id);
      } else {
        setMessage(data.error);
      }
      
    } catch (error) {
      console.error('Transfer error:', error);
      setMessage('Transfer failed. Please try again.');
    } finally {
      setIsTransferring(false);
    }
  };

  // Filter users for search
  const filteredUsers = allProfiles.filter(userProfile => 
    userProfile.username.toLowerCase().includes(searchTerm.toLowerCase()) && 
    userProfile.id !== user?.id
  );

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
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
      marginBottom: '1.5rem'
    },
    button: {
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.2s'
    },
    input: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      marginBottom: '1rem'
    }
  };

  if (loading) {
    return (
      <div style={{...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: '2rem', marginBottom: '1rem'}}>⏳</div>
          <p style={{color: '#6b7280'}}>Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show login/register
  if (!user) {
    return (
      <div style={{...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{...styles.card, width: '100%', maxWidth: '28rem'}}>
          <div style={{textAlign: 'center', marginBottom: '2rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem'}}>
              <Icons.Shield />
              <h1 style={{fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 0 0.5rem'}}>Token Exchange</h1>
            </div>
            <p style={{color: '#6b7280'}}>Secure DOV & DJR token trading</p>
          </div>

          <div style={{display: 'flex', marginBottom: '1.5rem'}}>
            <button
              onClick={() => setActiveTab('login')}
              style={{
                ...styles.button,
                flex: 1,
                backgroundColor: activeTab === 'login' ? '#3b82f6' : '#e5e7eb',
                color: activeTab === 'login' ? 'white' : '#374151',
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0
              }}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('register')}
              style={{
                ...styles.button,
                flex: 1,
                backgroundColor: activeTab === 'register' ? '#3b82f6' : '#e5e7eb',
                color: activeTab === 'register' ? 'white' : '#374151',
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0
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
              backgroundColor: message.includes('successful') ? '#d1fae5' : '#fee2e2',
              color: message.includes('successful') ? '#065f46' : '#991b1b'
            }}>
              {message}
            </div>
          )}

          <div>
            <div style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', color: '#374151', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={styles.input}
                placeholder="Enter your email"
              />
            </div>

            <div style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', color: '#374151', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
                Password
              </label>
              <div style={{position: 'relative'}}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={styles.input}
                  placeholder={activeTab === 'register' ? 'Min 8 characters' : 'Enter your password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '0.625rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                </button>
              </div>
            </div>

            {activeTab === 'register' && (
              <div style={{marginBottom: '1rem'}}>
                <label style={{display: 'block', color: '#374151', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
                  Username (3 letters + 3 numbers)
                </label>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toUpperCase() })}
                    style={{...styles.input, flex: 1, marginBottom: 0}}
                    placeholder="ABC123"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, username: generateUsername() })}
                    style={{
                      ...styles.button,
                      backgroundColor: '#6b7280',
                      color: 'white'
                    }}
                  >
                    Random
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={activeTab === 'login' ? handleLogin : handleRegister}
              disabled={loading}
              style={{
                ...styles.button,
                width: '100%',
                backgroundColor: '#3b82f6',
                color: 'white',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? 'Loading...' : (activeTab === 'login' ? 'Login' : 'Register')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main app interface
  return (
    <div style={styles.container}>
      <div style={{maxWidth: '90rem', margin: '0 auto'}}>
        {/* Header */}
        <div style={styles.card}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <h1 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center'}}>
                <Icons.Shield />
                <span style={{marginLeft: '0.5rem'}}>Token Exchange</span>
              </h1>
              <p style={{color: '#6b7280', margin: '0.25rem 0 0 0'}}>Welcome, {profile?.username}!</p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                ...styles.button,
                backgroundColor: '#ef4444',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Icons.LogOut />
              Logout
            </button>
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
          {/* Token Balances */}
          <div style={styles.card}>
            <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem'}}>Your Tokens</h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <div style={{background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', padding: '1rem', borderRadius: '0.5rem'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                    <h3 style={{fontWeight: '600', color: '#1e40af', margin: 0}}>Palomas (DOV)</h3>
                    <p style={{fontSize: '0.875rem', color: '#3730a3', margin: '0.25rem 0 0 0'}}>Doves</p>
                  </div>
                  <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af'}}>
                    {formatNumber(profile?.dov_balance || 0)}
                  </div>
                </div>
              </div>
              <div style={{background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)', padding: '1rem', borderRadius: '0.5rem'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                    <h3 style={{fontWeight: '600', color: '#7c3aed', margin: 0}}>Palomitas (DJR)</h3>
                    <p style={{fontSize: '0.875rem', color: '#6b21a8', margin: '0.25rem 0 0 0'}}>Little Doves</p>
                  </div>
                  <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#7c3aed'}}>
                    {formatNumber(profile?.djr_balance || 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Send Tokens */}
          <div style={styles.card}>
            <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem'}}>Send Tokens</h2>
            
            {message && (
              <div style={{
                padding: '0.75rem',
                borderRadius: '0.375rem',
                marginBottom: '1rem',
                backgroundColor: message.includes('successful') || message.includes('completed') ? '#d1fae5' : '#fee2e2',
                color: message.includes('successful') || message.includes('completed') ? '#065f46' : '#991b1b'
              }}>
                {message}
              </div>
            )}

            <div>
              <div style={{marginBottom: '1rem'}}>
                <label style={{display: 'block', color: '#374151', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
                  Recipient Username
                </label>
                <input
                  type="text"
                  value={transferData.recipient}
                  onChange={(e) => setTransferData({ ...transferData, recipient: e.target.value.toUpperCase() })}
                  style={styles.input}
                  placeholder="ABC123"
                  maxLength={6}
                />
              </div>

              <div style={{marginBottom: '1rem'}}>
                <label style={{display: 'block', color: '#374151', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
