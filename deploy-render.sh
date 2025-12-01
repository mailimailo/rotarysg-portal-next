#!/bin/bash

echo "🚀 Render.com Deployment Setup für Rotary Portal"
echo ""

# Prüfe ob gh CLI installiert ist
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI nicht gefunden. Bitte installieren Sie es mit: brew install gh"
    exit 1
fi

# Prüfe ob bereits authentifiziert
if ! gh auth status &>/dev/null; then
    echo "📝 Bitte authentifizieren Sie sich bei GitHub..."
    gh auth login --web
fi

echo ""
echo "📦 Repository-Informationen:"
REPO_URL=$(gh repo view --json url -q .url)
echo "   Repository: $REPO_URL"
echo ""

echo "🌐 Render.com Deployment-Anleitung:"
echo ""
echo "1. BACKEND DEPLOYMENT:"
echo "   - Gehen Sie zu: https://render.com"
echo "   - Klicken Sie auf 'New +' → 'Web Service'"
echo "   - Verbinden Sie GitHub und wählen Sie: rotarysg-portal-next"
echo "   - Einstellungen:"
echo "     * Name: rotarysg-portal-backend"
echo "     * Environment: Node"
echo "     * Build Command: cd server && npm install"
echo "     * Start Command: cd server && npm start"
echo "   - Environment Variables:"
echo "     * NODE_ENV = production"
echo "     * PORT = 10000"
echo "     * JWT_SECRET = $(openssl rand -hex 32)"
echo ""
echo "2. FRONTEND DEPLOYMENT:"
echo "   - Auf Render.com: 'New +' → 'Static Site'"
echo "   - Repository: rotarysg-portal-next"
echo "   - Build Command: cd client && npm install && npm run build"
echo "   - Publish Directory: client/dist"
echo "   - Environment Variable:"
echo "     * VITE_API_URL = https://rotarysg-portal-backend.onrender.com"
echo ""
echo "✅ Nach dem Deployment ist Ihre Anwendung öffentlich erreichbar!"
echo ""
echo "📝 Repository URL: $REPO_URL"

