import React, { useState, useEffect } from 'react'
import { getSpeakers, createSpeaker, updateSpeaker, deleteSpeaker } from '../api'
import './Speakers.css'

function Speakers() {
  const [speakers, setSpeakers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSpeaker, setEditingSpeaker] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    topic: '',
    bio: '',
    status: 'pending'
  })

  useEffect(() => {
    loadSpeakers()
  }, [])

  const loadSpeakers = async () => {
    try {
      const response = await getSpeakers()
      setSpeakers(response.data)
    } catch (error) {
      console.error('Fehler beim Laden:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSpeaker) {
        await updateSpeaker(editingSpeaker.id, formData)
        // Wenn Status auf "confirmed" oder "declined" geändert wurde, wird die zugehörige Anfrage automatisch aktualisiert
      } else {
        await createSpeaker(formData)
      }
      
      setShowModal(false)
      resetForm()
      loadSpeakers()
    } catch (error) {
      console.error('Fehler beim Speichern:', error)
      alert('Fehler beim Speichern des Speakers')
    }
  }

  const handleEdit = (speaker) => {
    setEditingSpeaker(speaker)
    setFormData({
      name: speaker.name || '',
      email: speaker.email || '',
      phone: speaker.phone || '',
      company: speaker.company || '',
      topic: speaker.topic || '',
      bio: speaker.bio || '',
      status: speaker.status || 'pending'
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Möchten Sie diesen Speaker wirklich löschen?')) return
    
    try {
      await deleteSpeaker(id)
      loadSpeakers()
    } catch (error) {
      console.error('Fehler beim Löschen:', error)
      alert('Fehler beim Löschen')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      topic: '',
      bio: '',
      status: 'pending'
    })
    setEditingSpeaker(null)
  }

  if (loading) {
    return <div className="loading">Lade Speaker...</div>
  }

  return (
    <div className="speakers">
      <div className="page-header">
        <h1>Speaker verwalten</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          + Neuer Speaker
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>E-Mail</th>
              <th>Telefon</th>
              <th>Unternehmen</th>
              <th>Thema</th>
              <th>Status</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {speakers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  Noch keine Speaker erstellt
                </td>
              </tr>
            ) : (
              speakers.map(speaker => (
                <tr key={speaker.id}>
                  <td><strong>{speaker.name}</strong></td>
                  <td>{speaker.email || '-'}</td>
                  <td>{speaker.phone || '-'}</td>
                  <td>{speaker.company || '-'}</td>
                  <td>{speaker.topic || '-'}</td>
                  <td>
                    <span className={`badge status-${speaker.status}`}>
                      {speaker.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-secondary" 
                      style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                      onClick={() => handleEdit(speaker)}
                    >
                      Bearbeiten
                    </button>
                    <button 
                      className="btn btn-danger"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                      onClick={() => handleDelete(speaker.id)}
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSpeaker ? 'Speaker bearbeiten' : 'Neuer Speaker'}</h2>
              <button className="close-btn" onClick={() => { setShowModal(false); resetForm(); }}>
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Vollständiger Name"
                />
              </div>
              
              <div className="form-group">
                <label>E-Mail</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="speaker@example.com"
                />
              </div>
              
              <div className="form-group">
                <label>Telefon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+41 XX XXX XX XX"
                />
              </div>
              
              <div className="form-group">
                <label>Unternehmen</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Firmenname"
                />
              </div>
              
              <div className="form-group">
                <label>Thema / Vortrag</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="Vortragsthema"
                />
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="pending">Ausstehend</option>
                  <option value="angefragt">Angefragt</option>
                  <option value="confirmed">Bestätigt</option>
                  <option value="declined">Abgelehnt</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Biografie / Beschreibung</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Kurze Beschreibung des Speakers..."
                  rows="4"
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => { setShowModal(false); resetForm(); }}
                >
                  Abbrechen
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSpeaker ? 'Aktualisieren' : 'Erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Speakers

