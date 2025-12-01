const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'rotary-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

// Root Endpoint (muss vor anderen Routes sein)
app.get('/', (req, res) => {
  res.json({ 
    message: 'Rotary Portal Backend API',
    service: 'rotary-portal-backend',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      login: '/api/login',
      lunches: '/api/lunches',
      speakers: '/api/speakers',
      calendar: '/api/calendar',
      speakerRequests: '/api/speaker-requests'
    }
  });
});

// Datenbank initialisieren
const dbPath = path.join(__dirname, 'rotary.db');
const db = new sqlite3.Database(dbPath);

// Datenbank-Schema erstellen
db.serialize(() => {
  // Benutzer-Tabelle
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Speaker-Tabelle
  db.run(`CREATE TABLE IF NOT EXISTS speakers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    topic TEXT,
    bio TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Lunches-Tabelle
  db.run(`CREATE TABLE IF NOT EXISTS lunches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATETIME NOT NULL,
    location TEXT,
    title TEXT,
    description TEXT,
    status TEXT DEFAULT 'planned',
    speaker_id INTEGER,
    max_attendees INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (speaker_id) REFERENCES speakers(id)
  )`);

  // Einladungen-Tabelle
  db.run(`CREATE TABLE IF NOT EXISTS invitations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lunch_id INTEGER NOT NULL,
    speaker_id INTEGER,
    email TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    sent_at DATETIME,
    responded_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lunch_id) REFERENCES lunches(id),
    FOREIGN KEY (speaker_id) REFERENCES speakers(id)
  )`);

  // Speaker-Anfragen-Tabelle (für mehrere Termine pro Anfrage)
  db.run(`CREATE TABLE IF NOT EXISTS speaker_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    speaker_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',
    selected_lunch_id INTEGER,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    responded_at DATETIME,
    FOREIGN KEY (speaker_id) REFERENCES speakers(id),
    FOREIGN KEY (selected_lunch_id) REFERENCES lunches(id)
  )`);

  // Spalte responded_at hinzufügen falls sie nicht existiert (für bestehende Datenbanken)
  db.run(`ALTER TABLE speaker_requests ADD COLUMN responded_at DATETIME`, (err) => {
    // Ignoriere Fehler wenn Spalte bereits existiert
  });

  // Verknüpfungstabelle: Welche Lunches sind in einer Anfrage enthalten
  db.run(`CREATE TABLE IF NOT EXISTS speaker_request_lunches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL,
    lunch_id INTEGER NOT NULL,
    FOREIGN KEY (request_id) REFERENCES speaker_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (lunch_id) REFERENCES lunches(id),
    UNIQUE(request_id, lunch_id)
  )`);

  // Standard-Admin-Benutzer erstellen (Passwort: admin123)
  const defaultPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES 
    ('praesident', ?, 'admin'),
    ('programm', ?, 'admin')`, [defaultPassword, defaultPassword]);
});

// Middleware für JWT-Authentifizierung
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ========== AUTHENTIFIZIERUNG ==========
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Datenbankfehler' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  });
});

// ========== SPEAKER ENDPUNKTE ==========
app.get('/api/speakers', authenticateToken, (req, res) => {
  db.all('SELECT * FROM speakers ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.get('/api/speakers/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM speakers WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Speaker nicht gefunden' });
    }
    res.json(row);
  });
});

app.post('/api/speakers', authenticateToken, (req, res) => {
  const { name, email, phone, company, topic, bio } = req.body;

  db.run(
    'INSERT INTO speakers (name, email, phone, company, topic, bio) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, phone, company, topic, bio],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, name, email, phone, company, topic, bio });
    }
  );
});

