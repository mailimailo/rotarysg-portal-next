import React, { useState, useEffect } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/de'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { getCalendarEvents, getLunch } from '../api'
import './Calendar.css'

moment.locale('de')
const localizer = momentLocalizer(moment)

function CalendarView() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const response = await getCalendarEvents()
      const lunches = response.data
      
      const calendarEvents = lunches.map(lunch => ({
        id: lunch.id,
        title: lunch.title || `Lunch ${lunch.speaker_name ? `- ${lunch.speaker_name}` : ''}`,
        start: new Date(lunch.date),
        end: new Date(new Date(lunch.date).getTime() + 2 * 60 * 60 * 1000), // 2 Stunden
        resource: lunch
      }))
      
      setEvents(calendarEvents)
    } catch (error) {
      console.error('Fehler beim Laden:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectEvent = async (event) => {
    try {
      const response = await getLunch(event.id)
      setSelectedEvent(response.data)
      setShowModal(true)
    } catch (error) {
      console.error('Fehler beim Laden des Lunches:', error)
    }
  }

  const eventStyleGetter = (event) => {
    const status = event.resource?.status
    let backgroundColor = '#667eea'
    
    switch (status) {
      case 'confirmed':
        backgroundColor = '#28a745'
        break
      case 'cancelled':
        backgroundColor = '#dc3545'
        break
      case 'completed':
        backgroundColor = '#6c757d'
        break
      default:
        backgroundColor = '#ffc107'
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }

  if (loading) {
    return <div className="loading">Lade Kalender...</div>
  }

  return (
    <div className="calendar-view">
      <h1 style={{ color: 'white', marginBottom: '2rem' }}>Kalender</h1>
      
      <div className="card calendar-card">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
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
            event: 'Ereignis',
            noEventsInRange: 'Keine Lunches in diesem Zeitraum'
          }}
          culture="de"
        />
      </div>

      <div className="legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#ffc107' }}></span>
          <span>Geplant</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#28a745' }}></span>
          <span>Bestätigt</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#dc3545' }}></span>
          <span>Abgesagt</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#6c757d' }}></span>
          <span>Abgeschlossen</span>
        </div>
      </div>

      {showModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setSelectedEvent(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Lunch Details</h2>
              <button className="close-btn" onClick={() => { setShowModal(false); setSelectedEvent(null); }}>
                ×
              </button>
            </div>
            
            <div className="event-details">
              <div className="detail-row">
                <strong>Datum & Zeit:</strong>
                <span>{new Date(selectedEvent.date).toLocaleString('de-CH', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              
              {selectedEvent.title && (
                <div className="detail-row">
                  <strong>Titel:</strong>
                  <span>{selectedEvent.title}</span>
                </div>
              )}
              
              {selectedEvent.location && (
                <div className="detail-row">
                  <strong>Ort:</strong>
                  <span>{selectedEvent.location}</span>
                </div>
              )}
              
              {selectedEvent.speaker_name && (
                <div className="detail-row">
                  <strong>Speaker:</strong>
                  <span>{selectedEvent.speaker_name}</span>
                </div>
              )}
              
              {selectedEvent.speaker_email && (
                <div className="detail-row">
                  <strong>Speaker E-Mail:</strong>
                  <span>{selectedEvent.speaker_email}</span>
                </div>
              )}
              
              <div className="detail-row">
                <strong>Status:</strong>
                <span className={`badge status-${selectedEvent.status}`}>
                  {selectedEvent.status}
                </span>
              </div>
              
              {selectedEvent.description && (
                <div className="detail-row">
                  <strong>Beschreibung:</strong>
                  <span>{selectedEvent.description}</span>
                </div>
              )}
              
              {selectedEvent.max_attendees && (
                <div className="detail-row">
                  <strong>Max. Teilnehmer:</strong>
                  <span>{selectedEvent.max_attendees}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarView

