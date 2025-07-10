import React from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  return (
    <div style={{padding: '20px', fontFamily: 'Arial'}}>
      <h1>Hello World Test!</h1>
      <p>Environment Variables:</p>
      <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL || 'NOT FOUND'}</p>
      <p>Has Anon Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'YES' : 'NO'}</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
