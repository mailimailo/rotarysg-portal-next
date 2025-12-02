import React, { useState, useEffect } from 'react'
import { getSpeakers, getLunches, createSpeakerRequest, getSpeakerRequests, updateSpeakerRequest, generateCalendlyLinks } from '../api'
import './SpeakerRequest.css'

function SpeakerRequest() {
  const [speakers, setSpeakers] = useState([])
  const [lunches, setLunches] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [createdRequest, setCreatedRequest] = useState(null)
  const [showCompleted, setShowCompleted] = useState(false)
  const [showCalendlyModal, setShowCalendlyModal] = useState(false)
  const [calendlyData, setCalendlyData] = useState(null)
  const [formData, setFormData] = useState({
    speaker_id: '',
    lunch_ids: [],
    message: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (showStatusModal) {
      // Show/hide lunch select based on status selection
      const statusSelect = document.getElementById('status-select')
      const lunchSelectGroup = document.getElementById('lunch-select-group')
      
      if (statusSelect && lunchSelectGroup) {
        const handleChange = () => {
          if (statusSelect.value === 'accepted') {
            lunchSelectGroup.style.display = 'block'
          } else {
            lunchSelectGroup.style.display = 'none'
          }
        }
        
        statusSelect.addEventListener('change', handleChange)
        
        return () => {
          statusSelect.removeEventListener('change', handleChange)
        }
      }
    }
  }, [showStatusModal])

  const loadData = async () => {
    try {
      const [speakersRes, lunchesRes, requestsRes] = await Promise.all([
        getSpeakers(),
        getLunches(),
        getSpeakerRequests()
      ])
      setSpeakers(speakersRes.data)
      setLunches(lunchesRes.data.filter(l => !l.speaker_id || l.status === 'planned' || l.status === 'angefragt'))
      setRequests(requestsRes.data)
    } catch (error) {
      console.error('Fehler beim Laden:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.speaker_id || formData.lunch_ids.length === 0) {
      alert('Bitte wählen Sie einen Speaker und mindestens einen Termin aus')
      return
    }

    try {
      const response = await createSpeakerRequest(formData)
      const selectedSpeaker = speakers.find(s => s.id === parseInt(formData.speaker_id))
      setCreatedRequest({
        ...response.data,
        speaker_name: selectedSpeaker?.name,
        speaker_email: selectedSpeaker?.email
      })
      setShowModal(false)
      setShowLinkModal(true)
      setFormData({ speaker_id: '', lunch_ids: [], message: '' })
      loadData()
    } catch (error) {
      console.error('Fehler beim Erstellen:', error)
      alert('Fehler beim Erstellen der Anfrage')
    }
  }

  const toggleLunch = (lunchId) => {
    setFormData(prev => ({
      ...prev,
      lunch_ids: prev.lunch_ids.includes(lunchId)
        ? prev.lunch_ids.filter(id => id !== lunchId)
        : [...prev.lunch_ids, lunchId]
    }))
  }

  const copyLink = (url) => {
    navigator.clipboard.writeText(url)
    alert('Link in Zwischenablage kopiert!')
  }

  const generateEmailTemplate = (request) => {
    const lunchDates = (request.available_lunches || []).map(lunch => 
      new Date(lunch.date).toLocaleDateString('de-CH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    ).join('\n- ')

    const subject = `Rotary Club St.Gallen - Anfrage für Vortrag`
    const body = `Guten Tag ${request.speaker_name || 'Sehr geehrte Damen und Herren'},

${request.message || 'Wir würden Sie gerne als Speaker für einen unserer Rotary Lunches einladen.'}

Bitte wählen Sie einen der folgenden Termine aus:
- ${lunchDates}

Sie können Ihren Wunschtermin hier auswählen:
${window.location.origin}/speaker-select/${request.token}

Ort: Netts Schützengarten, St.Gallen
Zeit: 12:00 - 13:15 Uhr

Wir freuen uns auf Ihre Rückmeldung!

Mit freundlichen Grüssen
Rotary Club St.Gallen`

    return { subject, body }
  }

  const copyEmailTemplate = (request) => {
    const { subject, body } = generateEmailTemplate(request)
    const emailText = `Betreff: ${subject}\n\n${body}`
    navigator.clipboard.writeText(emailText)
    alert('E-Mail-Vorlage in Zwischenablage kopiert! Sie können sie jetzt in Ihr E-Mail-Programm einfügen.')
  }

  const openEmailClient = (request) => {
    const { subject, body } = generateEmailTemplate(request)
    const mailtoLink = `mailto:${request.speaker_email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailtoLink
  }

  if (loading) {
    return <div className="loading">Lade Daten...</div>
  }

  return (
    <div className="speaker-request">
      <div className="page-header">
        <h1>Speaker anfragen</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Neue Anfrage
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Anfragen</h2>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
            />
            <span>Abgeschlossene anzeigen</span>
          </label>
        </div>
        {requests.length === 0 ? (
          <p>Noch keine Anfragen erstellt</p>
        ) : (
          <div className="requests-list">
            {requests
              .filter(request => showCompleted || request.status === 'pending')
              .map(request => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <div>
                    <h3>{request.speaker_name}</h3>
                    <p className="request-email">{request.speaker_email}</p>
                  </div>
                  <span className={`badge status-${request.status}`}>
                    {request.status === 'pending' ? 'Ausstehend' : 
                     request.status === 'accepted' ? 'Akzeptiert' : 
                     request.status === 'declined' ? 'Abgelehnt' : request.status}
                  </span>
                </div>
                
                {request.status === 'pending' && (
                  <div className="request-link">
                    <strong>Auswahl-Link (Eigene Lösung):</strong>
                    <div className="link-container">
                      <code>{`${window.location.origin}/speaker-select/${request.token}`}</code>
                      <button 
                        className="btn btn-secondary btn-small"
                        onClick={() => copyLink(`${window.location.origin}/speaker-select/${request.token}`)}
                      >
                        Link kopieren
                      </button>
                    </div>
                    
                    <div className="external-tools-section">
                      <strong>Externe Tools (Calendly/Doodle/Google):</strong>
                      <div className="tools-buttons">
                        <button 
                          className="btn btn-primary btn-small"
                          onClick={async () => {
                            try {
                              const response = await generateCalendlyLinks(request.id)
                              setShowCalendlyModal(true)
                              setCalendlyData(response.data)
                            } catch (error) {
                              console.error('Fehler:', error)
                              alert('Fehler beim Generieren der Links')
                            }
                          }}
                        >
                          📅 Calendly/Doodle/Google Links
                        </button>
                      </div>
                    </div>
                    
                    {request.speaker_email && (
                      <div className="email-actions-inline">
                        <button 
                          className="btn btn-secondary btn-small"
                          onClick={() => copyEmailTemplate(request)}
                        >
                          📋 E-Mail-Vorlage
                        </button>
                        <button 
                          className="btn btn-primary btn-small"
                          onClick={() => openEmailClient(request)}
                        >
                          ✉️ E-Mail öffnen
                        </button>
                      </div>
                    )}
                    <p className="link-hint">Link kann per E-Mail, WhatsApp oder persönlich weitergegeben werden</p>
                  </div>
                )}

                {request.status === 'pending' && (
                  <div className="request-actions">
                    <button 
                      className="btn btn-success btn-small"
                      onClick={() => {
                        setSelectedRequest(request)
                        setShowStatusModal(true)
                      }}
                    >
                      Status ändern
                    </button>
                  </div>
                )}

                {request.available_lunches && request.available_lunches.length > 0 && (
                  <div className="request-lunches">
                    <strong>Angebotene Termine:</strong>
                    <ul>
                      {request.available_lunches.map(lunch => (
                        <li key={lunch.id}>
                          {new Date(lunch.date).toLocaleDateString('de-CH', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })} - {lunch.location || 'Netts Schützengarten'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {request.status === 'accepted' && request.selected_lunch_date && (
                  <div className="request-selected">
                    <strong>✅ Ausgewählter Termin:</strong>
                    <p>
                      {new Date(request.selected_lunch_date).toLocaleDateString('de-CH', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} - {request.selected_lunch_title || 'Lunch'}
                    </p>
                  </div>
                )}

                {request.message && (
                  <div className="request-message">
                    <strong>Nachricht:</strong>
                    <p>{request.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setFormData({ speaker_id: '', lunch_ids: [], message: '' }); }}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Speaker anfragen</h2>
              <button className="close-btn" onClick={() => { setShowModal(false); setFormData({ speaker_id: '', lunch_ids: [], message: '' }); }}>
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Speaker *</label>
                <select
                  value={formData.speaker_id}
                  onChange={(e) => setFormData({ ...formData, speaker_id: e.target.value })}
                  required
                >
                  <option value="">Bitte wählen...</option>
                  {speakers.map(speaker => (
                    <option key={speaker.id} value={speaker.id}>
                      {speaker.name} {speaker.email ? `(${speaker.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Termine auswählen * (mehrere möglich)</label>
                <div className="lunches-selection">
                  {lunches
                    .filter(l => !l.speaker_id || l.status === 'planned' || l.status === 'angefragt')
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(lunch => (
                      <label key={lunch.id} className="lunch-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.lunch_ids.includes(lunch.id)}
                          onChange={() => toggleLunch(lunch.id)}
                        />
                        <div className="lunch-info">
                          <strong>
                            {new Date(lunch.date).toLocaleDateString('de-CH', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </strong>
                          <span>{lunch.location || 'Netts Schützengarten'}</span>
                          {lunch.speaker_name && (
                            <span className="warning">⚠️ Bereits zugewiesen: {lunch.speaker_name}</span>
                          )}
                        </div>
                      </label>
                    ))}
                </div>
                {formData.lunch_ids.length === 0 && (
                  <p className="hint">Bitte wählen Sie mindestens einen Termin aus</p>
                )}
                {formData.lunch_ids.length > 0 && (
                  <p className="hint">✓ {formData.lunch_ids.length} Termin(e) ausgewählt</p>
                )}
              </div>

              <div className="form-group">
                <label>Nachricht an Speaker (optional)</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Persönliche Nachricht für den Speaker..."
                  rows="4"
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => { setShowModal(false); setFormData({ speaker_id: '', lunch_ids: [], message: '' }); }}
                >
                  Abbrechen
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={!formData.speaker_id || formData.lunch_ids.length === 0}
                >
                  Anfrage erstellen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link-Modal nach Erstellung */}
      {showLinkModal && createdRequest && (
        <div className="modal-overlay" onClick={() => { setShowLinkModal(false); setCreatedRequest(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✅ Anfrage erstellt!</h2>
              <button className="close-btn" onClick={() => { setShowLinkModal(false); setCreatedRequest(null); }}>
                ×
              </button>
            </div>
            
            <div className="link-modal-content">
              <p><strong>Speaker:</strong> {createdRequest.speaker_name}</p>
              {createdRequest.speaker_email && (
                <p><strong>E-Mail:</strong> {createdRequest.speaker_email}</p>
              )}
              
              <div className="link-section">
                <h3>Auswahl-Link für Speaker:</h3>
                <div className="link-container">
                  <code>{`${window.location.origin}/speaker-select/${createdRequest.token}`}</code>
                  <button 
                    className="btn btn-primary btn-small"
                    onClick={() => copyLink(`${window.location.origin}/speaker-select/${createdRequest.token}`)}
                  >
                    Link kopieren
                  </button>
                </div>
                <p className="hint">Dieser Link kann per E-Mail, WhatsApp oder persönlich weitergegeben werden.</p>
              </div>

              {createdRequest.speaker_email && (
                <div className="email-actions">
                  <h3>E-Mail-Versand:</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => copyEmailTemplate(createdRequest)}
                    >
                      📋 E-Mail-Vorlage kopieren
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={() => openEmailClient(createdRequest)}
                    >
                      ✉️ In E-Mail-Programm öffnen
                    </button>
                  </div>
                  <p className="hint">Die Vorlage enthält den Link und alle Termine. Sie können sie anpassen und manuell versenden.</p>
                </div>
              )}

              <div className="info-box">
                <strong>💡 Tipp:</strong> Sie können den Link auch über WhatsApp, persönlich oder andere Kanäle weitergeben. Der Speaker kann dann direkt online einen Termin auswählen.
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button 
                className="btn btn-primary"
                onClick={() => { setShowLinkModal(false); setCreatedRequest(null); }}
              >
                Fertig
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status-Änderungs-Modal */}
      {showStatusModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => { setShowStatusModal(false); setSelectedRequest(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Status ändern</h2>
              <button className="close-btn" onClick={() => { setShowStatusModal(false); setSelectedRequest(null); }}>
                ×
              </button>
            </div>
            
            <div className="status-modal-content">
              <p><strong>Speaker:</strong> {selectedRequest.speaker_name}</p>
              
              <div className="form-group">
                <label>Neuer Status *</label>
                <select
                  id="status-select"
                  defaultValue=""
                >
                  <option value="">Bitte wählen...</option>
                  <option value="accepted">Zusage</option>
                  <option value="declined">Absage</option>
                </select>
              </div>

              {selectedRequest.available_lunches && selectedRequest.available_lunches.length > 0 && (
                <div className="form-group" id="lunch-select-group" style={{ display: 'none' }}>
                  <label>Termin auswählen (bei Zusage)</label>
                  <select id="lunch-select">
                    <option value="">Bitte wählen...</option>
                    {selectedRequest.available_lunches.map(lunch => (
                      <option key={lunch.id} value={lunch.id}>
                        {new Date(lunch.date).toLocaleDateString('de-CH', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })} - {lunch.location || 'Netts Schützengarten'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => { setShowStatusModal(false); setSelectedRequest(null); }}
                >
                  Abbrechen
                </button>
                <button 
                  type="button"
                  className="btn btn-primary"
                  onClick={async () => {
                    const statusSelect = document.getElementById('status-select')
                    const lunchSelect = document.getElementById('lunch-select')
                    const status = statusSelect.value
                    
                    if (!status) {
                      alert('Bitte wählen Sie einen Status aus')
                      return
                    }

                    if (status === 'accepted' && (!lunchSelect || !lunchSelect.value)) {
                      alert('Bitte wählen Sie einen Termin aus')
                      return
                    }

                    try {
                      const updateData = {
                        status,
                        selected_lunch_id: status === 'accepted' ? parseInt(lunchSelect.value) : null
                      }
                      
                      await updateSpeakerRequest(selectedRequest.id, updateData)
                      setShowStatusModal(false)
                      setSelectedRequest(null)
                      loadData()
                    } catch (error) {
                      console.error('Fehler beim Aktualisieren:', error)
                      const errorMessage = error.response?.data?.error || error.message || 'Unbekannter Fehler'
                      alert(`Fehler beim Aktualisieren des Status: ${errorMessage}`)
                    }
                  }}
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendly/Doodle/Google Links Modal */}
      {showCalendlyModal && calendlyData && (
        <div className="modal-overlay" onClick={() => { setShowCalendlyModal(false); setCalendlyData(null); }}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Externe Terminauswahl-Tools</h2>
              <button className="close-btn" onClick={() => { setShowCalendlyModal(false); setCalendlyData(null); }}>
                ×
              </button>
            </div>
            
            <div className="external-tools-content">
              <p>Wählen Sie ein Tool für die Terminauswahl:</p>
              
              <div className="tool-option">
                <h3>📅 Calendly</h3>
                <p>Professionelle Terminbuchung (erfordert Calendly Account)</p>
                <div className="link-container">
                  <code>{calendlyData.calendly_link}</code>
                  <button 
                    className="btn btn-secondary btn-small"
                    onClick={() => copyLink(calendlyData.calendly_link)}
                  >
                    Kopieren
                  </button>
                </div>
                <p className="tool-instruction">{calendlyData.instructions.calendly}</p>
              </div>

              <div className="tool-option">
                <h3>🗓️ Google Calendar</h3>
                <p>Google Calendar "Find a time" Link</p>
                <div className="link-container">
                  <code>{calendlyData.alternative_links.google_calendar}</code>
                  <button 
                    className="btn btn-secondary btn-small"
                    onClick={() => copyLink(calendlyData.alternative_links.google_calendar)}
                  >
                    Kopieren
                  </button>
                </div>
                <p className="tool-instruction">{calendlyData.instructions.google}</p>
              </div>

              <div className="tool-option">
                <h3>📊 Doodle</h3>
                <p>Doodle Umfrage erstellen (erfordert Doodle Account)</p>
                <div className="link-container">
                  <code>{calendlyData.alternative_links.doodle}</code>
                  <button 
                    className="btn btn-secondary btn-small"
                    onClick={() => copyLink(calendlyData.alternative_links.doodle)}
                  >
                    Kopieren
                  </button>
                </div>
                <p className="tool-instruction">{calendlyData.instructions.doodle}</p>
              </div>

              <div className="info-box">
                <strong>💡 Hinweis:</strong> Nach der Terminauswahl in einem externen Tool müssen Sie den Termin manuell im System bestätigen (Status auf "Zusage" setzen).
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button 
                className="btn btn-primary"
                onClick={() => { setShowCalendlyModal(false); setCalendlyData(null); }}
              >
                Fertig
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SpeakerRequest

