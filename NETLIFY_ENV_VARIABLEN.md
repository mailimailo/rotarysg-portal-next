# 🔧 Environment Variables in Netlify finden

## Verschiedene Wege:

### Weg 1: Über das Hauptmenü

1. Gehen Sie zu: **https://app.netlify.com**
2. Klicken Sie auf Ihre Site: **rotarysg-portal**
3. Im **linken Menü** sehen Sie:
   - Deploys
   - Site configuration
   - Domain settings
   - Environment variables ← **HIER!**

### Weg 2: Über Site configuration

1. Klicken Sie auf Ihre Site: **rotarysg-portal**
2. Klicken Sie auf **"Site configuration"** (linkes Menü)
3. Scrollen Sie zu **"Environment variables"**
4. Klicken Sie darauf

### Weg 3: Direkter Link

1. Gehen Sie zu: **https://app.netlify.com/sites/rotarysg-portal/configuration/env**
2. (Ersetzen Sie `rotarysg-portal` mit Ihrer tatsächlichen Site-ID falls nötig)

### Weg 4: Über Build & deploy

1. Klicken Sie auf Ihre Site
2. **"Site configuration"** → **"Build & deploy"**
3. Scrollen Sie zu **"Environment variables"**

---

## Was Sie sehen sollten:

Eine Liste mit Environment Variables (wahrscheinlich leer)

## Dann:

1. Klicken Sie auf **"Add variable"** oder **"Add environment variable"**
2. Tragen Sie ein:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://rotary-portal-backend-production-4637.up.railway.app`
3. Klicken Sie auf **"Save"** oder **"Add"**

---

## Falls Sie es immer noch nicht finden:

Senden Sie mir einen Screenshot von:
- Der Netlify Dashboard-Seite Ihrer Site
- Oder sagen Sie mir, was Sie im linken Menü sehen

Dann kann ich Ihnen genau zeigen, wo Sie klicken müssen!

