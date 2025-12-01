import React, { useState } from 'react'
import { login } from '../api'
import './Login.css'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await login(username, password)
      onLogin(response.user, response.token)
    } catch (err) {
      setError(err.response?.data?.error || 'Anmeldung fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🔄 Rotary Portal</h1>
          <p>Rotary Club St.Gallen</p>
          <p className="subtitle">Präsidialjahr 2026-2027</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Benutzername</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="praesident oder programm"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Passwort</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="admin123"
            />
          </div>
          
          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Anmelden...' : 'Anmelden'}
          </button>
        </form>
        
        <div className="login-info">
          <p><strong>Standard-Zugangsdaten:</strong></p>
          <p>Benutzername: <code>praesident</code> oder <code>programm</code></p>
          <p>Passwort: <code>admin123</code></p>
        </div>
      </div>
    </div>
  )
}

export default Login

