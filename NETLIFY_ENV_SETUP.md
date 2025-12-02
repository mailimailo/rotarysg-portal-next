# 🔧 Netlify Environment Variable setzen

## Ihre Netlify URL:
✅ **Frontend:** https://rotarysg-portal.netlify.app

## Problem:
404-Fehler beim Login = Backend wird nicht gefunden

## Lösung:

### Schritt 1: Backend-URL finden

1. Gehen Sie zu **Railway Dashboard**: https://railway.app
2. Öffnen Sie Ihren **Backend Service**
3. Klicken Sie auf **"Settings"**
4. Scrollen Sie zu **"Domains"** oder suchen Sie nach **"Generate Domain"**
5. **Kopieren Sie die Backend-URL** (sollte so aussehen: `rotary-backend-xxxx.railway.app`)

**Falls Sie keine Domain haben:**
- Klicken Sie auf **"Generate Domain"**
- Kopieren Sie die URL

### Schritt 2: Environment Variable in Netlify setzen

1. Gehen Sie zu **Netlify Dashboard**: https://app.netlify.com
2. Klicken Sie auf Ihre Site: **rotarysg-portal**
3. Klicken Sie auf **"Site settings"** (oben rechts)
4. Scrollen Sie zu **"Environment variables"** (linkes Menü)
5. Klicken Sie auf **"Add variable"**
6. Tragen Sie ein:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://ihr-backend-url.railway.app`
   - (Ersetzen Sie `ihr-backend-url.railway.app` mit Ihrer tatsächlichen Backend-URL!)

### Schritt 3: Redeploy

**WICHTIG:** Nach Änderung der Environment Variable muss neu deployed werden!

1. Gehen Sie zu **"Deploys"** (linkes Menü)
2. Klicken Sie auf **"Trigger deploy"** → **"Deploy site"**
3. Warten Sie 2-3 Minuten

### Schritt 4: Testen

1. Öffnen Sie: https://rotarysg-portal.netlify.app/login
2. Versuchen Sie sich einzuloggen:
   - Benutzername: `praesident`
   - Passwort: `admin123`

---

## Backend testen:

Öffnen Sie im Browser:
```
https://ihr-backend-url.railway.app/api/health
```

Sollte zurückgeben:
```json
{"status":"ok","service":"rotary-portal-backend"}
```

Falls nicht:
- Backend läuft nicht auf Railway
- Oder URL ist falsch

---

## Beispiel:

**Backend-URL:** `rotary-backend-abc123.railway.app`

**Dann in Netlify:**
- Key: `VITE_API_URL`
- Value: `https://rotary-backend-abc123.railway.app`

**WICHTIG:** Muss mit `https://` beginnen!

---

## Falls Backend nicht läuft:

1. Gehen Sie zu Railway
2. Öffnen Sie Backend Service
3. Prüfen Sie die **Logs** (Deployments → View Logs)
4. Stelle sicher, dass Backend läuft

Falls Backend nicht existiert:
- Erstellen Sie einen neuen Service auf Railway
- Root Directory: `server`
- Environment Variables: `JWT_SECRET=rotary-secret-key-2026`, `PORT=3001`
- Generate Domain

