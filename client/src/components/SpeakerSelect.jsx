import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/de'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { getPublicSpeakerRequest, selectLunchForRequest, declineSpeakerRequest } from '../api'
import './SpeakerSelect.css'

moment.locale('de')
const localizer = momentLocalizer(moment)

function SpeakerSelect() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedLunch, setSelectedLunch] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [view, setView] = useState('calendar') // 'calendar' oder 'list'
  const [selectedDate, setSelectedDate] = useState(null)

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

            {/* View Toggle */}
            <div className="view-toggle">
              <button 
                className={view === 'calendar' ? 'active' : ''}
                onClick={() => setView('calendar')}
              >
                📅 Kalender
              </button>
              <button 
                className={view === 'list' ? 'active' : ''}
                onClick={() => setView('list')}
              >
                📋 Liste
              </button>
            </div>

            {view === 'calendar' ? (
              <div className="calendly-calendar-view">
                <Calendar
                  localizer={localizer}
                  events={request.available_lunches.map(lunch => ({
                    id: lunch.id,
                    title: `${new Date(lunch.date).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })} Uhr`,
                    start: new Date(lunch.date),
                    end: new Date(new Date(lunch.date).getTime() + 75 * 60 * 1000), // 75 Minuten
                    resource: lunch
                  }))}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 500 }}
                  onSelectEvent={(event) => {
                    if (!submitting) {
                      setSelectedDate(event.start)
                      handleSelect(event.resource.id)
                    }
                  }}
                  eventPropGetter={(event) => ({
                    style: {
                      backgroundColor: '#667eea',
                      borderRadius: '6px',
                      opacity: 0.9,
                      color: 'white',
                      border: '0px',
                      cursor: submitting ? 'not-allowed' : 'pointer'
                    }
                  })}
                  messages={{
                    next: 'Nächster',
                    previous: 'Vorheriger',
                    today: 'Heute',
                    month: 'Monat',
                    week: 'Woche',
                    day: 'Tag',
                    agenda: 'Agenda',
                    date: 'Datum',
                    time: 'Zeit',
                    event: 'Termin',
                    noEventsInRange: 'Keine verfügbaren Termine'
                  }}
                  culture="de"
                  defaultView="month"
                  views={['month', 'week', 'day']}
                />
                
                <div className="calendar-legend">
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#667eea' }}></span>
                    <span>Verfügbare Termine - Klicken Sie auf einen Termin zum Auswählen</span>
                  </div>
                </div>
              </div>
            ) : (
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
            )}

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

