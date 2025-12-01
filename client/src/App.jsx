import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Lunches from './components/Lunches'
import Speakers from './components/Speakers'
import Calendar from './components/Calendar'
import Invitations from './components/Invitations'
import SpeakerRequest from './components/SpeakerRequest'
import SpeakerSelect from './components/SpeakerSelect'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (loading) {
    return <div className="loading">Lade...</div>
  }

  return (
    <Router>
      <Routes>
        {/* Öffentliche Route für Speaker-Auswahl */}
        <Route path="/speaker-select/:token" element={<SpeakerSelect />} />
        
        {/* Login Route */}
        {!user && <Route path="/login" element={<Login onLogin={handleLogin} />} />}
        
        {/* Geschützte Routes */}
        <Route path="/" element={
          <ProtectedRoute user={user} onLogout={handleLogout}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/lunches" element={
          <ProtectedRoute user={user} onLogout={handleLogout}>
            <Lunches />
          </ProtectedRoute>
        } />
        <Route path="/speakers" element={
          <ProtectedRoute user={user} onLogout={handleLogout}>
            <Speakers />
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute user={user} onLogout={handleLogout}>
            <Calendar />
          </ProtectedRoute>
        } />
        <Route path="/speaker-requests" element={
          <ProtectedRoute user={user} onLogout={handleLogout}>
            <SpeakerRequest />
          </ProtectedRoute>
        } />
        
        {/* Fallback */}
        <Route path="*" element={user ? <Navigate to="/" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

export default App
