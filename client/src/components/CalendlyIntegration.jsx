import React, { useState, useEffect } from 'react'
import { generateCalendlyLinks } from '../api'
import axios from 'axios'
import './CalendlyIntegration.css'

function CalendlyIntegration({ requestId, onClose }) {
  const [eventTypes, setEventTypes] = useState([])
  const [selectedEventType, setSelectedEventType] = useState('')
  const [loading, setLoading] = useState(false)
  const [schedulingLink, setSchedulingLink] = useState(null)
  const [error, setError] = useState('')
  const [apiToken, setApiToken] = useState('')

  useEffect(() => {
    loadEventTypes()
  }, [])

  const loadEventTypes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/calendly/event-types', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEventTypes(response.data.collection || [])
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Calendly API Token nicht konfiguriert. Bitte setzen Sie CALENDLY_API_TOKEN in den Server-Environment-Variablen.')
      } else {
        setError('Fehler beim Laden der Event Types: ' + (err.response?.data?.error || err.message))
      }
    }
  }

  const createSchedulingLink = async () => {
    if (!selectedEventType) {
      setError('Bitte wählen Sie einen Event Type aus')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `/api/speaker-requests/${requestId}/create-calendly`,
        { event_type_uri: selectedEventType },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setSchedulingLink(response.data.scheduling_link)
    } catch (err) {
      setError('Fehler beim Erstellen des Links: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="calendly-integration">
      <h3>Calendly Integration</h3>

      {error && (
        <div className="error-message">
          {error}
          {error.includes('API Token') && (
            <div className="setup-instructions">
              <p><strong>Setup-Anleitung:</strong></p>
              <ol>
                <li>Gehen Sie zu: <a href="https://calendly.com/integrations/api_webhooks" target="_blank" rel="noopener noreferrer">https://calendly.com/integrations/api_webhooks</a></li>
                <li>Erstellen Sie einen Personal Access Token</li>
                <li>Fügen Sie ihn als Environment Variable hinzu: <code>CALENDLY_API_TOKEN</code></li>
                <li>Für Webhooks: Setzen Sie auch <code>CALENDLY_WEBHOOK_SIGNING_KEY</code></li>
                <li>Konfigurieren Sie den Webhook auf Calendly: <code>{window.location.origin}/api/webhooks/calendly</code></li>
              </ol>
            </div>
          )}
        </div>
      )}

      {!schedulingLink ? (
        <>
          {eventTypes.length > 0 ? (
            <>
              <div className="form-group">
                <label>Calendly Event Type auswählen:</label>
                <select
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value)}
                  className="event-type-select"
                >
                  <option value="">Bitte wählen...</option>
                  {eventTypes.map(eventType => (
                    <option key={eventType.uri} value={eventType.uri}>
                      {eventType.name} ({eventType.duration} Min)
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="btn btn-primary"
                onClick={createSchedulingLink}
                disabled={loading || !selectedEventType}
              >
                {loading ? 'Erstelle Link...' : 'Calendly Link erstellen'}
              </button>
            </>
          ) : (
            <div className="info-box">
              <p>Keine Event Types gefunden. Bitte erstellen Sie zuerst einen Event Type in Calendly.</p>
            </div>
          )}
        </>
      ) : (
        <div className="success-box">
          <h4>✅ Calendly Link erstellt!</h4>
          <div className="link-container">
            <code>{schedulingLink}</code>
            <button
              className="btn btn-secondary btn-small"
              onClick={() => {
                navigator.clipboard.writeText(schedulingLink)
                alert('Link kopiert!')
              }}
            >
              Kopieren
            </button>
          </div>
          <p className="info-text">
            Dieser Link kann jetzt an den Speaker gesendet werden. Wenn der Speaker einen Termin bucht, 
            wird er automatisch im System übernommen (via Webhook).
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSchedulingLink(null)
              setSelectedEventType('')
            }}
          >
            Neuen Link erstellen
          </button>
        </div>
      )}
    </div>
  )
}

export default CalendlyIntegration

