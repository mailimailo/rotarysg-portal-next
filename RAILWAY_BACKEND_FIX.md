# 🔧 Railway Backend Fix - Dependencies nicht gefunden

## Problem:
Railway findet `express` nicht - Dependencies werden nicht installiert.

## Lösung:

### In Railway Dashboard:

1. Öffnen Sie Ihren **Backend Service**
2. **Settings** → **Deploy**
3. **Build Command:** `cd server && npm install`
4. **Start Command:** `cd server && npm start`
5. **Redeploy**

---

## Oder: Root Directory setzen

1. **Settings** → **Source**
2. **Root Directory:** `server` ⚠️ WICHTIG!
3. Dann:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. **Redeploy**

---

## Was ich gemacht habe:

Ich habe die `railway.json` im `server`-Ordner erstellt. Railway sollte diese automatisch erkennen, wenn Root Directory auf `server` gesetzt ist.

---

## Nach dem Fix:

Die Logs sollten zeigen:
- ✅ "Installing dependencies..."
- ✅ "Build successful"
- ✅ "Server läuft auf Port 10000"
- ✅ "Rotary Portal Backend bereit"

Keine "Cannot find module" Fehler mehr!

