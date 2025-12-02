# 🚀 Schnelles Deployment - Link für Vera

## In 5 Schritten zum dauerhaften Link:

### 1️⃣ Railway Account erstellen
- Gehen Sie zu: **https://railway.app**
- **"Start a New Project"** → Login mit GitHub

### 2️⃣ Backend deployen
1. **"New Project"** → **"Deploy from GitHub repo"**
2. Repository: **`rotarysg-portal-next`**
3. **Root Directory:** `server` ⚠️ WICHTIG!
4. **Settings** → **Variables** → Fügen Sie hinzu:
   ```
   JWT_SECRET=rotary-secret-key-2026
   PORT=3001
   ```
5. **Settings** → **Generate Domain**
6. **Backend-URL kopieren!** (z.B. `rotary-backend.railway.app`)

### 3️⃣ Frontend deployen
1. **Neues Projekt** → **"Deploy from GitHub repo"**
2. Repository: **`rotarysg-portal-next`**
3. **Root Directory:** `client` ⚠️ WICHTIG!
4. **Settings** → **Variables** → Fügen Sie hinzu:
   ```
   VITE_API_URL=https://ihr-backend-url.railway.app
   ```
   *(Ersetzen Sie mit der tatsächlichen Backend-URL aus Schritt 2!)*
5. **Settings** → **Generate Domain**
6. **Frontend-URL kopieren!** (z.B. `rotary-portal.railway.app`)

### 4️⃣ Testen
- Öffnen Sie die Frontend-URL
- Login: `praesident` / `admin123`
- Alles sollte funktionieren!

### 5️⃣ Link an Vera senden
**✅ Fertig!** Senden Sie die Frontend-URL an Vera.

---

## 📋 Checklist:

- [ ] Railway Account erstellt
- [ ] Backend deployed (Root: `server`)
- [ ] Backend Domain generiert und kopiert
- [ ] Frontend deployed (Root: `client`)
- [ ] `VITE_API_URL` auf Backend-URL gesetzt
- [ ] Frontend Domain generiert
- [ ] Getestet (Login funktioniert)
- [ ] Link an Vera gesendet!

---

## 🆘 Probleme?

**Backend läuft nicht:**
- Prüfen Sie Logs in Railway
- Prüfen Sie ob `PORT` Variable gesetzt ist

**Frontend kann Backend nicht erreichen:**
- Prüfen Sie `VITE_API_URL` (muss mit `https://` beginnen!)
- Stelle sicher, dass Backend-URL korrekt ist

**CORS Fehler:**
- Backend sollte automatisch CORS erlauben
- Prüfen Sie die Backend-Logs

---

## 💡 Tipp:

Die Links sind **dauerhaft** und funktionieren immer, solange Railway läuft (kostenlos für kleine Projekte).
