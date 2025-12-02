# 🚀 Einfaches Deployment für dauerhaften Link

## Option: Railway (Empfohlen - Alles in einem)

### Schritt 1: GitHub Repository prüfen
✅ Ihr Repository ist bereits auf GitHub: `rotarysg-portal-next`

### Schritt 2: Railway Account
1. Gehen Sie zu: **https://railway.app**
2. **"Start a New Project"**
3. Login mit **GitHub**

### Schritt 3: Backend deployen

1. **"New Project"** → **"Deploy from GitHub repo"**
2. Repository: **`rotarysg-portal-next`**
3. **Root Directory:** `server`
4. Railway erkennt automatisch Node.js

**Environment Variables:**
```
JWT_SECRET=rotary-secret-key-2026
PORT=3001
```

**Domain generieren:**
- Settings → Generate Domain
- Beispiel: `rotary-backend.railway.app`
- **Diese URL kopieren!**

### Schritt 4: Frontend deployen

1. **Neues Projekt** → **"Deploy from GitHub repo"**
2. Repository: **`rotarysg-portal-next`**
3. **Root Directory:** `client`

**Environment Variables:**
```
VITE_API_URL=https://ihr-backend-url.railway.app
```
*(Ersetzen Sie mit der tatsächlichen Backend-URL!)*

**Domain generieren:**
- Settings → Generate Domain
- Beispiel: `rotary-portal.railway.app`
- **Diese URL an Vera senden!**

### Schritt 5: Fertig! ✅

**Link für Vera:** `https://rotary-portal.railway.app`

Dieser Link ist **dauerhaft** und funktioniert immer!

---

## 📋 Quick Checklist:

- [ ] Railway Account erstellt
- [ ] Backend deployed (Root: `server`)
- [ ] Backend Domain kopiert
- [ ] Frontend deployed (Root: `client`)
- [ ] `VITE_API_URL` auf Backend-URL gesetzt
- [ ] Frontend Domain generiert
- [ ] Link an Vera gesendet!

---

## 🆘 Hilfe benötigt?

Falls etwas nicht funktioniert:
1. Prüfen Sie die Logs in Railway
2. Prüfen Sie die Environment Variables
3. Stelle sicher, dass beide Services laufen

