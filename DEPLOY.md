# Deployment-Anleitung - Rotary Portal

## Option 1: Render.com (Empfohlen - Kostenlos)

### Backend deployen:

1. **GitHub Repository erstellen:**
   ```bash
   cd /Users/milostoessel/rotary-portal
   git init
   git add .
   git commit -m "Initial commit"
   # Erstellen Sie ein Repository auf GitHub und pushen Sie den Code
   ```

2. **Auf Render.com:**
   - Gehen Sie zu https://render.com
   - Erstellen Sie einen Account (kostenlos)
   - Klicken Sie auf "New +" → "Web Service"
   - Verbinden Sie Ihr GitHub Repository
   - Wählen Sie das Repository aus
   - **Einstellungen:**
     - **Name:** rotary-portal-backend
     - **Environment:** Node
     - **Build Command:** `cd server && npm install`
     - **Start Command:** `cd server && npm start`
     - **Root Directory:** (leer lassen)
   - **Environment Variables hinzufügen:**
     - `NODE_ENV` = `production`
     - `PORT` = `10000` (wird automatisch gesetzt, aber für Sicherheit)
     - `JWT_SECRET` = (generieren Sie einen sicheren Secret, z.B. mit `openssl rand -hex 32`)
   - Klicken Sie auf "Create Web Service"
   - Notieren Sie sich die URL (z.B. `https://rotary-portal-backend.onrender.com`)

### Frontend deployen:

1. **Auf Render.com:**
   - Klicken Sie auf "New +" → "Static Site"
   - Verbinden Sie das gleiche GitHub Repository
   - **Einstellungen:**
     - **Name:** rotary-portal-frontend
     - **Build Command:** `cd client && npm install && npm run build`
     - **Publish Directory:** `client/dist`
   - **Environment Variables:**
     - `VITE_API_URL` = `https://rotary-portal-backend.onrender.com` (die Backend-URL von oben)
   - Klicken Sie auf "Create Static Site"
   - Notieren Sie sich die URL (z.B. `https://rotary-portal-frontend.onrender.com`)

2. **API-URL im Frontend anpassen:**
   - Die `VITE_API_URL` wird automatisch verwendet
   - Falls nicht, müssen Sie `client/src/api.js` anpassen

### Nach dem Deployment:

- Die Frontend-URL ist Ihre öffentliche Adresse
- Alle Links werden automatisch mit der Backend-URL verbunden
- Die Datenbank wird auf Render.com gespeichert (SQLite)

---

## Option 2: Railway.app (Alternative)

1. Gehen Sie zu https://railway.app
2. Erstellen Sie einen Account
3. "New Project" → "Deploy from GitHub repo"
4. Wählen Sie Ihr Repository
5. Railway erkennt automatisch Node.js
6. **Backend:**
   - Root Directory: `server`
   - Start Command: `npm start`
7. **Frontend:**
   - Separate Service erstellen
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Start Command: `npm run preview` oder statisches Hosting

---

## Option 3: Schnelles Testen mit ngrok (Temporär)

Für schnelles Testen können Sie ngrok verwenden:

```bash
# Installieren Sie ngrok: https://ngrok.com/download
# Backend tunnelieren:
ngrok http 3001

# Frontend tunnelieren (in neuem Terminal):
ngrok http 3000
```

**Nachteil:** Die URLs ändern sich bei jedem Start (kostenlose Version)

---

## Option 4: Vercel (Frontend) + Render (Backend)

1. **Backend auf Render.com** (wie oben beschrieben)
2. **Frontend auf Vercel:**
   - Gehen Sie zu https://vercel.com
   - Verbinden Sie GitHub Repository
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variable: `VITE_API_URL` = Ihre Backend-URL

---

## Wichtige Hinweise:

1. **Datenbank:** SQLite funktioniert auf Render.com, aber für Produktion sollten Sie PostgreSQL verwenden
2. **Environment Variables:** Niemals Secrets in den Code committen!
3. **HTTPS:** Alle modernen Hosting-Services bieten automatisch HTTPS
4. **Domain:** Sie können eine eigene Domain verbinden (optional)

---

## Empfehlung:

**Render.com** ist die einfachste Lösung:
- ✅ Kostenlos
- ✅ Automatisches HTTPS
- ✅ Einfaches Setup
- ✅ GitHub Integration
- ✅ Automatische Deployments bei Git Push

