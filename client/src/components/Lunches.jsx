import React, { useState, useEffect } from 'react'
import { getLunches, createLunch, updateLunch, deleteLunch, getSpeakers } from '../api'
import './Lunches.css'

function Lunches() {
  const [lunches, setLunches] = useState([])
  const [speakers, setSpeakers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingLunch, setEditingLunch] = useState(null)
  const [formData, setFormData] = useState({
    date: '',
    location: '',
    title: '',
    description: '',
    speaker_id: '',
    max_attendees: '',
    status: 'planned'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [lunchesRes, speakersRes] = await Promise.all([
        getLunches(),
        getSpeakers()
      ])
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
      const data = {
        ...formData,
        speaker_id: formData.speaker_id || null,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null
      }

      if (editingLunch) {
        await updateLunch(editingLunch.id, data)
      } else {
        await createLunch(data)
      }
      
      setShowModal(false)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Fehler beim Speichern:', error)
      alert('Fehler beim Speichern des Lunches')
    }
  }

  const handleEdit = (lunch) => {
    setEditingLunch(lunch)
    setFormData({
      date: lunch.date ? new Date(lunch.date).toISOString().slice(0, 16) : '',
      location: lunch.location || '',
      title: lunch.title || '',
      description: lunch.description || '',
      speaker_id: lunch.speaker_id || '',
      max_attendees: lunch.max_attendees || '',
      status: lunch.status || 'planned'
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Möchten Sie diesen Lunch wirklich löschen?')) return
    
    try {
      await deleteLunch(id)
      loadData()
    } catch (error) {
      console.error('Fehler beim Löschen:', error)
      alert('Fehler beim Löschen')
    }
  }

  const resetForm = () => {
    setFormData({
      date: '',
      location: '',
      title: '',
      description: '',
      speaker_id: '',
      max_attendees: '',
      status: 'planned'
    })
    setEditingLunch(null)
  }

  if (loading) {
    return <div className="loading">Lade Lunches...</div>
  }

  return (
    <div className="lunches">
      <div className="page-header">
        <h1>Lunches verwalten</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          + Neuer Lunch
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Datum & Zeit</th>
              <th>Titel</th>
              <th>Ort</th>
              <th>Speaker</th>
              <th>Status</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {lunches.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  Noch keine Lunches erstellt
                </td>
              </tr>
            ) : (
              lunches.map(lunch => (
                <tr key={lunch.id}>
                  <td>
                    {new Date(lunch.date).toLocaleDateString('de-CH', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td>{lunch.title || '-'}</td>
                  <td>{lunch.location || '-'}</td>
                  <td>{lunch.speaker_name || '-'}</td>
                  <td>
                    <span className={`badge status-${lunch.status}`}>
                      {lunch.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-secondary" 
                      style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                      onClick={() => handleEdit(lunch)}
                    >
                      Bearbeiten
                    </button>
                    <button 
                      className="btn btn-danger"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                      onClick={() => handleDelete(lunch.id)}
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
              <h2>{editingLunch ? 'Lunch bearbeiten' : 'Neuer Lunch'}</h2>
              <button className="close-btn" onClick={() => { setShowModal(false); resetForm(); }}>
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Datum & Zeit *</label>
                <input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Titel</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="z.B. Rotary Lunch Januar"
                />
              </div>
              
              <div className="form-group">
                <label>Ort</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="z.B. Restaurant XYZ, St.Gallen"
                />
              </div>
              
              <div className="form-group">
                <label>Speaker</label>
                <select
                  value={formData.speaker_id}
                  onChange={(e) => setFormData({ ...formData, speaker_id: e.target.value })}
                >
                  <option value="">Kein Speaker</option>
                  {speakers.map(speaker => (
                    <option key={speaker.id} value={speaker.id}>
                      {speaker.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Max. Teilnehmer</label>
                <input
                  type="number"
                  value={formData.max_attendees}
                  onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                  min="1"
                />
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="planned">Geplant</option>
                  <option value="confirmed">Bestätigt</option>
                  <option value="completed">Abgeschlossen</option>
                  <option value="cancelled">Abgesagt</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Beschreibung</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Weitere Informationen zum Lunch..."
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
                  {editingLunch ? 'Aktualisieren' : 'Erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Lunches

