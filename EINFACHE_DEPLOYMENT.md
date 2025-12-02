# 🚀 Einfache Deployment-Optionen

## Option 1: Vercel (EINFACHSTE - Empfohlen!)

Vercel ist sehr benutzerfreundlich und erkennt automatisch alles.

### Frontend auf Vercel:

1. Gehen Sie zu: https://vercel.com
2. Login mit GitHub
3. "Add New" → "Project"
4. Repository auswählen: `rotarysg-portal-next`
5. **Root Directory:** `client`
6. **Framework Preset:** Vite
7. **Build Command:** `npm run build`
8. **Output Directory:** `dist`
9. **Environment Variable:**
   - `VITE_API_URL` = (Backend-URL - siehe unten)
10. Deploy!

### Backend auf Railway (einfacher als Render):

1. Gehen Sie zu: https://railway.app
2. Login mit GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Repository: `rotarysg-portal-next`
5. **Root Directory:** `server`
6. **Start Command:** `npm start`
7. **Environment Variables:**
   - `JWT_SECRET` = `509b0b71377537603efca515e92307e0bd6fcf5d5407f091b668fbaf4d327dc1`
8. Notieren Sie die Backend-URL
9. Gehen Sie zurück zu Vercel → Environment Variable `VITE_API_URL` setzen

---

## Option 2: Alles auf Railway (auch einfach)

1. Gehen Sie zu: https://railway.app
2. Login mit GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Repository: `rotarysg-portal-next`

**Backend:**
- Root: `server`
- Start: `npm start`
- Env: `JWT_SECRET=...`

**Frontend (separater Service):**
- Root: `client`
- Build: `npm run build`
- Start: `npx serve dist` (oder als Static Site)
- Env: `VITE_API_URL=...`

---

## Option 3: Netlify (Frontend) + Railway (Backend)

**Netlify für Frontend:**
1. https://netlify.com
2. "Add new site" → "Import from Git"
3. Repository wählen
4. **Base directory:** `client`
5. **Build command:** `npm run build`
6. **Publish directory:** `client/dist`
7. Environment Variable: `VITE_API_URL`

**Railway für Backend:** (wie oben)

---

## Option 4: Einfacher lokaler Server (für Testen)

Falls Sie nur testen möchten, können Sie lokal laufen lassen und mit ngrok öffentlich machen:

```bash
# Terminal 1: Backend
cd server && npm start

# Terminal 2: Frontend  
cd client && npm run dev

# Terminal 3: ngrok für Backend
ngrok http 3001

# Terminal 4: ngrok für Frontend
ngrok http 3000
```

Dann die ngrok-URLs verwenden.

---

## 🎯 Meine Empfehlung:

**Vercel (Frontend) + Railway (Backend)** - am einfachsten!

Soll ich Ihnen bei einer dieser Optionen helfen?



