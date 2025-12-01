# Rotary Portal - St.Gallen

Ein digitales Management-Portal für das Rotary Club St.Gallen Präsidialjahr 2026-2027.

## Features

- 🍽️ **Lunch-Verwaltung**: Erstellen und verwalten Sie bis zu 50 Lunches
- 🎤 **Speaker-Management**: Verwalten Sie alle Speaker mit Kontaktdaten und Themen
- 📅 **Kalender-Ansicht**: Übersichtliche Kalenderansicht aller Lunches
- ✉️ **Speaker-Anfragen**: Laden Sie Speaker zu Lunches ein mit Doodle-ähnlicher Terminauswahl
- 👥 **Multi-User**: Zugriff für Präsident und Programmpräsidentin

## Lokale Installation

### Voraussetzungen

- Node.js (Version 16 oder höher)
- npm

### Setup

1. Alle Abhängigkeiten installieren:
```bash
npm run install-all
```

2. Server starten (in einem Terminal):
```bash
npm run server
```

3. Client starten (in einem anderen Terminal):
```bash
npm run client
```

Oder beides gleichzeitig:
```bash
npm run dev
```

## Zugangsdaten

Standard-Zugangsdaten (bitte nach dem ersten Login ändern):

- **Benutzername**: `praesident` oder `programm`
- **Passwort**: `admin123`

## Deployment

Siehe [DEPLOY.md](./DEPLOY.md) für detaillierte Anleitung zum Deployment auf Render.com, Railway oder anderen Plattformen.

## Technologie-Stack

- **Backend**: Node.js, Express, SQLite
- **Frontend**: React, React Router, React Big Calendar
- **Authentifizierung**: JWT

## Projektstruktur

```
rotary-portal/
├── server/          # Backend (Express API)
│   ├── index.js     # Hauptserver-Datei
│   └── rotary.db    # SQLite Datenbank (wird automatisch erstellt)
├── client/          # Frontend (React)
│   └── src/
│       ├── components/  # React Komponenten
│       ├── api.js       # API Client
│       └── App.jsx       # Hauptkomponente
└── package.json
```

## API Endpunkte

### Authentifizierung
- `POST /api/login` - Anmeldung

### Lunches
- `GET /api/lunches` - Alle Lunches abrufen
- `GET /api/lunches/:id` - Einzelnen Lunch abrufen
- `POST /api/lunches` - Neuen Lunch erstellen
- `PUT /api/lunches/:id` - Lunch aktualisieren
- `DELETE /api/lunches/:id` - Lunch löschen

### Speaker
- `GET /api/speakers` - Alle Speaker abrufen
- `GET /api/speakers/:id` - Einzelnen Speaker abrufen
- `POST /api/speakers` - Neuen Speaker erstellen
- `PUT /api/speakers/:id` - Speaker aktualisieren
- `DELETE /api/speakers/:id` - Speaker löschen

### Speaker-Anfragen
- `GET /api/speaker-requests` - Alle Anfragen abrufen
- `POST /api/speaker-requests` - Neue Anfrage erstellen
- `PUT /api/speaker-requests/:id` - Anfrage-Status ändern

### Kalender
- `GET /api/calendar` - Kalender-Events abrufen

### Öffentliche Routes (für Speaker)
- `GET /api/public/speaker-request/:token` - Anfrage-Details abrufen
- `POST /api/public/speaker-request/:token/select` - Termin auswählen
- `POST /api/public/speaker-request/:token/decline` - Alle Termine ablehnen

## Entwicklung

Das Portal läuft standardmäßig auf:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Sicherheit

⚠️ **Wichtig**: Ändern Sie das Standard-Passwort und den JWT_SECRET in der Produktion!

Die Datenbank wird automatisch beim ersten Start erstellt. Die SQLite-Datei befindet sich in `server/rotary.db`.

## Support

Bei Fragen oder Problemen wenden Sie sich bitte an den Entwickler.

---

**Rotary Club St.Gallen - Präsidialjahr 2026-2027**