app.put('/api/speakers/:id', authenticateToken, (req, res) => {
  const { name, email, phone, company, topic, bio, status } = req.body;

  db.run(
    'UPDATE speakers SET name = ?, email = ?, phone = ?, company = ?, topic = ?, bio = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, email, phone, company, topic, bio, status, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Wenn Status auf "confirmed" geändert wird und es eine offene Anfrage gibt, diese auch aktualisieren
      if (status === 'confirmed') {
        db.get(
          'SELECT id, selected_lunch_id FROM speaker_requests WHERE speaker_id = ? AND status = ?',
          [req.params.id, 'pending'],
          (err, request) => {
            if (!err && request) {
              // Wenn noch kein Lunch ausgewählt, den ersten verfügbaren nehmen
              if (!request.selected_lunch_id) {
                db.get(
                  `SELECT l.id FROM lunches l
                   JOIN speaker_request_lunches srl ON l.id = srl.lunch_id
                   WHERE srl.request_id = ?
                   ORDER BY l.date ASC
                   LIMIT 1`,
                  [request.id],
                  (err, lunch) => {
                    if (!err && lunch) {
                      db.run(
                        `UPDATE speaker_requests 
                         SET status = 'accepted', selected_lunch_id = ?, responded_at = CURRENT_TIMESTAMP
                         WHERE id = ?`,
                        [lunch.id, request.id]
                      );
                      db.run(
                        'UPDATE lunches SET status = ?, speaker_id = ? WHERE id = ?',
                        ['confirmed', req.params.id, lunch.id]
                      );
                    }
                  }
                );
              }
            }
          }
        );
      } else if (status === 'declined') {
        // Wenn auf "declined" gesetzt, alle offenen Anfragen für diesen Speaker ablehnen
        db.all(
          'SELECT id FROM speaker_requests WHERE speaker_id = ? AND status = ?',
          [req.params.id, 'pending'],
          (err, requests) => {
            if (!err && requests.length > 0) {
              requests.forEach(req => {
                db.run(
                  'UPDATE speaker_requests SET status = ?, responded_at = CURRENT_TIMESTAMP WHERE id = ?',
                  ['declined', req.id]
                );
              });
            }
          }
        );
      }

      res.json({ message: 'Speaker aktualisiert', changes: this.changes });
    }
  );
});

app.delete('/api/speakers/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM speakers WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Speaker gelöscht', changes: this.changes });
  });
});

// ========== LUNCHES ENDPUNKTE ==========
app.get('/api/lunches', authenticateToken, (req, res) => {
  const query = `
    SELECT l.*, s.name as speaker_name, s.email as speaker_email
    FROM lunches l
    LEFT JOIN speakers s ON l.speaker_id = s.id
    ORDER BY l.date ASC
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.get('/api/lunches/:id', authenticateToken, (req, res) => {
  const query = `
    SELECT l.*, s.name as speaker_name, s.email as speaker_email, s.phone as speaker_phone
    FROM lunches l
    LEFT JOIN speakers s ON l.speaker_id = s.id
    WHERE l.id = ?
  `;
  
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Lunch nicht gefunden' });
    }
    res.json(row);
  });
});

app.post('/api/lunches', authenticateToken, (req, res) => {
  const { date, location, title, description, speaker_id, max_attendees, status } = req.body;

  db.run(
    'INSERT INTO lunches (date, location, title, description, speaker_id, max_attendees, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [date, location, title, description, speaker_id || null, max_attendees, status || 'planned'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ 
        id: this.lastID, 
        date, location, title, description, speaker_id, max_attendees, status 
      });
    }
  );
});

app.put('/api/lunches/:id', authenticateToken, (req, res) => {
  const { date, location, title, description, speaker_id, max_attendees, status } = req.body;

  db.run(
    'UPDATE lunches SET date = ?, location = ?, title = ?, description = ?, speaker_id = ?, max_attendees = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [date, location, title, description, speaker_id || null, max_attendees, status, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Lunch aktualisiert', changes: this.changes });
    }
  );
});

app.delete('/api/lunches/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM lunches WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Lunch gelöscht', changes: this.changes });
  });
});

// ========== EINLADUNGEN ENDPUNKTE ==========
app.get('/api/invitations', authenticateToken, (req, res) => {
  const query = `
    SELECT i.*, l.date as lunch_date, l.title as lunch_title, s.name as speaker_name
    FROM invitations i
    LEFT JOIN lunches l ON i.lunch_id = l.id
    LEFT JOIN speakers s ON i.speaker_id = s.id
    ORDER BY l.date DESC
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/invitations', authenticateToken, (req, res) => {
  const { lunch_id, speaker_id, email } = req.body;

  db.run(
    'INSERT INTO invitations (lunch_id, speaker_id, email, sent_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
    [lunch_id, speaker_id, email],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ 
        id: this.lastID, 
        lunch_id, speaker_id, email, 
        status: 'pending',
        sent_at: new Date().toISOString()
      });
    }
  );
});

app.put('/api/invitations/:id', authenticateToken, (req, res) => {
  const { status } = req.body;

  db.run(
    'UPDATE invitations SET status = ?, responded_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Einladung aktualisiert', changes: this.changes });
    }
  );
});

