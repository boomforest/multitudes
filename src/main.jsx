import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  const [supabase, setSupabase] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [allProfiles, setAllProfiles] = useState([]);
  const [activeTab, setActiveTab] = useState('login');
  const [showSendForm, setShowSendForm] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [transferData, setTransferData] = useState({
    recipient: '',
    amount: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
        setMessage('');

        // Check if user is already logged in
        const { data: { session } } = await client.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await ensureProfileExists(session.user, client);
          await loadAllProfiles(client);
        }
      } catch (error) {
        setMessage('❌ Connection failed');
        console.error('Supabase error:', error);
      }
    };

    initSupabase();
  }, []);

  // BULLETPROOF: Ensure profile exists for any authenticated user
  const ensureProfileExists = async (authUser, client = supabase) => {
    try {
      console.log('Checking profile for user:', authUser.id);
      
      // Try to get existing profile
      const { data: existingProfile, error: fetchError } = await client
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (existingProfile) {
        console.log('Profile exists:', existingProfile);
        setProfile(existingProfile);
        return existingProfile;
      }

      // Profile doesn't exist - create it
      console.log('Profile missing, creating for:', authUser.user_metadata?.username || authUser.email);
      
      const username = authUser.user_metadata?.username || `USER${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
      const isJPR333 = username === 'JPR333';
      
      const newProfile = {
        id: authUser.id,
        username: username,
        email: authUser.email,
        dov_balance: isJPR333 ? 1000000 : 0,
        djr_balance: isJPR333 ? 1000000 : 0
      };

      const { data: createdProfile, error: createError } = await client
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

      if (createError) {
        console.error('Profile creation failed:', createError);
        setMessage('Profile creation failed: ' + createError.message);
        return null;
      }

      console.log('Profile created successfully:', createdProfile);
      setProfile(createdProfile);
      setMessage('Profile created successfully!');
      return createdProfile;

    } catch (error) {
      console.error('Error in ensureProfileExists:', error);
      setMessage('Error creating profile: ' + error.message);
      return null;
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
      setMessage('Creating account...');

      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username
          }
        }
      });

      if (authError) {
        setMessage('Registration failed: ' + authError.message);
        return;
      }

      if (!authData.user) {
        setMessage('Registration failed: No user returned');
        return;
      }

      setMessage('Account created, setting up profile...');

      // Step 2: Create profile immediately
      const profile = await ensureProfileExists(authData.user);
      
      if (profile) {
        setUser(authData.user);
        await loadAllProfiles();
        setMessage('Registration successful!');
        setFormData({ email: '', password: '', username: '' });
      } else {
        setMessage('Account created but profile setup failed. Please try logging in.');
      }

    } catch (err) {
      console.error('Registration error:', err);
      setMessage('Registration error: ' + err.message);
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
      setMessage('Logging in...');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) {
        setMessage('Login failed: ' + error.message);
        return;
      }

      setMessage('Login successful, checking profile...');
      setUser(data.user);

      // BULLETPROOF: Always ensure profile exists on login
      await ensureProfileExists(data.user);
      await loadAllProfiles();
      
      setFormData({ email: '', password: '', username: '' });
      
    } catch (err) {
      console.error('Login error:', err);
      setMessage('Login error: ' + err.message);
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
    setShowSettings(false);
    setShowSendForm(null);
    setMessage('');
    setFormData({ email: '', password: '', username: '' });
    setTransferData({ recipient: '', amount: '' });
  };

  const handleTransfer = async (tokenType) => {
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
      setMessage('Cannot send to yourself');
      return;
    }

    // Check if sender has enough tokens
    const currentBalance = tokenType === 'DOV' ? profile.dov_balance : profile.djr_balance;
    if (currentBalance < amount) {
      setMessage(`Insufficient ${tokenType} tokens`);
      return;
    }

    try {
      setIsTransferring(true);

      // Manual transfer using direct updates
      const senderField = tokenType === 'DOV' ? 'dov_balance' : 'djr_balance';
      
      // Update sender balance
      const { error: senderError } = await supabase
        .from('profiles')
        .update({ 
          [senderField]: tokenType === 'DOV' 
            ? profile.dov_balance - amount 
            : profile.djr_balance - amount 
        })
        .eq('id', user.id);

      if (senderError) throw senderError;

      // Update recipient balance
      const { error: recipientError } = await supabase
        .from('profiles')
        .update({ 
          [senderField]: tokenType === 'DOV'
            ? recipientProfile.dov_balance + amount
            : recipientProfile.djr_balance + amount
        })
        .eq('id', recipientProfile.id);

      if (recipientError) throw recipientError;

      setMessage(`Sent ${amount} ${tokenType} to ${recipient}!`);
      setTransferData({ recipient: '', amount: '' });
      setShowSendForm(null);
      
      // Refresh balances
      await ensureProfileExists(user);
      await loadAllProfiles();
    } catch (err) {
      setMessage('Transfer failed: ' + err.message);
    } finally {
      setIsTransferring(false);
    }
  };

  // Format numbers
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0);
  };

  if (user && showSendForm) {
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
          {/* Back Button */}
          <button
            onClick={() => setShowSendForm(null)}
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
            color: '#d2691e',
            marginBottom: '2rem',
            fontWeight: 'normal'
          }}>
            Send {showSendForm}
          </h1>

          {message && (
            <div style={{
              padding: '1rem',
              marginBottom: '2rem',
              backgroundColor: message.includes('Sent') ? '#d4edda' : '#f8d7da',
              color: message.includes('Sent') ? '#155724' : '#721c24',
              borderRadius: '20px'
            }}>
              {message}
            </div>
          )}

          <div style={{ marginBottom: '2rem' }}>
            <input
              type="text"
              value={transferData.recipient}
              onChange={(e) => setTransferData({ ...transferData, recipient: e.target.value.toUpperCase() })}
              placeholder="Recipient Username (ABC123)"
              maxLength={6}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.2rem',
                border: '2px solid #d2691e',
                borderRadius: '25px',
                textAlign: 'center',
                marginBottom: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />

            <input
              type="number"
              value={transferData.amount}
              onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
              placeholder="Amount"
              min="0"
              step="0.01"
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.2rem',
                border: '2px solid #d2691e',
                borderRadius: '25px',
                textAlign: 'center',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            onClick={() => handleTransfer(showSendForm)}
            disabled={isTransferring}
            style={{
              background: 'linear-gradient(45deg, #d2691e, #cd853f)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              padding: '1rem 3rem',
              fontSize: '1.2rem',
              fontWeight: '500',
              cursor: 'pointer',
              opacity: isTransferring ? 0.5 : 1,
              boxShadow: '0 4px 15px rgba(210, 105, 30, 0.3)'
            }}
          >
            {isTransferring ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5dc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '2rem 1rem',
        position: 'relative'
      }}>
        <div style={{
          maxWidth: '400px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '3rem'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '20px',
              padding: '0.5rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontWeight: '500' }}>{profile?.username}</span>
              <button
                onClick={() => setShowSettings(!showSettings)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                ⚙️
              </button>
            </div>

            {/* Settings Menu */}
            {showSettings && (
              <div style={{
                position: 'absolute',
                top: '4rem',
                left: '1rem',
                background: 'white',
                borderRadius: '15px',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                padding: '0.5rem',
                zIndex: 1000
              }}>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'transparent',
                    color: '#ef4444',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>

          {/* Status Message */}
          {message && (
            <div style={{
              padding: '1rem',
              marginBottom: '2rem',
              backgroundColor: message.includes('successful') || message.includes('Sent') ? '#d4edda' : 
                             message.includes('failed') ? '#f8d7da' : '#fff3cd',
              color: message.includes('successful') || message.includes('Sent') ? '#155724' : 
                     message.includes('failed') ? '#721c24' : '#856404',
              borderRadius: '15px',
              fontSize: '0.9rem'
            }}>
              {message}
            </div>
          )}

          {/* Palomas Section */}
          <div style={{ marginBottom: '4rem' }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>
              🕊️
            </div>
            <h2 style={{
              fontSize: '3.5rem',
              color: '#d2691e',
              margin: '0 0 1rem 0',
              fontWeight: 'normal'
            }}>
              Palomas
            </h2>
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '25px',
              padding: '0.75rem 1.5rem',
              display: 'inline-block',
              fontSize: '1.5rem',
              fontWeight: '500',
              color: '#8b4513',
              marginBottom: '2rem'
            }}>
              {formatNumber(profile?.dov_balance)}
            </div>
            <br />
            <button
              onClick={() => setShowSendForm('DOV')}
              style={{
                background: 'linear-gradient(45deg, #d2691e, #cd853f)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                padding: '1rem 3rem',
                fontSize: '1.2rem',
                fontWeight: '500',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(210, 105, 30, 0.3)'
              }}
            >
              Send
            </button>
          </div>

          {/* Palomitas Section */}
          <div>
            <h2 style={{
              fontSize: '3.5rem',
              color: '#8b4513',
              margin: '0 0 1rem 0',
              fontWeight: 'normal'
            }}>
              Palomitas
            </h2>
            <div style={{
              fontSize: '2rem',
              marginBottom: '1rem'
            }}>
              🕊️
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '25px',
              padding: '0.75rem 1.5rem',
              display: 'inline-block',
              fontSize: '1.5rem',
              fontWeight: '500',
              color: '#8b4513',
              marginBottom: '2rem'
            }}>
              {formatNumber(profile?.djr_balance)}
            </div>
            <br />
            <button
              onClick={() => setShowSendForm('DJR')}
              style={{
                background: 'linear-gradient(45deg, #d2691e, #cd853f)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                padding: '1rem 3rem',
                fontSize: '1.2rem',
                fontWeight: '500',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(210, 105, 30, 0.3)'
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5dc',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '25px',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          margin: '0 0 0.5rem 0',
          color: '#d2691e'
        }}>
          GRAIL
        </h1>
        <p style={{ color: '#8b4513', margin: '0 0 2rem 0' }}>Token Exchange</p>

        {/* Login/Register Tabs */}
        <div style={{ display: 'flex', marginBottom: '1.5rem', borderRadius: '20px', overflow: 'hidden' }}>
          <button
            onClick={() => setActiveTab('login')}
            style={{
              flex: 1,
              padding: '1rem',
              backgroundColor: activeTab === 'login' ? '#d2691e' : '#f0f0f0',
              color: activeTab === 'login' ? 'white' : '#8b4513',
              border: 'none',
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
              padding: '1rem',
              backgroundColor: activeTab === 'register' ? '#d2691e' : '#f0f0f0',
              color: activeTab === 'register' ? 'white' : '#8b4513',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Register
          </button>
        </div>

        {message && (
          <div style={{
            padding: '1rem',
            borderRadius: '15px',
            marginBottom: '1rem',
            backgroundColor: message.includes('successful') ? '#d4edda' : 
                           message.includes('failed') ? '#f8d7da' : '#fff3cd',
            color: message.includes('successful') ? '#155724' : 
                   message.includes('failed') ? '#721c24' : '#856404',
            fontSize: '0.9rem'
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
            padding: '1rem',
            border: '2px solid #e0e0e0',
            borderRadius: '15px',
            marginBottom: '1rem',
            boxSizing: 'border-box',
            fontSize: '1rem',
            outline: 'none'
          }}
        />

        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Password"
          style={{
            width: '100%',
            padding: '1rem',
            border: '2px solid #e0e0e0',
            borderRadius: '15px',
            marginBottom: '1rem',
            boxSizing: 'border-box',
            fontSize: '1rem',
            outline: 'none'
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
              padding: '1rem',
              border: '2px solid #e0e0e0',
              borderRadius: '15px',
              marginBottom: '1rem',
              boxSizing: 'border-box',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
        )}

        <button 
          onClick={activeTab === 'login' ? handleLogin : handleRegister}
          disabled={loading || !supabase}
          style={{
            width: '100%',
            padding: '1rem',
            background: 'linear-gradient(45deg, #d2691e, #cd853f)',
            color: 'white',
            border: 'none',
            borderRadius: '15px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            opacity: (loading || !supabase) ? 0.5 : 1,
            boxShadow: '0 4px 15px rgba(210, 105, 30, 0.3)'
          }}
        >
          {loading ? 'Loading...' : (activeTab === 'login' ? 'Login' : 'Register')}
        </button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
