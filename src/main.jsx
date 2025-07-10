import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  const [supabase, setSupabase] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [allProfiles, setAllProfiles] = useState([]);
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [transferData, setTransferData] = useState({
    recipient: '',
    token: 'DOV',
    amount: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

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
          await loadAllProfiles(client);
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
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadAllProfiles = async (client = supabase) => {
    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAllProfiles(data || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
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
        setTimeout(() => {
          loadUserProfile(data.user.id);
          loadAllProfiles();
        }, 1000);
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
        await loadAllProfiles();
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
    setAllProfiles([]);
    setMessage('Logged out');
    setFormData({ email: '', password: '', username: '' });
    setTransferData({ recipient: '', token: 'DOV', amount: '' });
  };

  const handleTransfer = async () => {
    if (!supabase || !profile) {
      setMessage('Please wait for connection...');
      return;
    }

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

    // Find recipient
    const recipientProfile = allProfiles.find(p => p.username === recipient);
    if (!recipientProfile) {
      setMessage('Recipient not found');
      return;
    }

    if (recipientProfile.id === user.id) {
      setMessage('Cannot send tokens to yourself');
      return;
    }

    // Check if sender has enough tokens
    const currentBalance = transferData.token === 'DOV' ? profile.dov_balance : profile.djr_balance;
    if (currentBalance < amount) {
      setMessage(`Insufficient ${transferData.token} tokens`);
      return;
    }

    try {
      setIsTransferring(true);

      // Perform the transfer using database transactions
      const { data, error } = await supabase.rpc('transfer_tokens_simple', {
        sender_id: user.id,
        recipient_id: recipientProfile.id,
        token_type: transferData.token,
        amount: amount
      });

      if (error) {
        // If the RPC function doesn't exist, do manual transfer
        console.log('RPC failed, doing manual transfer');
        await manualTransfer(recipientProfile.id, amount);
      } else {
        setMessage(`✅ Sent ${amount} ${transferData.token} to ${recipient}!`);
        setTransferData({ recipient: '', token: 'DOV', amount: '' });
        
        // Refresh balances
        await loadUserProfile(user.id);
        await loadAllProfiles();
      }
    } catch (err) {
      setMessage('❌ Transfer failed: ' + err.message);
      console.error('Transfer error:', err);
    } finally {
      setIsTransferring(false);
    }
  };

  const manualTransfer = async (recipientId, amount) => {
    // Manual transfer using direct updates
    const senderField = transferData.token === 'DOV' ? 'dov_balance' : 'djr_balance';
    
    // Update sender balance
    const { error: senderError } = await supabase
      .from('profiles')
      .update({ 
        [senderField]: transferData.token === 'DOV' 
          ? profile.dov_balance - amount 
          : profile.djr_balance - amount 
      })
      .eq('id', user.id);

    if (senderError) throw senderError;

    // Update recipient balance
    const recipientProfile = allProfiles.find(p => p.id === recipientId);
    const { error: recipientError } = await supabase
      .from('profiles')
      .update({ 
        [senderField]: transferData.token === 'DOV'
          ? recipientProfile.dov_balance + amount
          : recipientProfile.djr_balance + amount
      })
      .eq('id', recipientId);

    if (recipientError) throw recipientError;

    setMessage(`✅ Sent ${amount} ${transferData.token} to ${transferData.recipient}!`);
    setTransferData({ recipient: '', token: 'DOV', amount: '' });
    
    // Refresh balances
    await loadUserProfile(user.id);
    await loadAllProfiles();
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
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            background: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>🛡️ Token Exchange</h1>
                <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>Welcome, {profile?.username}!</p>
              </div>
              <button 
                onClick={handleLogout}
                style={{
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* Token Balances */}
            <div style={{
              background: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '1.5rem'
            }}>
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

            {/* Send Tokens */}
            <div style={{
              background: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '1.5rem'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Send Tokens</h2>
              
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

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Recipient Username
                </label>
                <input
                  type="text"
                  value={transferData.recipient}
                  onChange={(e) => setTransferData({ ...transferData, recipient: e.target.value.toUpperCase() })}
                  placeholder="ABC123"
                  maxLength={6}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Token Type
                </label>
                <select
                  value={transferData.token}
                  onChange={(e) => setTransferData({ ...transferData, token: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="DOV">DOV (Palomas)</option>
                  <option value="DJR">DJR (Palomitas)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Amount
                </label>
                <input
                  type="number"
                  value={transferData.amount}
                  onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                onClick={handleTransfer}
                disabled={isTransferring}
                style={{
                  width: '100%',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                  opacity: isTransferring ? 0.5 : 1
                }}
              >
                {isTransferring ? 'Sending...' : '📤 Send Tokens'}
              </button>
            </div>

            {/* Users List */}
            <div style={{
              background: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '1.5rem'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Other Users</h2>
              
              <div style={{ maxHeight: '20rem', overflowY: 'auto' }}>
                {allProfiles.filter(p => p.id !== user?.id).length === 0 ? (
                  <p style={{ color: '#6b7280', textAlign: 'center' }}>No other users yet</p>
                ) : (
                  allProfiles.filter(p => p.id !== user?.id).map(userProfile => (
                    <div
                      key={userProfile.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '0.375rem',
                        marginBottom: '0.5rem'
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: '500', margin: 0 }}>{userProfile.username}</p>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.125rem 0 0 0' }}>
                          DOV: {formatNumber(userProfile.dov_balance)} | DJR: {formatNumber(userProfile.djr_balance)}
                        </p>
                      </div>
                      <button
                        onClick={() => setTransferData({ ...transferData, recipient: userProfile.username })}
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Send
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
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
