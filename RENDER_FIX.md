# 🔧 Render.com Deployment-Fehler beheben

## Fehler: "Exited with status 127"

Dies bedeutet, dass ein Befehl nicht gefunden wurde (meist Node.js oder npm).

## Lösung: Render.com Einstellungen korrigieren

### Backend Service Einstellungen:

1. **Gehen Sie zu Ihrem Backend-Service auf Render.com**
2. **Klicken Sie auf "Settings"**
3. **Überprüfen Sie folgende Einstellungen:**

   **Build Command:**
   ```
   cd server && npm install
   ```
   
   **Start Command:**
   ```
   cd server && npm start
   ```
   
   **Oder alternativ (wenn das nicht funktioniert):**
   
   Build Command:
   ```
   npm install --prefix server
   ```
   
   Start Command:
   ```
   node server/index.js
   ```

4. **Environment Variables prüfen:**
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (oder leer lassen - Render setzt es automatisch)
   - `JWT_SECRET` = `509b0b71377537603efca515e92307e0bd6fcf5d5407f091b668fbaf4d327dc1`

5. **Root Directory:** (leer lassen)

6. **Runtime:** `Node` (sollte automatisch erkannt werden)

### Alternative: Build und Start in einem Befehl

Falls das nicht funktioniert, versuchen Sie:

**Build Command:**
```
npm install && cd server && npm install
```

**Start Command:**
```
cd server && node index.js
```

### Wichtig:

- Stellen Sie sicher, dass **"Auto-Deploy"** aktiviert ist
- Nach Änderungen: Klicken Sie auf **"Manual Deploy"** → **"Deploy latest commit"**

### Falls es weiterhin nicht funktioniert:

Prüfen Sie die **Logs** im Render-Dashboard:
- Klicken Sie auf den Service → Tab "Logs"
- Schauen Sie, welche Fehlermeldung genau erscheint