// ========== KALENDER ENDPUNKTE ==========
app.get('/api/calendar', authenticateToken, (req, res) => {
  const { start, end } = req.query;
  
  let query = `
    SELECT l.id, l.date, l.title, l.location, l.status, s.name as speaker_name
    FROM lunches l
    LEFT JOIN speakers s ON l.speaker_id = s.id
  `;
  
  const params = [];
  if (start && end) {
    query += ' WHERE l.date >= ? AND l.date <= ?';
    params.push(start, end);
  }
  
  query += ' ORDER BY l.date ASC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// ========== SPEAKER-ANFRAGEN ENDPUNKTE ==========
const crypto = require('crypto');

// Mehrere Lunches für einen Speaker anfragen
app.post('/api/speaker-requests', authenticateToken, (req, res) => {
  const { speaker_id, lunch_ids, message } = req.body;

  if (!speaker_id || !lunch_ids || !Array.isArray(lunch_ids) || lunch_ids.length === 0) {
    return res.status(400).json({ error: 'Speaker-ID und mindestens ein Lunch-Termin erforderlich' });
  }

  // Token generieren
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 Tage gültig

  // Speaker-Status auf "angefragt" setzen
  db.run('UPDATE speakers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
    ['angefragt', speaker_id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Speaker-Anfrage erstellen
    db.run(
      `INSERT INTO speaker_requests (speaker_id, token, status, message, expires_at) 
       VALUES (?, ?, 'pending', ?, ?)`,
      [speaker_id, token, message || '', expiresAt.toISOString()],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        const requestId = this.lastID;

        // Lunches zur Anfrage hinzufügen
        const stmt = db.prepare('INSERT INTO speaker_request_lunches (request_id, lunch_id) VALUES (?, ?)');
        let inserted = 0;
        let errors = 0;

        lunch_ids.forEach((lunchId) => {
          stmt.run([requestId, lunchId], (err) => {
            if (err) {
              errors++;
            } else {
              inserted++;
            }

            // Lunches-Status auf "angefragt" setzen
            db.run('UPDATE lunches SET status = ? WHERE id = ?', ['angefragt', lunchId]);

            if (inserted + errors === lunch_ids.length) {
              stmt.finalize();
              if (errors > 0) {
                return res.status(500).json({ error: 'Fehler beim Hinzufügen einiger Termine' });
              }

              // Vollständige Anfrage mit Lunches zurückgeben
              db.get(
                `SELECT sr.*, s.name as speaker_name, s.email as speaker_email
                 FROM speaker_requests sr
                 JOIN speakers s ON sr.speaker_id = s.id
                 WHERE sr.id = ?`,
                [requestId],
                (err, request) => {
                  if (err) {
                    return res.status(500).json({ error: err.message });
                  }

                  db.all(
                    `SELECT l.* FROM lunches l
                     JOIN speaker_request_lunches srl ON l.id = srl.lunch_id
                     WHERE srl.request_id = ?`,
                    [requestId],
                    (err, lunches) => {
                      if (err) {
                        return res.status(500).json({ error: err.message });
                      }

                      res.json({
                        ...request,
                        lunches,
                        selection_url: `${req.protocol}://${req.get('host')}/speaker-select/${token}`
                      });
                    }
                  );
                }
              );
            }
          });
        });
      }
    );
  });
});

// Alle Anfragen abrufen
app.get('/api/speaker-requests', authenticateToken, (req, res) => {
  const query = `
    SELECT sr.*, s.name as speaker_name, s.email as speaker_email, s.phone as speaker_phone,
           l.id as selected_lunch_id, l.date as selected_lunch_date, l.title as selected_lunch_title
    FROM speaker_requests sr
    JOIN speakers s ON sr.speaker_id = s.id
    LEFT JOIN lunches l ON sr.selected_lunch_id = l.id
    ORDER BY sr.created_at DESC
  `;

  db.all(query, (err, requests) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Für jede Anfrage die verfügbaren Lunches laden
    const requestsWithLunches = requests.map((request, index) => {
      return new Promise((resolve) => {
        db.all(
          `SELECT l.* FROM lunches l
           JOIN speaker_request_lunches srl ON l.id = srl.lunch_id
           WHERE srl.request_id = ?
           ORDER BY l.date ASC`,
          [request.id],
          (err, lunches) => {
            if (err) {
              resolve({ ...request, available_lunches: [] });
            } else {
              resolve({ ...request, available_lunches: lunches });
            }
          }
        );
      });
    });

    Promise.all(requestsWithLunches).then((results) => {
      res.json(results);
    });
  });
});

