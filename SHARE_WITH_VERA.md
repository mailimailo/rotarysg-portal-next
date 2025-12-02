# 🌐 Portal für Vera extern verfügbar machen

## Option 1: ngrok (Schnell & Einfach - für Tests)

### Schritt 1: ngrok installieren
```bash
# Mit Homebrew (macOS)
brew install ngrok

# Oder download von: https://ngrok.com/download
```

### Schritt 2: ngrok Account erstellen (kostenlos)
1. Gehen Sie zu: https://dashboard.ngrok.com/signup
2. Erstellen Sie einen kostenlosen Account
3. Kopieren Sie Ihren Authtoken

### Schritt 3: ngrok konfigurieren
```bash
ngrok config add-authtoken IHR_TOKEN_HIER
```

### Schritt 4: Portal starten
```bash
cd /Users/milostoessel/rotary-portal
npm run dev
```

### Schritt 5: ngrok Tunnel starten (in neuem Terminal)
```bash
ngrok http 3000
```

### Schritt 6: Link an Vera senden
- ngrok zeigt Ihnen einen Link wie: `https://abc123.ngrok.io`
- Dieser Link funktioniert sofort!
- Senden Sie diesen Link an Vera

**⚠️ Wichtig:** 
- Der Link ändert sich bei jedem Neustart (kostenlose Version)
- Für dauerhaften Link: Option 2 (Railway)

---

## Option 2: Railway (Dauerhaft & Professionell)

### Schritt 1: Railway Account erstellen
1. Gehen Sie zu: https://railway.app
2. Klicken Sie auf "Start a New Project"
3. Login mit GitHub

### Schritt 2: Projekt deployen
1. In Railway: "New Project" → "Deploy from GitHub repo"
2. Wählen Sie: `rotarysg-portal-next`
3. Railway erkennt automatisch das Projekt

### Schritt 3: Environment Variables setzen
In Railway Dashboard → Variables:
- `JWT_SECRET` = `rotary-secret-key-change-in-production`
- `PORT` = `3001` (wird automatisch gesetzt)

### Schritt 4: Backend & Frontend deployen
Railway erstellt automatisch:
- Backend Service (Port 3001)
- Frontend Service (Port 3000)

### Schritt 5: Domain konfigurieren
1. Railway → Settings → Generate Domain
2. Kopieren Sie die URL (z.B. `rotary-portal.railway.app`)
3. Diese URL funktioniert dauerhaft!

### Schritt 6: Frontend API URL anpassen
In Railway Frontend Service → Variables:
- `VITE_API_URL` = `https://ihr-backend-url.railway.app`

**✅ Vorteil:** Dauerhafter Link, professionell, kostenlos für kleine Projekte

---

## Option 3: Vercel (Frontend) + Railway (Backend)

### Frontend auf Vercel:
1. Gehen Sie zu: https://vercel.com
2. Login mit GitHub
3. "Import Project" → `rotarysg-portal-next/client`
4. Environment Variable: `VITE_API_URL` = Backend URL von Railway
5. Deploy!

### Backend auf Railway:
(Siehe Option 2)

**✅ Vorteil:** Beste Performance, kostenlos

---

## 🚀 Empfehlung für Sie:

**Für schnellen Test mit Vera:**
→ **Option 1 (ngrok)** - Funktioniert in 2 Minuten!

**Für dauerhafte Lösung:**
→ **Option 2 (Railway)** - Alles auf einer Plattform, einfach!

Soll ich Ihnen bei einer der Optionen helfen?

