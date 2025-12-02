# 🚂 Railway - Einfachste Lösung

## Sie sind in Settings → Source, aber sehen kein Repository-Feld?

Das ist okay! Railway erkennt das Repository automatisch.

## Was Sie tun müssen:

### Schritt 1: Prüfen Sie "Deploy" Settings

1. In **Settings** → Scrollen Sie zu **"Deploy"** (nicht Source!)
2. Dort sollten Sie sehen:
   - **Build Command**
   - **Start Command**

### Schritt 2: Build Command setzen

**Build Command:**
```
cd client && npm install && npm run build
```

### Schritt 3: Start Command setzen

**Start Command:**
```
cd client && npm run start
```

### Schritt 4: Environment Variables

1. Klicken Sie auf **"Variables"** (im linken Menü, nicht in Settings)
2. Prüfen Sie ob `VITE_API_URL` existiert
3. Falls nicht: **"New Variable"**
   - **Name:** `VITE_API_URL`
   - **Value:** `https://ihr-backend-url.railway.app`

### Schritt 5: Redeploy

1. Gehen Sie zu **"Deployments"** (linkes Menü)
2. Klicken Sie auf **"Redeploy"** oder den neuesten Deployment
3. Warten Sie 2-3 Minuten

---

## Alternative: Service neu erstellen (Einfacher)

Falls das nicht funktioniert:

1. **Löschen Sie den Service** (Settings → ganz unten → Delete Service)

2. **"New"** → **"Empty Project"**

3. **"Add Service"** → **"GitHub Repo"**

4. Repository: `rotarysg-portal-next`

5. **WICHTIG:** Beim Erstellen sehen Sie vielleicht:
   - **"Monorepo"** Option → Aktivieren
   - Oder: **"Path"** oder **"Directory"** → `client` eintragen

6. Railway erkennt automatisch die `railway.json` im `client`-Ordner!

---

## Was Sie in den Logs sehen sollten:

Nach dem Deploy:
- ✅ "Installing dependencies..."
- ✅ "Building..."
- ✅ "Build successful"
- ✅ "Server running on port 3000"

Falls Fehler: Senden Sie mir die Logs!

