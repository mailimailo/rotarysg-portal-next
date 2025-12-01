import React, { useState, useEffect } from 'react'
import { getInvitations, createInvitation, updateInvitation, getLunches, getSpeakers } from '../api'
import './Invitations.css'

function Invitations() {
  const [invitations, setInvitations] = useState([])
  const [lunches, setLunches] = useState([])
  const [speakers, setSpeakers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    lunch_id: '',
    speaker_id: '',
    email: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [invitationsRes, lunchesRes, speakersRes] = await Promise.all([
        getInvitations(),
        getLunches(),
        getSpeakers()
      ])
      setInvitations(invitationsRes.data)
      setLunches(lunchesRes.data)
      setSpeakers(speakersRes.data)
    } catch (error) {
      console.error('Fehler beim Laden:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createInvitation(formData)
      setShowModal(false)
      setFormData({ lunch_id: '', speaker_id: '', email: '' })
      loadData()
    } catch (error) {
      console.error('Fehler beim Erstellen:', error)
      alert('Fehler beim Erstellen der Einladung')
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateInvitation(id, { status })
      loadData()
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error)
      alert('Fehler beim Aktualisieren der Einladung')
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'accepted':
        return 'badge-success'
      case 'declined':
        return 'badge-danger'
      case 'pending':
        return 'badge-warning'
      default:
        return 'badge-info'
    }
  }

  if (loading) {
    return <div className="loading">Lade Einladungen...</div>
  }

  return (
    <div className="invitations">
      <div className="page-header">
        <h1>Einladungen verwalten</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Neue Einladung
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Lunch</th>
              <th>Datum</th>
              <th>Speaker</th>
              <th>E-Mail</th>
              <th>Status</th>
              <th>Gesendet am</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {invitations.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  Noch keine Einladungen erstellt
                </td>
              </tr>
            ) : (
              invitations.map(invitation => (
                <tr key={invitation.id}>
                  <td><strong>{invitation.lunch_title || `Lunch #${invitation.lunch_id}`}</strong></td>
                  <td>
                    {invitation.lunch_date ? new Date(invitation.lunch_date).toLocaleDateString('de-CH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : '-'}
                  </td>
                  <td>{invitation.speaker_name || '-'}</td>
                  <td>{invitation.email}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(invitation.status)}`}>
                      {invitation.status}
                    </span>
                  </td>
                  <td>
                    {invitation.sent_at ? new Date(invitation.sent_at).toLocaleDateString('de-CH') : '-'}
                  </td>
                  <td>
                    {invitation.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-success"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                          onClick={() => handleStatusUpdate(invitation.id, 'accepted')}
                        >
                          Akzeptiert
                        </button>
                        <button 
                          className="btn btn-danger"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                          onClick={() => handleStatusUpdate(invitation.id, 'declined')}
                        >
                          Abgelehnt
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setFormData({ lunch_id: '', speaker_id: '', email: '' }); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Neue Einladung</h2>
              <button className="close-btn" onClick={() => { setShowModal(false); setFormData({ lunch_id: '', speaker_id: '', email: '' }); }}>
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Lunch *</label>
                <select
                  value={formData.lunch_id}
                  onChange={(e) => setFormData({ ...formData, lunch_id: e.target.value })}
                  required
                >
                  <option value="">Bitte wählen...</option>
                  {lunches.map(lunch => (
                    <option key={lunch.id} value={lunch.id}>
                      {new Date(lunch.date).toLocaleDateString('de-CH')} - {lunch.title || 'Lunch'}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Speaker</label>
                <select
                  value={formData.speaker_id}
                  onChange={(e) => {
                    const speaker = speakers.find(s => s.id === parseInt(e.target.value))
                    setFormData({ 
                      ...formData, 
                      speaker_id: e.target.value,
                      email: speaker?.email || formData.email
                    })
                  }}
                >
                  <option value="">Kein Speaker</option>
                  {speakers.map(speaker => (
                    <option key={speaker.id} value={speaker.id}>
                      {speaker.name} {speaker.email ? `(${speaker.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>E-Mail *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="einladung@example.com"
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => { setShowModal(false); setFormData({ lunch_id: '', speaker_id: '', email: '' }); }}
                >
                  Abbrechen
                </button>
                <button type="submit" className="btn btn-primary">
                  Einladung erstellen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Invitations

