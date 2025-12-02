# ⚡ Schnelles Deployment - Vercel + Railway

## 🚂 Schritt 1: Backend auf Railway (2 Minuten)

Öffnen Sie ein Terminal und führen Sie aus:

```bash
cd /Users/milostoessel/rotary-portal

# 1. Bei Railway anmelden
railway login

# 2. Neues Projekt erstellen
railway init
# → Wählen Sie: "Create a new project"
# → Name: rotary-portal-backend

# 3. Environment Variables setzen
railway variables set JWT_SECRET=509b0b71377537603efca515e92307e0bd6fcf5d5407f091b668fbaf4d327dc1
railway variables set NODE_ENV=production

# 4. Root Directory setzen (wichtig!)
railway variables set RAILWAY_SERVICE_ROOT=server

# 5. Deployen
railway up

# 6. Backend-URL anzeigen (NOTIEREN!)
railway domain
```

**Notieren Sie die Backend-URL!** (z.B. `https://rotary-portal-backend-production.up.railway.app`)

---

## 🌐 Schritt 2: Frontend auf Vercel (2 Minuten)

In einem neuen Terminal:

```bash
cd /Users/milostoessel/rotary-portal/client

# 1. Bei Vercel anmelden
vercel login

# 2. Deployen
vercel --prod

# Folgen Sie den Fragen:
# - Set up and deploy? → Yes
# - Link to existing project? → No
# - Project name? → rotary-portal-frontend
# - Directory? → ./ (Enter drücken)
# - Override settings? → No

# 3. Environment Variable setzen (wichtig!)
vercel env add VITE_API_URL production
# → Geben Sie die Railway Backend-URL ein (von Schritt 1)

# 4. Neu deployen mit Environment Variable
vercel --prod
```

**Notieren Sie die Frontend-URL!** (wird am Ende angezeigt)

---

## ✅ Fertig!

Ihre Anwendung ist jetzt live! 🎉

- **Frontend:** (Vercel URL)
- **Backend:** (Railway URL)

### Login:
- Benutzername: `praesident` oder `programm`
- Passwort: `admin123`

---

## 💡 Tipps:

- **Automatische Updates:** Bei jedem Git Push wird automatisch neu deployed
- **Logs ansehen:**
  - Railway: `railway logs`
  - Vercel: `vercel logs`



