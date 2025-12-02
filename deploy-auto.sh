#!/bin/bash

echo "🚀 Automatisches Render.com Deployment"
echo ""

# Prüfe ob Render CLI installiert ist
if ! command -v render &> /dev/null; then
    echo "❌ Render CLI nicht gefunden. Installiere..."
    brew install render
fi

# Prüfe ob bereits authentifiziert
if ! render whoami &>/dev/null; then
    echo "📝 Bitte authentifizieren Sie sich bei Render.com:"
    echo "   Der Browser wird geöffnet..."
    render login
    echo ""
fi

echo "✅ Authentifiziert bei Render.com"
echo ""

# Repository URL
REPO_URL="https://github.com/mailimailo/rotarysg-portal-next"
JWT_SECRET="509b0b71377537603efca515e92307e0bd6fcf5d5407f091b668fbaf4d327dc1"

echo "📦 Erstelle Backend Service..."
echo "   Dies kann einige Minuten dauern..."
echo ""

# Backend Service erstellen
# Hinweis: Die Render CLI unterstützt möglicherweise nicht alle Features direkt
# Daher geben wir hier eine manuelle Anleitung

echo "⚠️  Automatisches Deployment über CLI ist limitiert."
echo ""
echo "📋 Bitte folgen Sie dieser Anleitung:"
echo ""
echo "1. Gehen Sie zu: https://render.com"
echo "2. Klicken Sie auf 'New +' → 'Web Service'"
echo "3. Repository: $REPO_URL"
echo ""
echo "Backend Einstellungen:"
echo "  - Name: rotarysg-portal-backend"
echo "  - Build: cd server && npm install"
echo "  - Start: cd server && npm start"
echo "  - Env Vars:"
echo "    NODE_ENV=production"
echo "    PORT=10000"
echo "    JWT_SECRET=$JWT_SECRET"
echo ""
echo "Frontend Einstellungen (nach Backend):"
echo "  - Name: rotarysg-portal-frontend"
echo "  - Type: Static Site"
echo "  - Build: cd client && npm install && npm run build"
echo "  - Publish: client/dist"
echo "  - Env Var: VITE_API_URL=https://rotarysg-portal-backend.onrender.com"
echo ""
echo "📖 Detaillierte Anleitung: siehe DEPLOY_RENDER.md"

