#!/bin/bash

echo "🚀 GitHub Repository Setup für Rotary Portal"
echo ""

# Prüfe ob bereits authentifiziert
if gh auth status &>/dev/null; then
    echo "✅ Bereits bei GitHub authentifiziert"
else
    echo "📝 Bitte authentifizieren Sie sich bei GitHub:"
    echo "   Der Browser wird geöffnet..."
    gh auth login
fi

echo ""
echo "📦 Erstelle GitHub Repository..."

# Repository erstellen und pushen
cd /Users/milostoessel/rotary-portal

gh repo create rotary-portal-st-gallen --public --source=. --remote=origin --push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Repository erfolgreich erstellt!"
    echo ""
    gh repo view --web
    echo ""
    echo "🌐 Repository URL:"
    gh repo view --json url -q .url
else
    echo ""
    echo "⚠️  Repository existiert möglicherweise bereits oder es gab einen Fehler"
    echo "   Versuchen Sie es manuell:"
    echo "   1. Gehen Sie zu https://github.com/new"
    echo "   2. Erstellen Sie ein neues Repository namens 'rotary-portal-st-gallen'"
    echo "   3. Führen Sie dann aus:"
    echo "      git remote add origin https://github.com/IHR-USERNAME/rotary-portal-st-gallen.git"
    echo "      git push -u origin main"
fi

