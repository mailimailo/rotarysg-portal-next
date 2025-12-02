# 🔧 Railway - Manuelle Konfiguration

## Problem: Railway zeigt nicht die App

## Lösung: Service löschen und NEU erstellen mit richtiger Konfiguration

### Schritt 1: Frontend Service löschen

1. Gehen Sie zu Railway Dashboard
2. Klicken Sie auf Ihren **Frontend Service** (rotary-portal)
3. **Settings** → Scrollen Sie ganz nach unten
4. **"Delete Service"** → Bestätigen

### Schritt 2: Neuen Service erstellen

1. Klicken Sie auf **"New"** → **"GitHub Repo"**
2. Wählen Sie: **`rotarysg-portal-next`**
3. Railway erstellt automatisch einen Service

### Schritt 3: Service konfigurieren

**WICHTIG:** Nach dem Erstellen müssen Sie die Settings anpassen!

1. Klicken Sie auf den **neuen Service**
2. Klicken Sie auf **"Settings"** (oben rechts)
3. Scrollen Sie zu **"Source"**

### Schritt 4: Source konfigurieren

In **Settings** → **Source**:

- **Repository:** `rotarysg-portal-next`
- **Branch:** `main`
- **Root Directory:** `client` ⚠️ WICHTIG!

Falls "Root Directory" nicht sichtbar ist:
- Klicken Sie auf **"Configure"** oder **"Edit"**
- Oder: **"Monorepo"** aktivieren → dann erscheint "Root Directory"

### Schritt 5: Build & Start Commands

In **Settings** → **Deploy**:

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm run start
```

### Schritt 6: Environment Variables

1. Klicken Sie auf **"Variables"** (linkes Menü)
2. Fügen Sie hinzu:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://ihr-backend-url.railway.app`
   - (Ihre Backend-URL!)

### Schritt 7: Deploy

1. Klicken Sie auf **"Deployments"**
2. Klicken Sie auf **"Redeploy"**
3. Warten Sie 2-3 Minuten

---

## Alternative: Wenn "Root Directory" nicht verfügbar ist

### Option A: Service Type ändern

1. **Settings** → **Service Type**
2. Wählen Sie **"Web Service"** (nicht Static Site)
3. Dann sollte "Root Directory" erscheinen

### Option B: Über railway.json

Die `railway.json` im `client`-Ordner sollte automatisch erkannt werden, aber Railway muss wissen, dass es im `client`-Ordner suchen soll.

**Lösung:** Erstellen Sie den Service direkt aus dem `client`-Ordner:

1. **New Project** → **"Empty Project"**
2. **"Add Service"** → **"GitHub Repo"**
3. Repository: `rotarysg-portal-next`
4. **Branch:** `main`
5. **Path:** `client` (hier können Sie den Pfad angeben!)

---

## Prüfen Sie die Logs:

Nach dem Deploy:
1. **Deployments** → Neuester Deployment
2. **View Logs**
3. Sollte zeigen:
   - ✅ "Installing dependencies..."
   - ✅ "Building..."
   - ✅ "Build successful"
   - ✅ "Server running on port 3000"

Falls Fehler: Senden Sie mir die Logs!

