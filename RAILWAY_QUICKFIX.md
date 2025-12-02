# ⚡ Railway Quick Fix - In 2 Minuten

## Das Problem:
Railway zeigt die Standard-Seite, nicht Ihre App.

## Schnellste Lösung:

### Option 1: Service löschen und neu erstellen (Empfohlen)

1. **Löschen Sie den Frontend Service** (Settings → Delete Service)

2. **Neuer Service:**
   - **"New"** → **"GitHub Repo"**
   - Repository: `rotarysg-portal-next`
   - **WICHTIG:** Beim Erstellen, klicken Sie auf **"Configure"** oder **"Advanced"**
   - **Root Directory:** `client` eintragen
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`

3. **Environment Variable:**
   - **Variables** → **New Variable**
   - Name: `VITE_API_URL`
   - Value: `https://ihr-backend-url.railway.app`

4. **Deploy** → Fertig!

---

### Option 2: Settings direkt anpassen (Falls Service schon existiert)

1. Öffnen Sie den **Frontend Service**
2. **Settings** → **Source**
3. **Root Directory:** `client` (manuell eintragen)
4. **Settings** → **Deploy**
5. **Build Command:** `npm install && npm run build`
6. **Start Command:** `npm run start`
7. **Redeploy**

---

### Option 3: Static Site (Einfachste Option)

1. **Settings** → **Service Type** → **Static Site**
2. **Output Directory:** `dist`
3. **Build Command:** `npm install && npm run build`
4. **Redeploy**

**⚠️ WICHTIG bei Static Site:**
- `VITE_API_URL` muss auf Backend zeigen
- Backend muss CORS erlauben

---

## Was Sie sehen sollten:

✅ Login-Seite erscheint  
✅ Keine Railway ASCII-Art  
✅ Ihre React-App läuft

Falls nicht: Senden Sie mir die Logs aus **Deployments** → **View Logs**

