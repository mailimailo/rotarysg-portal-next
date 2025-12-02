# 🚂 Railway Deployment - Dauerhafter Link für Vera

## Schritt 1: Railway Account erstellen

1. Gehen Sie zu: **https://railway.app**
2. Klicken Sie auf **"Start a New Project"**
3. Login mit **GitHub** (verwenden Sie Ihr GitHub Account)

## Schritt 2: Backend deployen

1. In Railway Dashboard: **"New Project"** → **"Deploy from GitHub repo"**
2. Wählen Sie: **`rotarysg-portal-next`**
3. Wählen Sie: **`server`** als Root Directory
4. Railway erkennt automatisch Node.js

### Environment Variables setzen:
Klicken Sie auf das Projekt → **Variables** → Fügen Sie hinzu:

```
JWT_SECRET=rotary-secret-key-change-in-production-2026
PORT=3001
NODE_ENV=production
```

### Domain generieren:
1. Klicken Sie auf **Settings** → **Generate Domain**
2. Kopieren Sie die URL (z.B. `rotary-backend.railway.app`)
3. **Diese URL ist Ihr Backend!**

## Schritt 3: Frontend deployen

1. In Railway: **"New Project"** (neues Projekt für Frontend)
2. **"Deploy from GitHub repo"**
3. Wählen Sie: **`rotarysg-portal-next`**
4. Wählen Sie: **`client`** als Root Directory

### Environment Variables setzen:
```
VITE_API_URL=https://ihr-backend-url.railway.app
```

**WICHTIG:** Ersetzen Sie `ihr-backend-url.railway.app` mit der tatsächlichen Backend-URL aus Schritt 2!

### Build Command anpassen:
In Railway Frontend → **Settings** → **Build Command:**
```
npm install && npm run build
```

### Start Command:
```
npx vite preview --port 3000 --host
```

### Domain generieren:
1. **Settings** → **Generate Domain**
2. Kopieren Sie die URL (z.B. `rotary-portal.railway.app`)
3. **Diese URL ist Ihr Frontend - Senden Sie sie an Vera!**

## Schritt 4: Testen

1. Öffnen Sie die Frontend-URL im Browser
2. Login mit: `praesident` / `admin123`
3. Alles sollte funktionieren!

## ✅ Fertig!

**Link für Vera:** `https://ihr-frontend-url.railway.app`

Dieser Link ist **dauerhaft verfügbar** und funktioniert immer!

---

## 🔧 Troubleshooting

### Backend läuft nicht:
- Prüfen Sie die Logs in Railway
- Prüfen Sie ob `PORT` Variable gesetzt ist

### Frontend kann Backend nicht erreichen:
- Prüfen Sie `VITE_API_URL` in Frontend Variables
- Stelle sicher, dass Backend-URL mit `https://` beginnt

### CORS Fehler:
- Backend sollte CORS bereits konfiguriert haben
- Prüfen Sie die Logs

