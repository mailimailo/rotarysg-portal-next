# 💾 Datenbank-Backup - WICHTIG!

## Problem:
Die Datenbank wird bei jedem Deploy gelöscht, weil Railway-Container ephemeral sind.

## Sofort-Lösung: Volume einrichten

### In Railway:

1. **Backend Service** → **Settings**
2. **Volumes** → **Add Volume**
3. **Mount Path:** `/data`
4. **Name:** `rotary-database`
5. Speichern

### Environment Variable:

1. **Variables** → **New Variable**
2. **Key:** `DATABASE_PATH`
3. **Value:** `/data/rotary.db`
4. Speichern

### Redeploy:

1. **Deployments** → **Redeploy**
2. Warten Sie bis fertig

---

## Langfristige Lösung: PostgreSQL

Falls Volumes nicht funktionieren, sollten wir auf PostgreSQL umstellen:
- ✅ Automatische Backups
- ✅ Zuverlässiger
- ✅ Railway bietet kostenlose PostgreSQL-Datenbanken

---

## ⚠️ WICHTIG:

**Bis das Volume eingerichtet ist:**
- Alle Daten werden bei jedem Deploy gelöscht!
- Richten Sie das Volume SOFORT ein!

