import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import LoginForm from './components/LoginForm'
import FriendsList from './components/FriendsList'
import AddFriend from './components/AddFriend'
import OfrendaProfile from './components/OfrendaProfile'
import ManifestoPopup from './components/ManifestoPopup'
import FloatingGrailButton from './components/FloatingGrailButton'

function App() {
  // Core state
  const [supabase, setSupabase] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [friends, setFriends] = useState([])
  const [ofrendaData, setOfrendaData] = useState(null)
  
  // UI state
  const [activeTab, setActiveTab] = useState('login')
  const [currentView, setCurrentView] = useState('friends') // 'friends', 'add-friend', 'ofrenda'
  const [showManifesto, setShowManifesto] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    name: ''
  })
  
  // Loading states
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const initSupabase = async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const client = createClient(
          import.meta.env.VITE_SUPABASE_URL,
          import.meta.env.VITE_SUPABASE_ANON_KEY
        )
        setSupabase(client)
        setMessage('')

        const { data: { session } } = await client.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          await ensureProfileExists(session.user, client)
          await loadFriends(client)
          await loadOfrendaData(client)
        }
      } catch (error) {
        setMessage('Connection failed')
        console.error('Supabase error:', error)
      }
    }
    initSupabase()
  }, [])

  const ensureProfileExists = async (authUser, client = supabase) => {
    try {
      const { data: existingProfile } = await client
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (existingProfile) {
        setProfile(existingProfile)
        return existingProfile
      }

      const username = authUser.user_metadata?.username || 'USER' + Math.random().toString(36).substr(2, 3).toUpperCase()
      
      const newProfile = {
        id: authUser.id,
        username: username,
        email: authUser.email,
        name: authUser.user_metadata?.name || '',
        dov_balance: 0,
        djr_balance: 0
      }

      const { data: createdProfile, error: createError } = await client
        .from('profiles')
        .insert([newProfile])
        .select()
        .single()

      if (createError) {
        setMessage('Profile creation failed: ' + createError.message)
        return null
      }

      setProfile(createdProfile)
      setMessage('Profile created successfully!')
      return createdProfile
    } catch (error) {
      setMessage('Error creating profile: ' + error.message)
      return null
    }
  }

  const loadFriends = async (client = supabase) => {
    if (!client || !user) return

    try {
      const { data, error } = await client
        .from('friends')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setFriends(data || [])
    } catch (error) {
      console.error('Error loading friends:', error)
    }
  }

  const loadOfrendaData = async (client = supabase) => {
    if (!client || !user) return

    try {
      const { data, error } = await client
        .from('ofrenda_data')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error
      }
      
      setOfrendaData(data)
    } catch (error) {
      console.error('Error loading ofrenda data:', error)
    }
  }

  const handleAddFriend = async (friendData) => {
    if (!supabase || !user) return

    try {
      const newFriend = {
        user_id: user.id,
        friend_name: friendData.name,
        color_code: friendData.color,
        notes: friendData.notes || ''
      }

      const { data, error } = await supabase
        .from('friends')
        .insert([newFriend])
        .select()
        .single()

      if (error) throw error

      setFriends(prev => [data, ...prev])
      setMessage(`Added ${friendData.name} to your friends!`)
      setCurrentView('friends')
    } catch (error) {
      setMessage('Error adding friend: ' + error.message)
    }
  }

  const handleUpdateFriend = async (friendId, updates) => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('friends')
        .update(updates)
        .eq('id', friendId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setFriends(prev => prev.map(friend => 
        friend.id === friendId ? data : friend
      ))
      setMessage('Friend updated!')
    } catch (error) {
      setMessage('Error updating friend: ' + error.message)
    }
  }

  const handleDeleteFriend = async (friendId) => {
    if (!supabase) return

    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', friendId)
        .eq('user_id', user.id)

      if (error) throw error

      setFriends(prev => prev.filter(friend => friend.id !== friendId))
      setMessage('Friend removed')
    } catch (error) {
      setMessage('Error removing friend: ' + error.message)
    }
  }

  const handleSaveOfrendaData = async (data) => {
    if (!supabase || !user) return

    try {
      // Check if record exists
      const { data: existingData, error: fetchError } = await supabase
        .from('ofrenda_data')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is fine
        throw fetchError
      }

      const ofrendaRecord = {
        user_id: user.id,
        ...data
      }

      let result
      if (existingData) {
        // Update existing record
        result = await supabase
          .from('ofrenda_data')
          .update(ofrendaRecord)
          .eq('user_id', user.id)
          .select()
          .single()
      } else {
        // Create new record
        result = await supabase
          .from('ofrenda_data')
          .insert([ofrendaRecord])
          .select()
          .single()
      }

      if (result.error) throw result.error

      setOfrendaData(result.data)
      setMessage('Ofrenda data saved!')
      setCurrentView('friends')
    } catch (error) {
      console.error('Error saving ofrenda data:', error)
      setMessage('Error saving ofrenda data: ' + error.message)
    }
  }

  const handleRegister = async () => {
    if (!supabase) {
      setMessage('Please wait for connection...')
      return
    }

    if (!formData.email || !formData.password || !formData.username) {
      setMessage('Please fill in all required fields')
      return
    }

    if (!/^[A-Z]{3}[0-9]{3}$/.test(formData.username)) {
      setMessage('Username must be 3 letters + 3 numbers (e.g., ABC123)')
      return
    }

    try {
      setLoading(true)
      setMessage('Creating account...')

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            name: formData.name
          }
        }
      })

      if (authError) {
        setMessage('Registration failed: ' + authError.message)
        return
      }

      if (!authData.user) {
        setMessage('Registration failed: No user returned')
        return
      }

      setMessage('Account created, setting up profile...')
      const profile = await ensureProfileExists(authData.user)
      
      if (profile) {
        setUser(authData.user)
        await loadFriends()
        await loadOfrendaData()
        setMessage('Registration successful!')
        setFormData({ email: '', password: '', username: '', name: '' })
      } else {
        setMessage('Account created but profile setup failed. Please try logging in.')
      }
    } catch (err) {
      setMessage('Registration error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!supabase) {
      setMessage('Please wait for connection...')
      return
    }

    if (!formData.email || !formData.password) {
      setMessage('Please fill in email and password')
      return
    }

    try {
      setLoading(true)
      setMessage('Logging in...')

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (error) {
        setMessage('Login failed: ' + error.message)
        return
      }

      setMessage('Login successful, loading your data...')
      setUser(data.user)
      await ensureProfileExists(data.user)
      await loadFriends()
      await loadOfrendaData()
      setFormData({ email: '', password: '', username: '', name: '' })
    } catch (err) {
      setMessage('Login error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setProfile(null)
    setFriends([])
    setOfrendaData(null)
    setCurrentView('friends')
    setShowManifesto(false)
    setMessage('')
    setFormData({ email: '', password: '', username: '', name: '' })
  }

  // Render based on current view
  if (user && currentView === 'add-friend') {
    return (
      <>
        <AddFriend
          onBack={() => setCurrentView('friends')}
          onAddFriend={handleAddFriend}
          message={message}
        />
        <FloatingGrailButton onGrailClick={() => setShowManifesto(true)} />
        {showManifesto && <ManifestoPopup onClose={() => setShowManifesto(false)} />}
      </>
    )
  }

  if (user && currentView === 'ofrenda') {
    return (
      <>
        <OfrendaProfile
          onBack={() => setCurrentView('friends')}
          onSave={handleSaveOfrendaData}
          initialData={ofrendaData}
          message={message}
        />
        <FloatingGrailButton onGrailClick={() => setShowManifesto(true)} />
        {showManifesto && <ManifestoPopup onClose={() => setShowManifesto(false)} />}
      </>
    )
  }

  if (user) {
    return (
      <>
        <FriendsList
          friends={friends}
          profile={profile}
          user={user}
          supabase={supabase}
          onAddFriend={() => setCurrentView('add-friend')}
          onEditOfrenda={() => setCurrentView('ofrenda')}
          onUpdateFriend={handleUpdateFriend}
          onDeleteFriend={handleDeleteFriend}
          onLogout={handleLogout}
          onProfileUpdate={setProfile}
          message={message}
        />
        <FloatingGrailButton onGrailClick={() => setShowManifesto(true)} />
        {showManifesto && <ManifestoPopup onClose={() => setShowManifesto(false)} />}
      </>
    )
  }

  return (
    <>
      <LoginForm
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        formData={formData}
        setFormData={setFormData}
        message={message}
        loading={loading}
        supabase={supabase}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
      <FloatingGrailButton onGrailClick={() => setShowManifesto(true)} />
      {showManifesto && <ManifestoPopup onClose={() => setShowManifesto(false)} />}
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