// Öffentliche Route: Anfrage-Details per Token abrufen (für Speaker-Auswahlseite)
app.get('/api/public/speaker-request/:token', (req, res) => {
  const { token } = req.params;

  db.get(
    `SELECT sr.*, s.name as speaker_name, s.email as speaker_email, s.company as speaker_company
     FROM speaker_requests sr
     JOIN speakers s ON sr.speaker_id = s.id
     WHERE sr.token = ? AND sr.status = 'pending' AND sr.expires_at > datetime('now')`,
    [token],
    (err, request) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!request) {
        return res.status(404).json({ error: 'Anfrage nicht gefunden oder abgelaufen' });
      }

      // Verfügbare Lunches laden
      db.all(
        `SELECT l.* FROM lunches l
         JOIN speaker_request_lunches srl ON l.id = srl.lunch_id
         WHERE srl.request_id = ?
         ORDER BY l.date ASC`,
        [request.id],
        (err, lunches) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          res.json({
            ...request,
            available_lunches: lunches
          });
        }
      );
    }
  );
});

// Öffentliche Route: Speaker wählt einen Termin
app.post('/api/public/speaker-request/:token/select', (req, res) => {
  const { token } = req.params;
  const { lunch_id } = req.body;

  if (!lunch_id) {
    return res.status(400).json({ error: 'Lunch-ID erforderlich' });
  }

  // Prüfen ob Anfrage gültig ist
  db.get(
    `SELECT sr.* FROM speaker_requests sr
     WHERE sr.token = ? AND sr.status = 'pending' AND sr.expires_at > datetime('now')`,
    [token],
    (err, request) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!request) {
        return res.status(404).json({ error: 'Anfrage nicht gefunden oder abgelaufen' });
      }

      // Prüfen ob Lunch in der Anfrage enthalten ist
      db.get(
        `SELECT * FROM speaker_request_lunches 
         WHERE request_id = ? AND lunch_id = ?`,
        [request.id, lunch_id],
        (err, link) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          if (!link) {
            return res.status(400).json({ error: 'Dieser Termin ist nicht in der Anfrage enthalten' });
          }

          // Termin auswählen
          db.run(
            `UPDATE speaker_requests 
             SET selected_lunch_id = ?, status = 'accepted', responded_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [lunch_id, request.id],
            function(err) {
              if (err) {
                return res.status(500).json({ error: err.message });
              }

              // Speaker-Status auf "confirmed" setzen
              db.run(
                'UPDATE speakers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                ['confirmed', request.speaker_id]
              );

              // Lunch-Status auf "confirmed" setzen und Speaker zuweisen
              db.run(
                'UPDATE lunches SET status = ?, speaker_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                ['confirmed', request.speaker_id, lunch_id]
              );

              // Andere Lunches in dieser Anfrage auf "planned" zurücksetzen
              db.all(
                `SELECT lunch_id FROM speaker_request_lunches WHERE request_id = ? AND lunch_id != ?`,
                [request.id, lunch_id],
                (err, otherLunches) => {
                  if (!err && otherLunches.length > 0) {
                    const otherIds = otherLunches.map(l => l.lunch_id);
                    const placeholders = otherIds.map(() => '?').join(',');
                    db.run(
                      `UPDATE lunches SET status = 'planned', speaker_id = NULL WHERE id IN (${placeholders})`,
                      otherIds
                    );
                  }
                }
              );

              res.json({ 
                message: 'Termin erfolgreich ausgewählt',
                selected_lunch_id: lunch_id
              });
            }
          );
        }
      );
    }
  );
});

// Manueller Status-Update für Speaker-Anfrage
app.put('/api/speaker-requests/:id', authenticateToken, (req, res) => {
  const { status, selected_lunch_id } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status erforderlich' });
  }

  if (status === 'accepted' && !selected_lunch_id) {
    return res.status(400).json({ error: 'Bei Zusage muss ein Termin ausgewählt werden' });
  }

  db.get('SELECT * FROM speaker_requests WHERE id = ?', [req.params.id], (err, request) => {
    if (err) {
      console.error('Fehler beim Laden der Anfrage:', err);
      return res.status(500).json({ error: err.message });
    }

    if (!request) {
      return res.status(404).json({ error: 'Anfrage nicht gefunden' });
    }

    // Wenn accepted, prüfen ob Lunch in der Anfrage enthalten ist
    if (status === 'accepted' && selected_lunch_id) {
      db.get(
        `SELECT * FROM speaker_request_lunches 
         WHERE request_id = ? AND lunch_id = ?`,
        [req.params.id, selected_lunch_id],
        (err, link) => {
          if (err) {
            console.error('Fehler beim Prüfen des Lunches:', err);
            return res.status(500).json({ error: err.message });
          }

          if (!link) {
            return res.status(400).json({ error: 'Dieser Termin ist nicht in der Anfrage enthalten' });
          }

          // Update durchführen
          performUpdate();
        }
      );
    } else {
      performUpdate();
    }

    function performUpdate() {
      db.run(
        `UPDATE speaker_requests 
         SET status = ?, selected_lunch_id = ?, responded_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [status, selected_lunch_id || null, req.params.id],
        function(err) {
          if (err) {
            console.error('Fehler beim Update der Anfrage:', err);
            return res.status(500).json({ error: err.message });
          }

          // Wenn auf "accepted" gesetzt, Lunch und Speaker aktualisieren
          if (status === 'accepted' && selected_lunch_id) {
            db.run(
              'UPDATE lunches SET status = ?, speaker_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
              ['confirmed', request.speaker_id, selected_lunch_id],
              (err) => {
                if (err) {
                  console.error('Fehler beim Update des Lunches:', err);
                }
              }
            );
            
            db.run(
              'UPDATE speakers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
              ['confirmed', request.speaker_id],
              (err) => {
                if (err) {
                  console.error('Fehler beim Update des Speakers:', err);
                }
              }
            );

            // Andere Lunches in dieser Anfrage zurücksetzen
            db.all(
              `SELECT lunch_id FROM speaker_request_lunches WHERE request_id = ? AND lunch_id != ?`,
              [req.params.id, selected_lunch_id],
              (err, otherLunches) => {
                if (err) {
                  console.error('Fehler beim Laden anderer Lunches:', err);
                } else if (otherLunches.length > 0) {
                  const otherIds = otherLunches.map(l => l.lunch_id);
                  const placeholders = otherIds.map(() => '?').join(',');
                  db.run(
                    `UPDATE lunches SET status = 'planned', speaker_id = NULL WHERE id IN (${placeholders})`,
                    otherIds,
                    (err) => {
                      if (err) {
                        console.error('Fehler beim Zurücksetzen anderer Lunches:', err);
                      }
                    }
                  );
                }
              }
            );
          } else if (status === 'declined') {
            // Bei Absage: Speaker-Status auf "declined" setzen
            db.run(
              'UPDATE speakers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
              ['declined', request.speaker_id],
              (err) => {
                if (err) {
                  console.error('Fehler beim Update des Speakers:', err);
                }
              }
            );

            // Alle Lunches in dieser Anfrage zurücksetzen
            db.all(
              `SELECT lunch_id FROM speaker_request_lunches WHERE request_id = ?`,
              [req.params.id],
              (err, lunches) => {
                if (err) {
                  console.error('Fehler beim Laden der Lunches:', err);
                } else if (lunches.length > 0) {
                  const lunchIds = lunches.map(l => l.lunch_id);
                  const placeholders = lunchIds.map(() => '?').join(',');
                  db.run(
                    `UPDATE lunches SET status = 'planned', speaker_id = NULL WHERE id IN (${placeholders})`,
                    lunchIds,
                    (err) => {
                      if (err) {
                        console.error('Fehler beim Zurücksetzen der Lunches:', err);
                      }
                    }
                  );
                }
              }
            );
          }

          res.json({ message: 'Anfrage aktualisiert', changes: this.changes });
        }
      );
    }
  });
});

