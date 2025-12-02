# 📅 Calendly Vollautomatische Integration - Setup

## Schritt 1: Calendly API Token erstellen

1. Gehen Sie zu: https://calendly.com/integrations/api_webhooks
2. Klicken Sie auf "Create Token"
3. Geben Sie einen Namen ein (z.B. "Rotary Portal")
4. Kopieren Sie den generierten Token
5. **WICHTIG:** Speichern Sie den Token sicher - er wird nur einmal angezeigt!

## Schritt 2: Environment Variable setzen

### Lokal (für Entwicklung):

Erstellen Sie eine `.env` Datei im `server/` Ordner:

```bash
cd /Users/milostoessel/rotary-portal/server
echo "CALENDLY_API_TOKEN=ihr-token-hier" >> .env
echo "CALENDLY_WEBHOOK_SIGNING_KEY=ihr-signing-key-hier" >> .env
```

### Auf Railway/Vercel/etc:

Fügen Sie die Environment Variables hinzu:
- `CALENDLY_API_TOKEN` = Ihr Calendly API Token
- `CALENDLY_WEBHOOK_SIGNING_KEY` = (optional, für Webhook-Verifizierung)

## Schritt 3: Webhook konfigurieren

1. Gehen Sie zu: https://calendly.com/integrations/api_webhooks
2. Klicken Sie auf "Create Webhook Subscription"
3. **Webhook URL:** `https://ihre-domain.com/api/webhooks/calendly`
   - Für lokale Tests: Verwenden Sie ngrok: `ngrok http 3001`
   - Dann: `https://ihre-ngrok-url.ngrok.io/api/webhooks/calendly`
4. **Events auswählen:**
   - ✅ `invitee.created` (wenn Termin gebucht wird)
   - ✅ `invitee.canceled` (wenn Termin storniert wird)
5. Speichern Sie den Webhook Signing Key (falls angezeigt)

## Schritt 4: Event Type in Calendly erstellen

1. Gehen Sie zu Calendly → Event Types
2. Erstellen Sie einen neuen Event Type:
   - Name: "Rotary Lunch"
   - Dauer: 75 Minuten
   - Verfügbare Zeiten: Nach Bedarf
3. Notieren Sie sich die Event Type URI (wird in der Integration angezeigt)

## Schritt 5: Verwendung

1. Erstellen Sie eine Speaker-Anfrage im Portal
2. Klicken Sie auf "📅 Calendly (Automatisch)"
3. Wählen Sie Ihren Event Type aus
4. Klicken Sie auf "Calendly Link erstellen"
5. Kopieren Sie den Link und senden Sie ihn an den Speaker
6. **Automatisch:** Wenn der Speaker einen Termin bucht, wird er automatisch im System übernommen!

## ✅ Vorteile der automatischen Integration:

- ✅ Speaker bucht direkt in Calendly
- ✅ Termin wird automatisch im System übernommen
- ✅ Status wird automatisch auf "Zusage" gesetzt
- ✅ Lunch wird automatisch dem Speaker zugewiesen
- ✅ Keine manuelle Arbeit nötig!

## 🔧 Troubleshooting:

### "Calendly API Token nicht konfiguriert"
→ Setzen Sie die Environment Variable `CALENDLY_API_TOKEN`

### "Keine Event Types gefunden"
→ Erstellen Sie einen Event Type in Calendly

### Webhook funktioniert nicht
→ Prüfen Sie die Webhook-URL und ob der Server erreichbar ist
→ Für lokale Tests: Verwenden Sie ngrok

