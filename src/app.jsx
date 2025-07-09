import React, { useState, useEffect } from 'react';
import { Search, Send, User, Eye, EyeOff, LogOut, Shield, History } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [allProfiles, setAllProfiles] = useState([]);
  const [transactions, setTransactions] = useState([]);
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

  // Load profiles and set up real-time subscriptions
  useEffect(() => {
    if (user) {
      loadProfiles();
      loadTransactions();
      setupRealtimeSubscriptions();
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

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          sender:profiles!sender_id(username),
          recipient:profiles!recipient_id(username)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to profile changes
    const profileSubscription = supabase
      .channel('profiles')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        () => {
          loadProfiles();
          if (user) loadUserProfile(user.id);
        }
      )
      .subscribe();

    // Subscribe to transaction changes
    const transactionSubscription = supabase
      .channel('transactions')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'transactions' }, 
        () => {
          loadTransactions();
        }
      )
      .subscribe();

    return () => {
      profileSubscription.unsubscribe();
      transactionSubscription.unsubscribe();
    };
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

  // Rate limiting for actions
  const rateLimitMap = new Map();
  const isRateLimited = (action, limitMs = 5000) => {
    const key = `${user?.id}-${action}`;
    const lastAction = rateLimitMap.get(key);
    const now = Date.now();
    
    if (lastAction && now - lastAction < limitMs) {
      return true;
    }
    
    rateLimitMap.set(key, now);
    return false;
  };

  // Input sanitization
  const sanitizeInput = (input) => {
    return input.trim().replace(/[<>]/g, '');
  };

  // Handle registration
  const handleRegister = async () => {
    if (isRateLimited('register', 10000)) {
      setMessage('Please wait before trying again');
      return;
    }

    const email = sanitizeInput(formData.email);
    const password = formData.password;
    const username = sanitizeInput(formData.username.toUpperCase());

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
        if (error.message.includes('already registered')) {
          setMessage('Email already registered');
        } else if (error.message.includes('duplicate')) {
          setMessage('Username already taken');
        } else {
          setMessage(error.message);
        }
        return;
      }

      if (data.user && !data.user.email_confirmed_at) {
        setMessage('Please check your email for confirmation link');
      } else {
        setMessage('Registration successful!');
      }
      
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
    if (isRateLimited('login', 3000)) {
      setMessage('Please wait before trying again');
      return;
    }

    const email = sanitizeInput(formData.email);
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
    if (isRateLimited('transfer', 2000)) {
      setMessage('Please wait before sending another transfer');
      return;
    }

    const recipient = sanitizeInput(transferData.recipient.toUpperCase());
    const amount = parseFloat(transferData.amount);

    if (!recipient || !amount) {
      setMessage('Please fill in recipient and amount');
      return;
    }

    if (amount <= 0) {
      setMessage('Amount must be greater than 0');
      return;
    }

    if (amount > 1000000) {
      setMessage('Amount too large for single transfer');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show login/register
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-blue-500 mr-2" />
              <h1 className="text-3xl font-bold text-gray-800">Token Exchange</h1>
            </div>
            <p className="text-gray-600">Secure DOV & DJR token trading</p>
          </div>

          <div className="flex mb-6">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 px-4 rounded-l-lg font-medium transition-colors ${
                activeTab === 'login'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 px-4 rounded-r-lg font-medium transition-colors ${
                activeTab === 'register'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Register
            </button>
          </div>

          {message && (
            <div className={`p-3 rounded-lg mb-4 ${
              message.includes('successful') || message.includes('check your email')
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter your email"
                maxLength={100}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder={activeTab === 'register' ? 'Min 8 characters' : 'Enter your password'}
                  maxLength={128}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {activeTab === 'register' && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Username (3 letters + 3 numbers)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toUpperCase() })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="ABC123"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, username: generateUsername() })}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Random
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={activeTab === 'login' ? handleLogin : handleRegister}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <Shield className="h-8 w-8 text-blue-500 mr-2" />
                Token Exchange
              </h1>
              <p className="text-gray-600">Welcome, {profile?.username}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Token Balances */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Tokens</h2>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-blue-800">Palomas (DOV)</h3>
                    <p className="text-sm text-blue-600">Doves</p>
                  </div>
                  <div className="text-2xl font-bold text-blue-800">
                    {formatNumber(profile?.dov_balance || 0)}
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-purple-800">Palomitas (DJR)</h3>
                    <p className="text-sm text-purple-600">Little Doves</p>
                  </div>
                  <div className="text-2xl font-bold text-purple-800">
                    {formatNumber(profile?.djr_balance || 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Send Tokens */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Send Tokens</h2>
            
            {message && (
              <div className={`p-3 rounded-lg mb-4 ${
                message.includes('successful') || message.includes('completed')
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}

            <div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Recipient Username
                </label>
                <input
                  type="text"
                  value={transferData.recipient}
                  onChange={(e) => setTransferData({ ...transferData, recipient: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="ABC123"
                  maxLength={6}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Token Type
                </label>
                <select
                  value={transferData.token}
                  onChange={(e) => setTransferData({ ...transferData, token: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="DOV">DOV (Palomas)</option>
                  <option value="DJR">DJR (Palomitas)</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={transferData.amount}
                  onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="0.00"
                  min="0"
                  max="1000000"
                  step="0.01"
                />
              </div>

              <button
                onClick={handleTransfer}
                disabled={isTransferring}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send size={20} />
                {isTransferring ? 'Sending...' : 'Send Tokens'}
              </button>
            </div>
          </div>

          {/* User Search */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Find Users</h2>
            
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Search by username..."
                  maxLength={6}
                />
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <p className="text-gray-500 text-center">No users found</p>
              ) : (
                filteredUsers.map(userProfile => (
                  <div
                    key={userProfile.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{userProfile.username}</p>
                        <p className="text-sm text-gray-600">
                          DOV: {formatNumber(userProfile.dov_balance)} | DJR: {formatNumber(userProfile.djr_balance)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setTransferData({ ...transferData, recipient: userProfile.username })}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      Send
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <History size={20} />
              Recent Transactions
            </h2>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center">No transactions yet</p>
              ) : (
                transactions.map(transaction => (
                  <div
                    key={transaction.id}
                    className={`p-3 rounded-lg border ${
                      transaction.sender_id === user.id 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
