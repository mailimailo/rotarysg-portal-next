# ✅ NETLIFY FIX - API URL korrigieren

## Problem gefunden!

Die API-URL ist fast richtig, aber es fehlt `/api` am Ende!

**Aktuell:**
```
https://rotary-portal-backend-production-bd6b.up.railway.app
```

**Sollte sein:**
```
https://rotary-portal-backend-production-bd6b.up.railway.app/api
```

## Lösung:

### In Netlify:

1. Gehen Sie zu **Environment Variables**
2. Klicken Sie auf **`VITE_API_URL`**
3. Klicken Sie auf **"Edit"** (Stift-Icon)
4. Ändern Sie den Wert zu:
   ```
   https://rotary-portal-backend-production-bd6b.up.railway.app/api
   ```
5. **WICHTIG:** Muss mit `/api` enden!
6. Speichern

### Dann Redeploy:

1. **Deploys** → **"Trigger deploy"**
2. **"Clear cache and deploy site"**
3. Warten Sie 2-3 Minuten

### Testen:

1. Öffnen Sie: https://rotarysg-portal.netlify.app/login
2. Versuchen Sie sich einzuloggen
3. **Sollte jetzt funktionieren!** ✅

---

## Warum?

Das Backend hat alle Routes unter `/api/...`:
- `/api/login`
- `/api/speakers`
- `/api/lunches`
- etc.

Die `API_URL` muss also auf `/api` enden, damit die Requests korrekt sind!

