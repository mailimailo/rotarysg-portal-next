# 🚂 Railway - Einfache Anleitung

## Das Problem:
Railway zeigt die Standard-Seite statt Ihrer App.

## Lösung - 3 einfache Schritte:

### Schritt 1: In Railway Dashboard

1. Öffnen Sie Ihr **Frontend Service** (rotary-portal)
2. Klicken Sie auf **"Settings"** (oben rechts)
3. Scrollen Sie nach unten zu **"Deploy"**

### Schritt 2: Build & Start Commands setzen

In den **Settings** → **Deploy** finden Sie:

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm run start
```

### Schritt 3: Environment Variable prüfen

1. Klicken Sie auf **"Variables"** (im linken Menü)
2. Prüfen Sie ob `VITE_API_URL` existiert
3. Falls nicht, fügen Sie hinzu:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://ihr-backend-url.railway.app`
   - (Ersetzen Sie mit Ihrer tatsächlichen Backend-URL!)

### Schritt 4: Redeploy

1. Klicken Sie auf **"Deployments"** (im linken Menü)
2. Klicken Sie auf **"Redeploy"** oder **"Deploy"**
3. Warten Sie bis fertig (ca. 2-3 Minuten)

---

## Alternative: Service löschen und neu erstellen

Falls es immer noch nicht funktioniert:

1. **Löschen Sie den Frontend Service**
2. **"New Project"** → **"Deploy from GitHub repo"**
3. Repository: `rotarysg-portal-next`
4. **WICHTIG:** Beim Erstellen, wählen Sie **"client"** als Ordner aus
   - Oder nach dem Erstellen: **Settings** → **Source** → **Monorepo** → **Subdirectory:** `client`

---

## Prüfen Sie die Logs:

1. **Deployments** → Klicken Sie auf den neuesten Deployment
2. **View Logs**
3. Sollte zeigen:
   - ✅ "Build successful"
   - ✅ "Server running on port 3000"
   - ❌ Falls Fehler: Senden Sie mir die Logs!

---

## Was Sie sehen sollten:

Nach erfolgreichem Deploy:
- ✅ Login-Seite erscheint
- ✅ Keine Railway ASCII-Art mehr
- ✅ Ihre React-App läuft

