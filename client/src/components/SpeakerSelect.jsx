import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPublicSpeakerRequest, selectLunchForRequest, declineSpeakerRequest } from '../api'
import './SpeakerSelect.css'

function SpeakerSelect() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedLunch, setSelectedLunch] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadRequest()
  }, [token])

  const loadRequest = async () => {
    try {
      const response = await getPublicSpeakerRequest(token)
      setRequest(response.data)
      if (response.data.status !== 'pending') {
        setSubmitted(true)
        if (response.data.selected_lunch_id) {
          const selected = response.data.available_lunches.find(
            l => l.id === response.data.selected_lunch_id
          )
          setSelectedLunch(selected)
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Anfrage nicht gefunden oder abgelaufen')
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = async (lunchId) => {
    if (submitting) return
    
    setSubmitting(true)
    try {
      await selectLunchForRequest(token, lunchId)
      const selected = request.available_lunches.find(l => l.id === lunchId)
      setSelectedLunch(selected)
      setSubmitted(true)
    } catch (err) {
      alert(err.response?.data?.error || 'Fehler beim Auswählen des Termins')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDecline = async () => {
    if (!window.confirm('Möchten Sie wirklich alle Termine ablehnen?')) return
    
    setSubmitting(true)
    try {
      await declineSpeakerRequest(token)
      setSubmitted(true)
    } catch (err) {
      alert(err.response?.data?.error || 'Fehler beim Ablehnen')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="speaker-select-container">
        <div className="speaker-select-card">
          <div className="loading">Lade Anfrage...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="speaker-select-container">
        <div className="speaker-select-card error">
          <h1>❌ Fehler</h1>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="speaker-select-container">
      <div className="speaker-select-card">
        <div className="select-header">
          <h1>🔄 Rotary Club St.Gallen</h1>
          <h2>Terminauswahl</h2>
        </div>

        <div className="speaker-info">
          <p><strong>Guten Tag {request.speaker_name}</strong></p>
          {request.message && (
            <div className="message-box">
              <p>{request.message}</p>
            </div>
          )}
        </div>

        {submitted ? (
          <div className="submitted-state">
            {selectedLunch ? (
              <>
                <div className="success-icon">✅</div>
                <h3>Vielen Dank für Ihre Zusage!</h3>
                <p>Sie haben folgenden Termin ausgewählt:</p>
                <div className="selected-lunch-card">
                  <strong>
                    {new Date(selectedLunch.date).toLocaleDateString('de-CH', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </strong>
                  <p>{selectedLunch.location || 'Netts Schützengarten'}</p>
                  {selectedLunch.title && <p>{selectedLunch.title}</p>}
                </div>
                <p className="info-text">
                  Wir freuen uns auf Ihren Vortrag! Weitere Details erhalten Sie per E-Mail.
                </p>
              </>
            ) : (
              <>
                <div className="declined-icon">❌</div>
                <h3>Anfrage abgelehnt</h3>
                <p>Sie haben alle angebotenen Termine abgelehnt.</p>
                <p className="info-text">
                  Vielen Dank für Ihre Rückmeldung. Bei Fragen stehen wir Ihnen gerne zur Verfügung.
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="select-instructions">
              <p>Bitte wählen Sie einen der folgenden Termine aus, der für Sie passt:</p>
            </div>

            <div className="lunches-grid">
              {request.available_lunches.map(lunch => (
                <div 
                  key={lunch.id} 
                  className={`lunch-option ${submitting ? 'disabled' : ''}`}
                  onClick={() => !submitting && handleSelect(lunch.id)}
                >
                  <div className="lunch-date">
                    {new Date(lunch.date).toLocaleDateString('de-CH', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="lunch-time">
                    {new Date(lunch.date).toLocaleTimeString('de-CH', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })} Uhr
                  </div>
                  <div className="lunch-location">
                    📍 {lunch.location || 'Netts Schützengarten'}
                  </div>
                  {lunch.title && (
                    <div className="lunch-title">{lunch.title}</div>
                  )}
                  <div className="select-button">
                    {submitting ? 'Wird verarbeitet...' : '✓ Diesen Termin wählen'}
                  </div>
                </div>
              ))}
            </div>

            <div className="decline-section">
              <p>Keiner der Termine passt für Sie?</p>
              <button 
                className="btn btn-danger"
                onClick={handleDecline}
                disabled={submitting}
              >
                Alle Termine ablehnen
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SpeakerSelect

