import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');

  useEffect(() => {
    // Test Supabase connection
    const testConnection = async () => {
      try {
        // Import Supabase
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          import.meta.env.VITE_SUPABASE_URL,
          import.meta.env.VITE_SUPABASE_ANON_KEY
        );
        
        // Try a simple query
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        
        if (error) {
          setConnectionStatus('Database connection failed: ' + error.message);
        } else {
          setConnectionStatus('✅ Supabase connected successfully!');
        }
      } catch (err) {
        setConnectionStatus('❌ Connection error: ' + err.message);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{padding: '20px', fontFamily: 'Arial'}}>
      <h1>Token Exchange App</h1>
      <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL}</p>
      <p>Has Anon Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'YES' : 'NO'}</p>
      <p><strong>{connectionStatus}</strong></p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