// Öffentliche Route: Speaker lehnt alle Termine ab
app.post('/api/public/speaker-request/:token/decline', (req, res) => {
  const { token } = req.params;

  db.get(
    `SELECT sr.* FROM speaker_requests sr
     WHERE sr.token = ? AND sr.status = 'pending' AND sr.expires_at > datetime('now')`,
    [token],
    (err, request) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!request) {
        return res.status(404).json({ error: 'Anfrage nicht gefunden oder abgelaufen' });
      }

      // Status auf "declined" setzen
      db.run(
        `UPDATE speaker_requests 
         SET status = 'declined', responded_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [request.id],
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // Speaker-Status auf "declined" setzen
          db.run(
            'UPDATE speakers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            ['declined', request.speaker_id]
          );

          // Alle Lunches in dieser Anfrage auf "planned" zurücksetzen
          db.all(
            `SELECT lunch_id FROM speaker_request_lunches WHERE request_id = ?`,
            [request.id],
            (err, lunches) => {
              if (!err && lunches.length > 0) {
                const lunchIds = lunches.map(l => l.lunch_id);
                const placeholders = lunchIds.map(() => '?').join(',');
                db.run(
                  `UPDATE lunches SET status = 'planned', speaker_id = NULL WHERE id IN (${placeholders})`,
                  lunchIds
                );
              }
            }
          );

          res.json({ message: 'Anfrage abgelehnt' });
        }
      );
    }
  );
});

// Health Check Endpoint (für Render.com)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'rotary-portal-backend' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
  console.log(`📅 Rotary Portal Backend bereit`);
});

