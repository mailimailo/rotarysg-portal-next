#!/bin/bash

echo "🚀 Deployment auf Vercel + Railway"
echo ""

# Prüfe ob Railway CLI installiert ist
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI nicht gefunden. Installiere..."
    brew install railway
fi

# Prüfe ob Vercel CLI installiert ist
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI nicht gefunden. Installiere..."
    npm install -g vercel
fi

echo "✅ CLIs gefunden"
echo ""

# Railway Backend Deployment
echo "📦 Railway Backend Setup:"
echo "1. Authentifizieren Sie sich bei Railway:"
railway login

echo ""
echo "2. Erstellen Sie ein neues Projekt:"
echo "   railway init"
echo ""
echo "3. Link zum Repository:"
echo "   railway link"
echo ""
echo "4. Setzen Sie Environment Variables:"
echo "   railway variables set JWT_SECRET=509b0b71377537603efca515e92307e0bd6fcf5d5407f091b668fbaf4d327dc1"
echo ""
echo "5. Deployen:"
echo "   railway up --service server"
echo ""
echo "6. Notieren Sie die Backend-URL (wird angezeigt)"
echo ""

# Vercel Frontend Deployment
echo "🌐 Vercel Frontend Setup:"
echo "1. Authentifizieren Sie sich bei Vercel:"
vercel login

echo ""
echo "2. Deployen Sie das Frontend:"
echo "   cd client && vercel --prod"
echo ""
echo "3. Setzen Sie Environment Variable:"
echo "   vercel env add VITE_API_URL"
echo "   (Geben Sie die Railway Backend-URL ein)"
echo ""

echo "✅ Setup-Anleitung abgeschlossen!"
echo ""
echo "📖 Detaillierte Schritte siehe: DEPLOY_VERCEL_RAILWAY.md"

