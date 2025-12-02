#!/bin/bash

# Script zum Starten des Portals mit ngrok

echo "🚀 Starte Rotary Portal..."

# Prüfe ob ngrok installiert ist
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok ist nicht installiert!"
    echo ""
    echo "Installation:"
    echo "  brew install ngrok"
    echo ""
    echo "Oder download von: https://ngrok.com/download"
    exit 1
fi

# Starte Backend und Frontend
echo "📦 Starte Backend und Frontend..."
cd "$(dirname "$0")"
npm run dev > /tmp/rotary-portal.log 2>&1 &
PORTAL_PID=$!

# Warte bis Server läuft
echo "⏳ Warte auf Server..."
sleep 5

# Starte ngrok
echo "🌐 Starte ngrok Tunnel..."
ngrok http 3000 > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

sleep 3

# Hole ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | grep -o 'https://[^"]*' | head -1)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Konnte ngrok URL nicht finden"
    echo "Prüfen Sie: http://localhost:4040"
    kill $PORTAL_PID $NGROK_PID 2>/dev/null
    exit 1
fi

echo ""
echo "✅ Portal ist verfügbar unter:"
echo "   $NGROK_URL"
echo ""
echo "📋 Link zum Kopieren:"
echo "$NGROK_URL"
echo ""
echo "⚠️  Zum Beenden: Drücken Sie Ctrl+C"
echo ""

# Warte auf Ctrl+C
trap "kill $PORTAL_PID $NGROK_PID 2>/dev/null; echo 'Stoppe Server...'; exit" INT
wait

