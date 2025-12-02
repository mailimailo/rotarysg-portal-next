# 🔍 Deployment-Status prüfen

## Problem
Die URL `https://rotarysg-next-backendportal-ths0.onrender.com` zeigt nur das Frontend, nicht das Backend.

## Lösung: Zwei separate Services benötigt

### ✅ Prüfen Sie auf Render.com:

1. **Gehen Sie zu:** https://dashboard.render.com
2. **Schauen Sie in der Service-Liste:**
   - Haben Sie **ZWEI** Services?
   - Einen für Backend (Web Service)
   - Einen für Frontend (Static Site)

### Wenn nur EIN Service existiert:

Sie müssen noch das **Backend** erstellen:

1. **"New +" → "Web Service"**
2. **Repository:** rotarysg-portal-next
3. **Einstellungen:**
   ```
   Name: rotarysg-portal-backend
   Build: cd server && npm install
   Start: cd server && npm start
   ```
4. **Environment Variables:**
   - `NODE_ENV=production`
   - `PORT=10000`
   - `JWT_SECRET=509b0b71377537603efca515e92307e0bd6fcf5d5407f091b668fbaf4d327dc1`
5. **Notieren Sie die Backend-URL** (z.B. `https://rotarysg-portal-backend.onrender.com`)

### Dann Frontend aktualisieren:

1. **Gehen Sie zu Ihrem Frontend-Service**
2. **Environment Variables → Edit**
3. **Fügen Sie hinzu:**
   ```
   VITE_API_URL = https://rotarysg-portal-backend.onrender.com
   ```
   (Verwenden Sie die exakte Backend-URL von oben!)
4. **Speichern** → Service wird automatisch neu deployed

### Testen:

- **Backend:** `https://rotarysg-portal-backend.onrender.com/` (sollte JSON zeigen)
- **Frontend:** `https://rotarysg-next-backendportal-ths0.onrender.com/` (sollte die App zeigen)



