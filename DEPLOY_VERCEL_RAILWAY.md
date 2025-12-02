# 🚀 Deployment auf Vercel + Railway - Schritt für Schritt

## Repository
**https://github.com/mailimailo/rotarysg-portal-next**

---

## Teil 1: Backend auf Railway (5 Minuten)

### Schritt 1: Railway Login
```bash
railway login
```
(Browser öffnet sich - Login mit GitHub)

### Schritt 2: Projekt erstellen
```bash
cd /Users/milostoessel/rotary-portal
railway init
```
- Wählen Sie: "Create a new project"
- Name: `rotary-portal-backend`

### Schritt 3: Service konfigurieren
```bash
railway service
```
- Wählen Sie: "Create a new service"
- Name: `backend`

### Schritt 4: Environment Variables setzen
```bash
railway variables set JWT_SECRET=509b0b71377537603efca515e92307e0bd6fcf5d5407f091b668fbaf4d327dc1
railway variables set NODE_ENV=production
```

### Schritt 5: Root Directory setzen
```bash
railway variables set RAILWAY_SERVICE_ROOT=server
```

### Schritt 6: Deployen
```bash
railway up
```

### Schritt 7: Backend-URL notieren
```bash
railway domain
```
**Notieren Sie diese URL!** (z.B. `https://rotary-portal-backend-production.up.railway.app`)

---

## Teil 2: Frontend auf Vercel (3 Minuten)

### Schritt 1: Vercel Login
```bash
cd /Users/milostoessel/rotary-portal
vercel login
```
(Browser öffnet sich - Login mit GitHub)

### Schritt 2: Frontend deployen
```bash
cd client
vercel --prod
```

Folgen Sie den Fragen:
- **Set up and deploy?** → Yes
- **Which scope?** → Ihr Account
- **Link to existing project?** → No
- **Project name?** → `rotary-portal-frontend`
- **Directory?** → `./` (Enter)
- **Override settings?** → No

### Schritt 3: Environment Variable setzen
```bash
vercel env add VITE_API_URL production
```
**Wichtig:** Geben Sie die Railway Backend-URL ein (von Teil 1, Schritt 7)

### Schritt 4: Neu deployen mit Environment Variable
```bash
vercel --prod
```

### Schritt 5: Frontend-URL notieren
Die URL wird am Ende angezeigt (z.B. `https://rotary-portal-frontend.vercel.app`)

---

## ✅ Fertig!

Ihre Anwendung ist jetzt öffentlich erreichbar!

- **Frontend:** (Vercel URL)
- **Backend:** (Railway URL)

### Erste Anmeldung:
- **Benutzername:** `praesident` oder `programm`
- **Passwort:** `admin123`

---

## 🔄 Updates

Bei jedem Git Push:
- **Railway:** Deployed automatisch
- **Vercel:** Deployed automatisch

---

## 🛠️ Troubleshooting

### Railway Backend funktioniert nicht:
```bash
railway logs
```

### Vercel Frontend funktioniert nicht:
```bash
vercel logs
```

### Environment Variable ändern:
```bash
# Railway
railway variables

# Vercel
vercel env ls
vercel env rm VITE_API_URL production
vercel env add VITE_API_URL production
```



