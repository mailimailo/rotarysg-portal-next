# 🌐 Netlify Deployment - Super Einfach!

## In 3 Schritten zum dauerhaften Link:

### Schritt 1: Netlify Account erstellen

1. Gehen Sie zu: **https://www.netlify.com**
2. Klicken Sie auf **"Sign up"**
3. Login mit **GitHub** (verwenden Sie Ihr GitHub Account)

### Schritt 2: Site erstellen

1. Klicken Sie auf **"Add new site"** → **"Import an existing project"**
2. Wählen Sie **"Deploy with GitHub"**
3. Autorisiere Netlify für GitHub
4. Wählen Sie Repository: **`rotarysg-portal-next`**

### Schritt 3: Build Settings

Netlify zeigt automatisch Build Settings an:

**Base directory:** `client`

**Build command:** 
```
npm install && npm run build
```

**Publish directory:** 
```
dist
```

**Environment variables:**
- Klicken Sie auf **"Show advanced"** → **"New variable"**
- **Key:** `VITE_API_URL`
- **Value:** `https://ihr-backend-url.railway.app`
- (Ihre Backend-URL von Railway!)

### Schritt 4: Deploy!

1. Klicken Sie auf **"Deploy site"**
2. Warten Sie 2-3 Minuten
3. **Fertig!** Netlify gibt Ihnen automatisch eine URL wie: `rotary-portal-123.netlify.app`

---

## ✅ Das war's!

**Link für Vera:** `https://ihr-site-name.netlify.app`

Dieser Link ist **dauerhaft** und funktioniert immer!

---

## 🔧 Backend auf Railway (falls noch nicht gemacht)

Falls Sie das Backend noch nicht auf Railway haben:

1. Railway → **New Project** → **GitHub Repo**
2. Repository: `rotarysg-portal-next`
3. **Root Directory:** `server`
4. **Environment Variables:**
   - `JWT_SECRET=rotary-secret-key-2026`
   - `PORT=3001`
5. **Generate Domain** → Backend-URL kopieren
6. Diese URL in Netlify als `VITE_API_URL` eintragen!

---

## 🎉 Vorteile von Netlify:

- ✅ **Super einfach** - 3 Klicks, fertig!
- ✅ **Automatisches Deployment** - Bei jedem Git Push
- ✅ **Kostenlos** für kleine Projekte
- ✅ **Dauerhafter Link**
- ✅ **SSL automatisch** (https://)

Viel einfacher als Railway! 🚀

