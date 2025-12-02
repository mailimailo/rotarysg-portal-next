# 🔧 Railway ohne Root Directory - Lösung

## Problem:
Railway findet Dependencies nicht, aber es gibt kein "Root Directory" Feld.

## Lösung: Build Commands anpassen

### In Railway Dashboard:

1. Öffnen Sie Ihren **Backend Service**
2. **Settings** → **Deploy**
3. **Build Command:** `cd server && npm install`
4. **Start Command:** `cd server && npm start`
5. **Speichern**
6. **Redeploy**

---

## Das sollte funktionieren!

Die Commands wechseln automatisch in das `server`-Verzeichnis, bevor sie die Dependencies installieren und den Server starten.

---

## Nach dem Redeploy:

Die Logs sollten zeigen:
- ✅ "Installing dependencies..."
- ✅ "Build successful"
- ✅ "Server läuft auf Port 10000"
- ✅ "Rotary Portal Backend bereit"

Keine "Cannot find module" Fehler mehr!

