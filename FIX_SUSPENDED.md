# 🔧 Service wurde suspendiert - Lösung

## Problem
Der Service zeigt: "This service has been suspended by its owner."

## Lösung: Service wieder aktivieren

### Auf Render.com:

1. **Gehen Sie zu:** https://dashboard.render.com
2. **Klicken Sie auf den suspendierten Service**
3. **Im Service-Dashboard:**
   - Suchen Sie nach einem Button **"Resume"** oder **"Unsuspend"**
   - Oder klicken Sie auf **"Settings"** → **"Resume Service"**

### Falls der Service gelöscht wurde:

Sie müssen ihn neu erstellen:

**Backend (Web Service):**
1. "New +" → "Web Service"
2. Repository: `rotarysg-portal-next`
3. Name: `rotarysg-portal-backend`
4. Build: `cd server && npm install`
5. Start: `cd server && npm start`
6. Environment Variables:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `JWT_SECRET=509b0b71377537603efca515e92307e0bd6fcf5d5407f091b668fbaf4d327dc1`

**Frontend (Static Site):**
1. "New +" → "Static Site"
2. Repository: `rotarysg-portal-next`
3. Name: `rotarysg-portal-frontend`
4. Build: `cd client && npm install && npm run build`
5. Publish: `client/dist`
6. Environment Variable:
   - `VITE_API_URL=https://rotarysg-portal-backend.onrender.com`

### Mögliche Gründe für Suspension:

- Service wurde manuell gestoppt
- Kostenloser Plan-Limit erreicht (unwahrscheinlich)
- Account-Problem

### Tipp:

Falls Sie beide Services neu erstellen müssen, notieren Sie sich die URLs und aktualisieren Sie die `VITE_API_URL` im Frontend entsprechend.



