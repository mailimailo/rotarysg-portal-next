# Render.com Deployment - Schritt für Schritt

## Repository
**URL:** https://github.com/mailimailo/rotarysg-portal-next

## 1. Backend auf Render.com deployen

1. Gehen Sie zu https://render.com
2. Erstellen Sie einen Account (kostenlos mit GitHub-Login)
3. Klicken Sie auf **"New +"** → **"Web Service"**
4. Verbinden Sie Ihr GitHub-Konto (falls noch nicht geschehen)
5. Wählen Sie das Repository: **rotarysg-portal-next**
6. **Einstellungen:**
   - **Name:** `rotarysg-portal-backend`
   - **Environment:** `Node`
   - **Region:** Wählen Sie die nächstgelegene Region (z.B. Frankfurt)
   - **Branch:** `main`
   - **Root Directory:** (leer lassen)
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`
7. **Environment Variables hinzufügen:**
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `JWT_SECRET` = `509b0b71377537603efca515e92307e0bd6fcf5d5407f091b668fbaf4d327dc1`
8. Klicken Sie auf **"Create Web Service"**
9. Warten Sie, bis das Deployment abgeschlossen ist (ca. 5-10 Minuten)
10. **Notieren Sie sich die URL:** z.B. `https://rotarysg-portal-backend.onrender.com`

## 2. Frontend auf Render.com deployen

1. Auf Render.com: Klicken Sie auf **"New +"** → **"Static Site"**
2. Wählen Sie das gleiche Repository: **rotarysg-portal-next**
3. **Einstellungen:**
   - **Name:** `rotarysg-portal-frontend`
   - **Branch:** `main`
   - **Root Directory:** (leer lassen)
   - **Build Command:** `cd client && npm install && npm run build`
   - **Publish Directory:** `client/dist`
4. **Environment Variable hinzufügen:**
   - `VITE_API_URL` = `https://rotarysg-portal-backend.onrender.com` (die Backend-URL von Schritt 1)
5. Klicken Sie auf **"Create Static Site"**
6. Warten Sie, bis das Deployment abgeschlossen ist (ca. 3-5 Minuten)
7. **Notieren Sie sich die Frontend-URL:** z.B. `https://rotarysg-portal-frontend.onrender.com`

## 3. Fertig! 🎉

Ihre Anwendung ist jetzt öffentlich erreichbar unter der Frontend-URL!

### Wichtige Hinweise:

- **Erste Deployment:** Kann 5-10 Minuten dauern
- **Automatische Updates:** Bei jedem Git Push wird automatisch neu deployed
- **Kostenloser Plan:** 
  - Services schlafen nach 15 Minuten Inaktivität ein
  - Erste Anfrage nach dem Schlafen kann 30-60 Sekunden dauern
- **Datenbank:** SQLite wird auf Render.com gespeichert (persistent)
- **HTTPS:** Automatisch aktiviert

### Zugangsdaten (Standard):

- **Benutzername:** `praesident` oder `programm`
- **Passwort:** `admin123`

⚠️ **Wichtig:** Ändern Sie das Passwort nach dem ersten Login!

