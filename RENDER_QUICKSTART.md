# 🚀 Render.com Deployment - Schnellstart

## Repository
**https://github.com/mailimailo/rotarysg-portal-next**

---

## Schritt 1: Backend erstellen (5 Minuten)

1. **Gehen Sie zu:** https://dashboard.render.com
2. **Klicken Sie auf:** "New +" → **"Web Service"**
3. **Repository verbinden:**
   - Falls noch nicht verbunden: "Connect account" → GitHub wählen
   - Repository auswählen: **rotarysg-portal-next**
4. **Einstellungen ausfüllen:**

   ```
   Name: rotarysg-portal-backend
   Region: Frankfurt (oder nächstgelegene)
   Branch: main
   Root Directory: (leer lassen)
   Runtime: Node
   Build Command: cd server && npm install
   Start Command: cd server && npm start
   ```

5. **Environment Variables hinzufügen** (3 Stück):
   - Klicken Sie auf "Add Environment Variable"
   
   Variable 1:
   ```
   Key: NODE_ENV
   Value: production
   ```
   
   Variable 2:
   ```
   Key: PORT
   Value: 10000
   ```
   
   Variable 3:
   ```
   Key: JWT_SECRET
   Value: 509b0b71377537603efca515e92307e0bd6fcf5d5407f091b668fbaf4d327dc1
   ```

6. **Klicken Sie auf:** "Create Web Service"
7. **Warten Sie** ca. 5-10 Minuten bis das Deployment fertig ist
8. **Notieren Sie die URL:** z.B. `https://rotarysg-portal-backend.onrender.com`

---

## Schritt 2: Frontend erstellen (3 Minuten)

1. **Auf Render.com:** "New +" → **"Static Site"**
2. **Repository:** rotarysg-portal-next (gleiches wie oben)
3. **Einstellungen:**

   ```
   Name: rotarysg-portal-frontend
   Branch: main
   Root Directory: (leer lassen)
   Build Command: cd client && npm install && npm run build
   Publish Directory: client/dist
   ```

4. **Environment Variable hinzufügen:**
   ```
   Key: VITE_API_URL
   Value: https://rotarysg-portal-backend.onrender.com
   ```
   ⚠️ **Wichtig:** Verwenden Sie die exakte Backend-URL von Schritt 1!

5. **Klicken Sie auf:** "Create Static Site"
6. **Warten Sie** ca. 3-5 Minuten
7. **Notieren Sie die Frontend-URL:** z.B. `https://rotarysg-portal-frontend.onrender.com`

---

## ✅ Fertig!

Ihre Anwendung ist jetzt öffentlich erreichbar! 🎉

**Frontend-URL:** (die URL von Schritt 2)

### Erste Anmeldung:
- **Benutzername:** `praesident` oder `programm`
- **Passwort:** `admin123`

⚠️ **Wichtig:** Ändern Sie das Passwort nach dem ersten Login!

---

## 💡 Tipps:

- **Automatische Updates:** Bei jedem Git Push wird automatisch neu deployed
- **Erste Anfrage:** Nach 15 Min. Inaktivität "schläft" der Service - erste Anfrage kann 30-60 Sek. dauern
- **Logs ansehen:** Klicken Sie auf den Service → "Logs" Tab



