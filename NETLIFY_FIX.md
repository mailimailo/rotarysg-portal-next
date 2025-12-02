# 🔧 Netlify 404 Fehler beheben

## Problem:
Login funktioniert nicht - "Server-Fehler: 404"

## Ursache:
Das Frontend kann das Backend nicht erreichen. Die `VITE_API_URL` ist wahrscheinlich nicht gesetzt oder falsch.

## Lösung:

### Schritt 1: Backend-URL prüfen

1. Gehen Sie zu **Railway Dashboard**
2. Öffnen Sie Ihren **Backend Service**
3. Klicken Sie auf **"Settings"**
4. Scrollen Sie zu **"Domains"** oder **"Generate Domain"**
5. **Kopieren Sie die Backend-URL** (z.B. `rotary-backend.railway.app`)

### Schritt 2: Environment Variable in Netlify setzen

1. Gehen Sie zu **Netlify Dashboard**
2. Klicken Sie auf Ihre Site
3. **"Site settings"** → **"Environment variables"**
4. Prüfen Sie ob `VITE_API_URL` existiert:
   - Falls **JA:** Prüfen Sie ob die URL korrekt ist (muss mit `https://` beginnen!)
   - Falls **NEIN:** Klicken Sie auf **"Add variable"**
     - **Key:** `VITE_API_URL`
     - **Value:** `https://ihr-backend-url.railway.app`
     - (Ersetzen Sie mit Ihrer tatsächlichen Backend-URL!)

### Schritt 3: Redeploy

**WICHTIG:** Nach Änderung der Environment Variable muss neu deployed werden!

1. In Netlify: **"Deploys"** → **"Trigger deploy"** → **"Deploy site"**
2. Oder: Machen Sie einen kleinen Git Commit (Netlify deployed automatisch)

### Schritt 4: Prüfen Sie die Backend-URL

Öffnen Sie im Browser:
```
https://ihr-backend-url.railway.app/api/health
```

Sollte zurückgeben:
```json
{"status":"ok","service":"rotary-portal-backend"}
```

Falls nicht: Backend läuft nicht oder URL ist falsch!

---

## Alternative: Backend auf Netlify Functions

Falls Railway Probleme macht, können wir das Backend auch auf Netlify Functions deployen, aber das ist komplizierter.

---

## Prüfen Sie:

1. ✅ Backend läuft auf Railway?
2. ✅ Backend-URL ist korrekt?
3. ✅ `VITE_API_URL` ist in Netlify gesetzt?
4. ✅ `VITE_API_URL` beginnt mit `https://`?
5. ✅ Nach Änderung wurde neu deployed?

Falls alles stimmt und es immer noch nicht funktioniert, senden Sie mir:
- Die Backend-URL
- Screenshot der Netlify Environment Variables

