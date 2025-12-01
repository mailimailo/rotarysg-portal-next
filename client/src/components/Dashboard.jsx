import React, { useState, useEffect } from 'react'
import { getLunches, getSpeakers, getInvitations } from '../api'
import './Dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState({
    totalLunches: 0,
    plannedLunches: 0,
    confirmedLunches: 0,
    totalSpeakers: 0,
    pendingInvitations: 0
  })
  const [recentLunches, setRecentLunches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [lunchesRes, speakersRes, invitationsRes] = await Promise.all([
        getLunches(),
        getSpeakers(),
        getInvitations()
      ])

      const lunches = lunchesRes.data
      const speakers = speakersRes.data
      const invitations = invitationsRes.data

      const planned = lunches.filter(l => l.status === 'planned').length
      const confirmed = lunches.filter(l => l.status === 'confirmed').length
      const pending = invitations.filter(i => i.status === 'pending').length

      setStats({
        totalLunches: lunches.length,
        plannedLunches: planned,
        confirmedLunches: confirmed,
        totalSpeakers: speakers.length,
        pendingInvitations: pending
      })

      // Nächste 5 Lunches
      const upcoming = lunches
        .filter(l => new Date(l.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5)

      setRecentLunches(upcoming)
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Lade Dashboard...</div>
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🍽️</div>
          <div className="stat-content">
            <h3>{stats.totalLunches}</h3>
            <p>Gesamt Lunches</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.plannedLunches}</h3>
            <p>Geplant</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.confirmedLunches}</h3>
            <p>Bestätigt</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🎤</div>
          <div className="stat-content">
            <h3>{stats.totalSpeakers}</h3>
            <p>Speaker</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✉️</div>
          <div className="stat-content">
            <h3>{stats.pendingInvitations}</h3>
            <p>Offene Einladungen</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Nächste Lunches</h2>
        {recentLunches.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Titel</th>
                <th>Ort</th>
                <th>Speaker</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLunches.map(lunch => (
                <tr key={lunch.id}>
                  <td>{new Date(lunch.date).toLocaleDateString('de-CH', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</td>
                  <td>{lunch.title || 'Ohne Titel'}</td>
                  <td>{lunch.location || '-'}</td>
                  <td>{lunch.speaker_name || '-'}</td>
                  <td>
                    <span className={`badge status-${lunch.status}`}>
                      {lunch.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Keine bevorstehenden Lunches</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard

