# 🔴 KRITISCH: Datenbank-Persistenz auf Railway

## Problem:
Die SQLite-Datenbank wird bei jedem Deploy gelöscht, weil Railway-Container ephemeral sind!

## Lösung: Railway Volume für persistente Speicherung

### Schritt 1: Volume in Railway erstellen

1. Gehen Sie zu Railway Dashboard
2. Öffnen Sie Ihren **Backend Service**
3. Klicken Sie auf **"Settings"**
4. Scrollen Sie zu **"Volumes"** (oder suchen Sie danach)
5. Klicken Sie auf **"Add Volume"**
6. **Mount Path:** `/data`
7. **Name:** `rotary-database` (oder ähnlich)
8. Speichern

### Schritt 2: Environment Variable setzen

1. **Variables** → **New Variable**
2. **Key:** `DATABASE_PATH`
3. **Value:** `/data/rotary.db`
4. Speichern

### Schritt 3: Code anpassen (ich mache das jetzt)

Ich passe den Code an, damit die Datenbank im Volume gespeichert wird.

### Schritt 4: Redeploy

1. **Deployments** → **Redeploy**
2. Warten Sie bis fertig

---

## Alternative: Railway Postgres (Empfohlen für Produktion)

Falls Volumes nicht verfügbar sind, können wir auf PostgreSQL umstellen:
- ✅ Railway bietet kostenlose PostgreSQL-Datenbanken
- ✅ Automatische Backups
- ✅ Viel zuverlässiger als SQLite

---

## WICHTIG:

**Bis zur Lösung:**
- ❌ Keine Daten ändern (werden sonst gelöscht!)
- ✅ Volume einrichten
- ✅ Dann können Sie wieder normal arbeiten

Ich passe den Code jetzt an!

