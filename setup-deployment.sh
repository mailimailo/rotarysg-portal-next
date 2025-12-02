#!/bin/bash

echo "🚀 Automatisches Deployment-Setup für Rotary Portal"
echo "=================================================="
echo ""

# Prüfe ob Railway CLI installiert ist
if ! command -v railway &> /dev/null; then
    echo "📦 Installiere Railway CLI..."
    npm install -g @railway/cli
fi

# Prüfe ob Netlify CLI installiert ist
if ! command -v netlify &> /dev/null; then
    echo "📦 Installiere Netlify CLI..."
    npm install -g netlify-cli
fi

echo ""
echo "✅ CLIs installiert"
echo ""
echo "📋 Nächste Schritte:"
echo ""
echo "1. BACKEND auf Railway deployen:"
echo "   railway login"
echo "   railway init"
echo "   railway link"
echo "   railway up --service server"
echo ""
echo "2. BACKEND-URL kopieren:"
echo "   railway domain"
echo ""
echo "3. FRONTEND auf Netlify deployen:"
echo "   netlify login"
echo "   netlify init"
echo "   netlify env:set VITE_API_URL https://ihr-backend-url.railway.app"
echo "   netlify deploy --prod"
echo ""
echo "Oder verwenden Sie die Web-Interfaces (einfacher):"
echo ""
echo "Railway: https://railway.app"
echo "Netlify: https://app.netlify.com"
echo ""

