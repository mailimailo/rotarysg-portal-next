# 🚀 EINFACHSTE LÖSUNG - Alles lokal mit ngrok

## Warum das am einfachsten ist:
- ✅ Keine komplizierten Deployments
- ✅ Funktioniert sofort
- ✅ Vera kann von überall zugreifen
- ✅ 5 Minuten Setup

## Schritt 1: Portal lokal starten

```bash
cd /Users/milostoessel/rotary-portal
npm run dev
```

Das startet:
- Backend auf http://localhost:3001
- Frontend auf http://localhost:3000

## Schritt 2: ngrok installieren (falls noch nicht)

```bash
brew install ngrok
```

## Schritt 3: ngrok Account (kostenlos)

1. Gehen Sie zu: https://dashboard.ngrok.com/signup
2. Erstellen Sie Account
3. Kopieren Sie den Authtoken

## Schritt 4: ngrok konfigurieren

```bash
ngrok config add-authtoken IHR_TOKEN
```

## Schritt 5: ngrok Tunnel starten

In einem **neuen Terminal**:

```bash
ngrok http 3000
```

ngrok zeigt Ihnen einen Link wie:
```
https://abc123.ngrok.io
```

## Schritt 6: Link an Vera senden!

**Fertig!** ✅

Vera kann jetzt über diesen Link auf das Portal zugreifen!

---

## ⚠️ Wichtig:

- Der Link ändert sich bei jedem Neustart (kostenlose Version)
- Für dauerhaften Link: ngrok Pro Account (kostet etwas)
- Oder: Link nach jedem Neustart neu senden

---

## Vorteile:

- ✅ Funktioniert sofort
- ✅ Keine komplizierten Deployments
- ✅ Alles lokal - volle Kontrolle
- ✅ Einfach zu testen

---

## Für dauerhaften Link:

Falls Sie einen dauerhaften Link brauchen:
- ngrok Pro Account (ca. $8/Monat)
- Oder: Wir finden eine einfachere Hosting-Lösung

Aber für den Anfang ist ngrok perfekt!

