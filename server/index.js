const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { db, dbType, dbGet, dbAll, dbRun } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'rotary-secret-key-change-in-production';

// CORS für Production (alle Origins erlauben)
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? true : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
// Webhook-Endpunkt benötigt raw body für Signature-Verifizierung
app.use('/api/webhooks/calendly', express.raw({ type: 'application/json' }));

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

// Datenbank-Schema erstellen
async function initDatabase() {
  console.log('🔧 Initialisiere Datenbank... dbType:', dbType);
  
  if (dbType === 'postgres') {
    try {
      console.log('📝 Erstelle PostgreSQL Tabellen...');
      
      // PostgreSQL Schema
      await db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user',
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('✅ Tabelle users erstellt');
      
      await db.query(`
        CREATE TABLE IF NOT EXISTS speakers (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          company TEXT,
          topic TEXT,
          bio TEXT,
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('✅ Tabelle speakers erstellt');
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS lunches (
        id SERIAL PRIMARY KEY,
        date TIMESTAMP NOT NULL,
        location TEXT,
        title TEXT,
        description TEXT,
        status TEXT DEFAULT 'planned',
        speaker_id INTEGER,
        max_attendees INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (speaker_id) REFERENCES speakers(id)
      )
    `);
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS invitations (
        id SERIAL PRIMARY KEY,
        lunch_id INTEGER NOT NULL,
        speaker_id INTEGER,
        email TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        sent_at TIMESTAMP,
        responded_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (lunch_id) REFERENCES lunches(id),
        FOREIGN KEY (speaker_id) REFERENCES speakers(id)
      )
    `);
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS speaker_requests (
        id SERIAL PRIMARY KEY,
        speaker_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'pending',
        selected_lunch_id INTEGER,
        message TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP,
        responded_at TIMESTAMP,
        FOREIGN KEY (speaker_id) REFERENCES speakers(id),
        FOREIGN KEY (selected_lunch_id) REFERENCES lunches(id)
      )
    `);
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS speaker_request_lunches (
        id SERIAL PRIMARY KEY,
        request_id INTEGER NOT NULL,
        lunch_id INTEGER NOT NULL,
        FOREIGN KEY (request_id) REFERENCES speaker_requests(id) ON DELETE CASCADE,
        FOREIGN KEY (lunch_id) REFERENCES lunches(id),
        UNIQUE(request_id, lunch_id)
      )
    `);
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS calendly_integrations (
        id SERIAL PRIMARY KEY,
        speaker_request_id INTEGER NOT NULL UNIQUE,
        calendly_event_uri TEXT,
        calendly_invitee_uri TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (speaker_request_id) REFERENCES speaker_requests(id)
      )
    `);
    
      // Standard-Admin-Benutzer erstellen
      const defaultPassword = bcrypt.hashSync('admin123', 10);
      try {
        await db.query(`
          INSERT INTO users (username, password, role) 
          VALUES ($1, $2, 'admin'), ($3, $4, 'admin')
          ON CONFLICT (username) DO NOTHING
        `, ['praesident', defaultPassword, 'programm', defaultPassword]);
        console.log('✅ Admin-Benutzer erstellt');
      } catch (userErr) {
        console.error('⚠️ Fehler beim Erstellen der Admin-Benutzer:', userErr.message);
      }
      
      console.log('✅ PostgreSQL Schema vollständig erstellt');
    } catch (err) {
      console.error('❌ Fehler beim Erstellen der PostgreSQL Tabellen:', err);
      console.error('Error Code:', err.code);
      console.error('Error Detail:', err.detail);
      console.error('Error Message:', err.message);
      throw err; // Fehler weiterwerfen, damit wir es sehen
  } else {
    // SQLite Schema (lokal)
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

  // Calendly Integration Tabelle
  db.run(`CREATE TABLE IF NOT EXISTS calendly_integrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    speaker_request_id INTEGER NOT NULL,
    calendly_event_uri TEXT,
    calendly_invitee_uri TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (speaker_request_id) REFERENCES speaker_requests(id)
  )`);

      // Standard-Admin-Benutzer erstellen (Passwort: admin123)
      const defaultPassword = bcrypt.hashSync('admin123', 10);
      db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES 
        ('praesident', ?, 'admin'),
        ('programm', ?, 'admin')`, [defaultPassword, defaultPassword]);
    });
  }
}

// Datenbank initialisieren
let dbInitialized = false;
initDatabase()
  .then(() => {
    dbInitialized = true;
    console.log('✅ Datenbank erfolgreich initialisiert');
  })
  .catch(err => {
    console.error('❌ Fehler beim Initialisieren der Datenbank:', err);
    console.error('Stack:', err.stack);
    // Server trotzdem starten, damit Health Check funktioniert
    dbInitialized = false;
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

  try {
    const user = await dbGet('SELECT * FROM users WHERE username = ?', [username]);

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
  } catch (err) {
    console.error('Login Fehler:', err);
    return res.status(500).json({ 
      error: 'Datenbankfehler',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// ========== SPEAKER ENDPUNKTE ==========
app.get('/api/speakers', authenticateToken, async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM speakers ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/speakers/:id', authenticateToken, async (req, res) => {
  try {
    const row = await dbGet('SELECT * FROM speakers WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.status(404).json({ error: 'Speaker nicht gefunden' });
    }
    res.json(row);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/speakers', authenticateToken, async (req, res) => {
  const { name, email, phone, company, topic, bio } = req.body;
  
  console.log('🔵 Speaker erstellen - dbType:', dbType);
  console.log('🔵 dbInitialized:', dbInitialized);
  console.log('🔵 Daten:', { name, email, phone, company, topic, bio });
  
  // Prüfe ob Datenbank initialisiert ist
  if (!dbInitialized && dbType === 'postgres') {
    console.log('⚠️ Datenbank noch nicht initialisiert, versuche erneut...');
    try {
      await initDatabase();
      dbInitialized = true;
    } catch (initErr) {
      console.error('❌ Fehler bei erneuter Initialisierung:', initErr);
      return res.status(500).json({ 
        error: 'Datenbank nicht initialisiert',
        details: initErr.message
      });
    }
  }
  
  try {
    if (dbType === 'postgres') {
      // Für PostgreSQL: Direkt mit RETURNING
      const pgQuery = 'INSERT INTO speakers (name, email, phone, company, topic, bio) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id';
      console.log('🔵 PostgreSQL Query:', pgQuery);
      console.log('🔵 Params:', [name, email, phone, company, topic, bio]);
      
      const result = await db.query(pgQuery, [name, email, phone, company, topic, bio]);
      console.log('🔵 Query Result:', result);
      console.log('🔵 Rows:', result.rows);
      
      const id = result.rows[0]?.id;
      console.log('🔵 Extracted ID:', id);
      
      if (!id) {
        console.error('❌ Keine ID zurückgegeben:', result);
        return res.status(500).json({ 
          error: 'Fehler beim Erstellen des Speakers: Keine ID zurückgegeben',
          debug: {
            result: result,
            rows: result.rows,
            rowCount: result.rowCount
          }
        });
      }
      
      console.log('✅ Speaker erfolgreich erstellt mit ID:', id);
      res.json({ id, name, email, phone, company, topic, bio });
    } else {
      // Für SQLite: Verwende dbRun
      const insertQuery = 'INSERT INTO speakers (name, email, phone, company, topic, bio) VALUES (?, ?, ?, ?, ?, ?)';
      const result = await dbRun(insertQuery, [name, email, phone, company, topic, bio]);
      const id = result.lastID;
      
      if (!id) {
        console.error('❌ Keine ID zurückgegeben:', result);
        return res.status(500).json({ error: 'Fehler beim Erstellen des Speakers: Keine ID zurückgegeben' });
      }
      
      res.json({ id, name, email, phone, company, topic, bio });
    }
  } catch (err) {
    console.error('❌ Fehler beim Erstellen des Speakers:', err);
    console.error('❌ Error Name:', err.name);
    console.error('❌ Error Message:', err.message);
    console.error('❌ Error Code:', err.code);
    console.error('❌ Error Detail:', err.detail);
    console.error('❌ Stack:', err.stack);
    
    return res.status(500).json({ 
      error: 'Fehler beim Speichern des Speakers',
      details: err.message,
      code: err.code,
      hint: err.hint
    });
  }
});

app.put('/api/speakers/:id', authenticateToken, async (req, res) => {
  const { name, email, phone, company, topic, bio, status } = req.body;
  try {
    const updateQuery = dbType === 'postgres' 
      ? 'UPDATE speakers SET name = $1, email = $2, phone = $3, company = $4, topic = $5, bio = $6, status = $7, updated_at = NOW() WHERE id = $8'
      : 'UPDATE speakers SET name = ?, email = ?, phone = ?, company = ?, topic = ?, bio = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    
    const result = await dbRun(updateQuery, [name, email, phone, company, topic, bio, status, req.params.id]);

    // Wenn Status auf "confirmed" geändert wird und es eine offene Anfrage gibt, diese auch aktualisieren
    if (status === 'confirmed') {
      const request = await dbGet(
        'SELECT id, selected_lunch_id FROM speaker_requests WHERE speaker_id = ? AND status = ?',
        [req.params.id, 'pending']
      );
      
      if (request && !request.selected_lunch_id) {
        const lunch = await dbGet(
          `SELECT l.id FROM lunches l
           JOIN speaker_request_lunches srl ON l.id = srl.lunch_id
           WHERE srl.request_id = ?
           ORDER BY l.date ASC
           LIMIT 1`,
          [request.id]
        );
        
        if (lunch) {
          const timestampQuery = dbType === 'postgres' ? 'NOW()' : 'CURRENT_TIMESTAMP';
          await dbRun(
            `UPDATE speaker_requests SET status = 'accepted', selected_lunch_id = ?, responded_at = ${timestampQuery} WHERE id = ?`,
            [lunch.id, request.id]
          );
          await dbRun(
            'UPDATE lunches SET status = ?, speaker_id = ? WHERE id = ?',
            ['confirmed', req.params.id, lunch.id]
          );
        }
      }
    } else if (status === 'declined') {
      // Wenn auf "declined" gesetzt, alle offenen Anfragen für diesen Speaker ablehnen
      const requests = await dbAll(
        'SELECT id FROM speaker_requests WHERE speaker_id = ? AND status = ?',
        [req.params.id, 'pending']
      );
      
      if (requests.length > 0) {
        const timestampQuery = dbType === 'postgres' ? 'NOW()' : 'CURRENT_TIMESTAMP';
        for (const reqItem of requests) {
          await dbRun(
            `UPDATE speaker_requests SET status = ?, responded_at = ${timestampQuery} WHERE id = ?`,
            ['declined', reqItem.id]
          );
        }
      }
    }

    res.json({ message: 'Speaker aktualisiert', changes: result.changes });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/speakers/:id', authenticateToken, async (req, res) => {
  try {
    const result = await dbRun('DELETE FROM speakers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Speaker gelöscht', changes: result.changes });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ========== LUNCHES ENDPUNKTE ==========
app.get('/api/lunches', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT l.*, s.name as speaker_name, s.email as speaker_email
      FROM lunches l
      LEFT JOIN speakers s ON l.speaker_id = s.id
      ORDER BY l.date ASC
    `;
    const rows = await dbAll(query);
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/lunches/:id', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT l.*, s.name as speaker_name, s.email as speaker_email, s.phone as speaker_phone
      FROM lunches l
      LEFT JOIN speakers s ON l.speaker_id = s.id
      WHERE l.id = ?
    `;
    const row = await dbGet(query, [req.params.id]);
    if (!row) {
      return res.status(404).json({ error: 'Lunch nicht gefunden' });
    }
    res.json(row);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/lunches', authenticateToken, async (req, res) => {
  const { date, location, title, description, speaker_id, max_attendees, status } = req.body;
  try {
    const insertQuery = dbType === 'postgres'
      ? 'INSERT INTO lunches (date, location, title, description, speaker_id, max_attendees, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id'
      : 'INSERT INTO lunches (date, location, title, description, speaker_id, max_attendees, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
    const result = await dbRun(insertQuery, [date, location, title, description, speaker_id || null, max_attendees, status || 'planned']);
    const id = result.lastID || result.rows?.[0]?.id;
    res.json({ 
      id, 
      date, location, title, description, speaker_id, max_attendees, status 
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/lunches/:id', authenticateToken, async (req, res) => {
  const { date, location, title, description, speaker_id, max_attendees, status } = req.body;
  try {
    const timestampQuery = dbType === 'postgres' ? 'NOW()' : 'CURRENT_TIMESTAMP';
    const updateQuery = dbType === 'postgres'
      ? `UPDATE lunches SET date = $1, location = $2, title = $3, description = $4, speaker_id = $5, max_attendees = $6, status = $7, updated_at = NOW() WHERE id = $8`
      : `UPDATE lunches SET date = ?, location = ?, title = ?, description = ?, speaker_id = ?, max_attendees = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    const result = await dbRun(updateQuery, [date, location, title, description, speaker_id || null, max_attendees, status, req.params.id]);
    res.json({ message: 'Lunch aktualisiert', changes: result.changes });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/lunches/:id', authenticateToken, async (req, res) => {
  try {
    const result = await dbRun('DELETE FROM lunches WHERE id = ?', [req.params.id]);
    res.json({ message: 'Lunch gelöscht', changes: result.changes });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ========== EINLADUNGEN ENDPUNKTE ==========
app.get('/api/invitations', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT i.*, l.date as lunch_date, l.title as lunch_title, s.name as speaker_name
      FROM invitations i
      LEFT JOIN lunches l ON i.lunch_id = l.id
      LEFT JOIN speakers s ON i.speaker_id = s.id
      ORDER BY l.date DESC
    `;
    const rows = await dbAll(query);
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/invitations', authenticateToken, async (req, res) => {
  const { lunch_id, speaker_id, email } = req.body;
  try {
    const timestampQuery = dbType === 'postgres' ? 'NOW()' : 'CURRENT_TIMESTAMP';
    const insertQuery = dbType === 'postgres'
      ? `INSERT INTO invitations (lunch_id, speaker_id, email, sent_at) VALUES ($1, $2, $3, NOW()) RETURNING id`
      : `INSERT INTO invitations (lunch_id, speaker_id, email, sent_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`;
    
    const result = await dbRun(insertQuery, [lunch_id, speaker_id, email]);
    const id = result.lastID || result.rows?.[0]?.id;
    res.json({ 
      id, 
      lunch_id, speaker_id, email, 
      status: 'pending',
      sent_at: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/invitations/:id', authenticateToken, async (req, res) => {
  const { status } = req.body;
  try {
    const timestampQuery = dbType === 'postgres' ? 'NOW()' : 'CURRENT_TIMESTAMP';
    const updateQuery = dbType === 'postgres'
      ? `UPDATE invitations SET status = $1, responded_at = NOW() WHERE id = $2`
      : `UPDATE invitations SET status = ?, responded_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    const result = await dbRun(updateQuery, [status, req.params.id]);
    res.json({ message: 'Einladung aktualisiert', changes: result.changes });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ========== KALENDER ENDPUNKTE ==========
app.get('/api/calendar', authenticateToken, async (req, res) => {
  try {
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
    
    const rows = await dbAll(query, params);
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ========== SPEAKER-ANFRAGEN ENDPUNKTE ==========
const crypto = require('crypto');

// Mehrere Lunches für einen Speaker anfragen
app.post('/api/speaker-requests', authenticateToken, async (req, res) => {
  const { speaker_id, lunch_ids, message } = req.body;

  if (!speaker_id || !lunch_ids || !Array.isArray(lunch_ids) || lunch_ids.length === 0) {
    return res.status(400).json({ error: 'Speaker-ID und mindestens ein Lunch-Termin erforderlich' });
  }

  try {
    // Token generieren
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 Tage gültig

    // Speaker-Status auf "angefragt" setzen
    const timestampQuery = dbType === 'postgres' ? 'NOW()' : 'CURRENT_TIMESTAMP';
    await dbRun(
      `UPDATE speakers SET status = ?, updated_at = ${timestampQuery} WHERE id = ?`,
      ['angefragt', speaker_id]
    );

    // Speaker-Anfrage erstellen
    const insertQuery = dbType === 'postgres'
      ? `INSERT INTO speaker_requests (speaker_id, token, status, message, expires_at) VALUES ($1, $2, 'pending', $3, $4) RETURNING id`
      : `INSERT INTO speaker_requests (speaker_id, token, status, message, expires_at) VALUES (?, ?, 'pending', ?, ?)`;
    
    const insertResult = await dbRun(insertQuery, [speaker_id, token, message || '', expiresAt.toISOString()]);
    const requestId = insertResult.lastID || insertResult.rows?.[0]?.id;

    // Lunches zur Anfrage hinzufügen
    for (const lunchId of lunch_ids) {
      await dbRun(
        'INSERT INTO speaker_request_lunches (request_id, lunch_id) VALUES (?, ?)',
        [requestId, lunchId]
      );
      // Lunches-Status auf "angefragt" setzen
      await dbRun('UPDATE lunches SET status = ? WHERE id = ?', ['angefragt', lunchId]);
    }

    // Vollständige Anfrage mit Lunches zurückgeben
    const request = await dbGet(
      `SELECT sr.*, s.name as speaker_name, s.email as speaker_email
       FROM speaker_requests sr
       JOIN speakers s ON sr.speaker_id = s.id
       WHERE sr.id = ?`,
      [requestId]
    );

    const lunches = await dbAll(
      `SELECT l.* FROM lunches l
       JOIN speaker_request_lunches srl ON l.id = srl.lunch_id
       WHERE srl.request_id = ?`,
      [requestId]
    );

    res.json({
      ...request,
      lunches,
      selection_url: `${req.protocol}://${req.get('host')}/speaker-select/${token}`
    });
  } catch (err) {
    console.error('Fehler beim Erstellen der Speaker-Anfrage:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Alle Anfragen abrufen
app.get('/api/speaker-requests', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT sr.*, s.name as speaker_name, s.email as speaker_email, s.phone as speaker_phone,
             l.id as selected_lunch_id, l.date as selected_lunch_date, l.title as selected_lunch_title
      FROM speaker_requests sr
      JOIN speakers s ON sr.speaker_id = s.id
      LEFT JOIN lunches l ON sr.selected_lunch_id = l.id
      ORDER BY sr.created_at DESC
    `;

    const requests = await dbAll(query);

    // Für jede Anfrage die verfügbaren Lunches laden
    const requestsWithLunches = await Promise.all(
      requests.map(async (request) => {
        try {
          const lunches = await dbAll(
            `SELECT l.* FROM lunches l
             JOIN speaker_request_lunches srl ON l.id = srl.lunch_id
             WHERE srl.request_id = ?
             ORDER BY l.date ASC`,
            [request.id]
          );
          return { ...request, available_lunches: lunches };
        } catch (err) {
          return { ...request, available_lunches: [] };
        }
      })
    );

    res.json(requestsWithLunches);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Öffentliche Route: Anfrage-Details per Token abrufen (für Speaker-Auswahlseite)
app.get('/api/public/speaker-request/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const dateCheck = dbType === 'postgres' 
      ? `sr.expires_at > NOW()`
      : `sr.expires_at > datetime('now')`;
    
    const request = await dbGet(
      `SELECT sr.*, s.name as speaker_name, s.email as speaker_email, s.company as speaker_company
       FROM speaker_requests sr
       JOIN speakers s ON sr.speaker_id = s.id
       WHERE sr.token = ? AND sr.status = 'pending' AND ${dateCheck}`,
      [token]
    );

    if (!request) {
      return res.status(404).json({ error: 'Anfrage nicht gefunden oder abgelaufen' });
    }

    // Verfügbare Lunches laden
    const lunches = await dbAll(
      `SELECT l.* FROM lunches l
       JOIN speaker_request_lunches srl ON l.id = srl.lunch_id
       WHERE srl.request_id = ?
       ORDER BY l.date ASC`,
      [request.id]
    );

    res.json({
      ...request,
      available_lunches: lunches
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Öffentliche Route: Speaker wählt einen Termin
app.post('/api/public/speaker-request/:token/select', async (req, res) => {
  const { token } = req.params;
  const { lunch_id } = req.body;

  if (!lunch_id) {
    return res.status(400).json({ error: 'Lunch-ID erforderlich' });
  }

  try {
    // Prüfen ob Anfrage gültig ist
    const dateCheck = dbType === 'postgres' 
      ? `sr.expires_at > NOW()`
      : `sr.expires_at > datetime('now')`;
    
    const request = await dbGet(
      `SELECT sr.* FROM speaker_requests sr
       WHERE sr.token = ? AND sr.status = 'pending' AND ${dateCheck}`,
      [token]
    );

    if (!request) {
      return res.status(404).json({ error: 'Anfrage nicht gefunden oder abgelaufen' });
    }

    // Prüfen ob Lunch in der Anfrage enthalten ist
    const link = await dbGet(
      `SELECT * FROM speaker_request_lunches 
       WHERE request_id = ? AND lunch_id = ?`,
      [request.id, lunch_id]
    );

    if (!link) {
      return res.status(400).json({ error: 'Dieser Termin ist nicht in der Anfrage enthalten' });
    }

    // Termin auswählen
    const timestampQuery = dbType === 'postgres' ? 'NOW()' : 'CURRENT_TIMESTAMP';
    await dbRun(
      `UPDATE speaker_requests 
       SET selected_lunch_id = ?, status = 'accepted', responded_at = ${timestampQuery}
       WHERE id = ?`,
      [lunch_id, request.id]
    );

    // Speaker-Status auf "confirmed" setzen
    const speakerTimestamp = dbType === 'postgres' ? 'NOW()' : 'CURRENT_TIMESTAMP';
    await dbRun(
      `UPDATE speakers SET status = ?, updated_at = ${speakerTimestamp} WHERE id = ?`,
      ['confirmed', request.speaker_id]
    );

    // Lunch-Status auf "confirmed" setzen und Speaker zuweisen
    await dbRun(
      `UPDATE lunches SET status = ?, speaker_id = ?, updated_at = ${speakerTimestamp} WHERE id = ?`,
      ['confirmed', request.speaker_id, lunch_id]
    );

    // Andere Lunches in dieser Anfrage auf "planned" zurücksetzen
    const otherLunches = await dbAll(
      `SELECT lunch_id FROM speaker_request_lunches WHERE request_id = ? AND lunch_id != ?`,
      [request.id, lunch_id]
    );

    if (otherLunches.length > 0) {
      const otherIds = otherLunches.map(l => l.lunch_id);
      const placeholders = otherIds.map(() => '?').join(',');
      await dbRun(
        `UPDATE lunches SET status = 'planned', speaker_id = NULL WHERE id IN (${placeholders})`,
        otherIds
      );
    }

    res.json({ 
      message: 'Termin erfolgreich ausgewählt',
      selected_lunch_id: lunch_id
    });
  } catch (err) {
    console.error('Fehler beim Auswählen des Termins:', err);
    return res.status(500).json({ error: err.message });
  }
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
app.post('/api/public/speaker-request/:token/decline', async (req, res) => {
  const { token } = req.params;

  try {
    const dateCheck = dbType === 'postgres' 
      ? `sr.expires_at > NOW()`
      : `sr.expires_at > datetime('now')`;
    
    const request = await dbGet(
      `SELECT sr.* FROM speaker_requests sr
       WHERE sr.token = ? AND sr.status = 'pending' AND ${dateCheck}`,
      [token]
    );

    if (!request) {
      return res.status(404).json({ error: 'Anfrage nicht gefunden oder abgelaufen' });
    }

    // Status auf "declined" setzen
    const timestampQuery = dbType === 'postgres' ? 'NOW()' : 'CURRENT_TIMESTAMP';
    await dbRun(
      `UPDATE speaker_requests 
       SET status = 'declined', responded_at = ${timestampQuery}
       WHERE id = ?`,
      [request.id]
    );

    // Speaker-Status auf "declined" setzen
    const updateTimestamp = dbType === 'postgres' ? 'NOW()' : 'CURRENT_TIMESTAMP';
    await dbRun(
      `UPDATE speakers SET status = ?, updated_at = ${updateTimestamp} WHERE id = ?`,
      ['declined', request.speaker_id]
    );

    // Alle Lunches in dieser Anfrage auf "planned" zurücksetzen
    const lunches = await dbAll(
      `SELECT lunch_id FROM speaker_request_lunches WHERE request_id = ?`,
      [request.id]
    );

    if (lunches.length > 0) {
      const lunchIds = lunches.map(l => l.lunch_id);
      const placeholders = lunchIds.map(() => '?').join(',');
      await dbRun(
        `UPDATE lunches SET status = 'planned', speaker_id = NULL WHERE id IN (${placeholders})`,
        lunchIds
      );
    }

    res.json({ message: 'Anfrage abgelehnt' });
  } catch (err) {
    console.error('Fehler beim Ablehnen der Anfrage:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Health Check Endpoint (für Render.com)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'rotary-portal-backend' });
});

// Database Test Endpoint
app.get('/api/test-db', authenticateToken, async (req, res) => {
  try {
    // Prüfe ob Tabelle existiert
    let tableExists = false;
    let speakersCount = 0;
    let error = null;
    
    if (dbType === 'postgres') {
      // Prüfe ob speakers Tabelle existiert
      const tableCheck = await db.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'speakers'
        );
      `);
      tableExists = tableCheck.rows[0]?.exists || false;
      
      if (tableExists) {
        const countResult = await db.query('SELECT COUNT(*) as count FROM speakers');
        speakersCount = parseInt(countResult.rows[0]?.count || 0);
      }
    } else {
      try {
        const result = await dbGet('SELECT COUNT(*) as count FROM speakers');
        tableExists = true;
        speakersCount = result?.count || 0;
      } catch (e) {
        tableExists = false;
        error = e.message;
      }
    }
    
    res.json({ 
      status: 'ok', 
      dbType,
      tableExists,
      speakersCount,
      message: tableExists ? 'Datenbank-Verbindung erfolgreich' : 'Tabelle speakers existiert nicht',
      error: error
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'error', 
      dbType,
      error: err.message,
      code: err.code,
      detail: err.detail,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// ========== CALENDLY INTEGRATION ==========
const axios = require('axios');

// Calendly API Konfiguration (aus Environment Variables)
const CALENDLY_API_TOKEN = process.env.CALENDLY_API_TOKEN || '';
const CALENDLY_WEBHOOK_SIGNING_KEY = process.env.CALENDLY_WEBHOOK_SIGNING_KEY || '';
const CALENDLY_BASE_URL = 'https://api.calendly.com';

// Calendly API Helper
const calendlyApi = axios.create({
  baseURL: CALENDLY_BASE_URL,
  headers: {
    'Authorization': `Bearer ${CALENDLY_API_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Calendly Event Type erstellen oder abrufen
app.get('/api/calendly/event-types', authenticateToken, async (req, res) => {
  if (!CALENDLY_API_TOKEN) {
    return res.status(400).json({ 
      error: 'Calendly API Token nicht konfiguriert',
      instructions: 'Bitte setzen Sie CALENDLY_API_TOKEN in den Environment Variables'
    });
  }

  try {
    // Hole User Info
    const userResponse = await calendlyApi.get('/users/me');
    const userUri = userResponse.data.resource.uri;
    
    // Hole Event Types
    const response = await calendlyApi.get('/event_types', {
      params: {
        user: userUri,
        count: 100
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Calendly API Fehler:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Fehler beim Abrufen der Event Types',
      details: error.response?.data || error.message
    });
  }
});

// Calendly Scheduling Link für eine Anfrage erstellen
app.post('/api/speaker-requests/:id/create-calendly', authenticateToken, async (req, res) => {
  const requestId = req.params.id;
  const { event_type_uri } = req.body;

  if (!CALENDLY_API_TOKEN) {
    return res.status(400).json({ 
      error: 'Calendly API Token nicht konfiguriert',
      instructions: 'Bitte setzen Sie CALENDLY_API_TOKEN in den Environment Variables. Sie erhalten den Token unter: https://calendly.com/integrations/api_webhooks'
    });
  }

  if (!event_type_uri) {
    return res.status(400).json({ error: 'Event Type URI erforderlich' });
  }

  try {
    const request = await dbGet(
      `SELECT sr.*, s.name as speaker_name, s.email as speaker_email
       FROM speaker_requests sr
       JOIN speakers s ON sr.speaker_id = s.id
       WHERE sr.id = ?`,
      [requestId]
    );

    if (!request) {
      return res.status(404).json({ error: 'Anfrage nicht gefunden' });
    }

    // Verfügbare Lunches laden
    const lunches = await dbAll(
      `SELECT l.* FROM lunches l
       JOIN speaker_request_lunches srl ON l.id = srl.lunch_id
       WHERE srl.request_id = ?
       ORDER BY l.date ASC`,
      [requestId]
    );

    try {
      // Calendly Scheduling Link erstellen
      const schedulingLink = await createCalendlySchedulingLink(event_type_uri, lunches, request);
      
      // Integration speichern
      const insertQuery = dbType === 'postgres'
        ? `INSERT INTO calendly_integrations (speaker_request_id, calendly_event_uri, status)
           VALUES ($1, $2, 'pending')
           ON CONFLICT(speaker_request_id) DO UPDATE SET
             calendly_event_uri = EXCLUDED.calendly_event_uri,
             status = 'pending'`
        : `INSERT INTO calendly_integrations (speaker_request_id, calendly_event_uri, status)
           VALUES (?, ?, 'pending')
           ON CONFLICT(speaker_request_id) DO UPDATE SET
             calendly_event_uri = excluded.calendly_event_uri,
             status = 'pending'`;
      
      await dbRun(insertQuery, [requestId, schedulingLink.event_uri || event_type_uri]);

      res.json({
        success: true,
        scheduling_link: schedulingLink.booking_url || `https://calendly.com/${event_type_uri.split('/').pop()}`,
        event_uri: schedulingLink.event_uri || event_type_uri,
        message: 'Calendly Link erfolgreich erstellt'
      });
    } catch (error) {
      console.error('Calendly Fehler:', error.response?.data || error.message);
      res.status(500).json({ 
        error: 'Fehler beim Erstellen des Calendly Links',
        details: error.response?.data || error.message
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Calendly Scheduling Link erstellen
async function createCalendlySchedulingLink(eventTypeUri, lunches, request) {
  try {
    // Hole Event Type Details
    const eventTypeResponse = await calendlyApi.get(eventTypeUri.replace(CALENDLY_BASE_URL, ''));
    const eventType = eventTypeResponse.data.resource;
    
    // Erstelle Scheduling Link mit Custom Parameters
    const username = eventTypeUri.split('/')[4];
    const eventSlug = eventTypeUri.split('/').pop();
    const bookingUrl = `https://calendly.com/${username}/${eventSlug}?name=${encodeURIComponent(request.speaker_name)}&email=${encodeURIComponent(request.speaker_email || '')}`;

    return {
      event_uri: eventTypeUri,
      booking_url: bookingUrl
    };
  } catch (error) {
    // Fallback: Verwende Standard Event Type URL
    const username = eventTypeUri.split('/')[4];
    const eventSlug = eventTypeUri.split('/').pop();
    return {
      event_uri: eventTypeUri,
      booking_url: `https://calendly.com/${username}/${eventSlug}?name=${encodeURIComponent(request.speaker_name)}&email=${encodeURIComponent(request.speaker_email || '')}`
    };
  }
}

// Calendly Webhook empfangen (wenn Termin gebucht wurde)
app.post('/api/webhooks/calendly', (req, res) => {
  // Parse JSON body
  let payload;
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const event = payload.event;
  const data = payload.payload || payload;

  if (event === 'invitee.created') {
    // Termin wurde gebucht
    handleCalendlyBooking(data);
  } else if (event === 'invitee.canceled') {
    // Termin wurde storniert
    handleCalendlyCancellation(data);
  }

  res.status(200).send('OK');
});

// Calendly Buchung verarbeiten
async function handleCalendlyBooking(data) {
  try {
    const eventUri = data.event || data.event_type;
    const invitee = data.invitee || {};
    const inviteeEmail = invitee.email;
    const scheduledEvent = invitee.scheduled_event || data.scheduled_event || {};
    const scheduledTime = scheduledEvent.start_time;

    // Finde die zugehörige Anfrage über Event URI
    const integration = await dbGet(
      `SELECT ci.*, sr.speaker_id, sr.id as request_id
       FROM calendly_integrations ci
       JOIN speaker_requests sr ON ci.speaker_request_id = sr.id
       WHERE ci.calendly_event_uri = ?`,
      [eventUri]
    );

    if (!integration) {
      console.error('Integration nicht gefunden für Event:', eventUri);
      return;
    }

    // Finde den passenden Lunch basierend auf der gebuchten Zeit
    if (scheduledTime) {
      const bookedDate = new Date(scheduledTime);
      
      // PostgreSQL verwendet EXTRACT(EPOCH FROM ...) statt julianday
      const dateDiffQuery = dbType === 'postgres'
        ? `ABS(EXTRACT(EPOCH FROM (l.date - ?::timestamp)))`
        : `ABS(julianday(l.date) - julianday(?))`;
      
      const lunches = await dbAll(
        `SELECT l.* FROM lunches l
         JOIN speaker_request_lunches srl ON l.id = srl.lunch_id
         WHERE srl.request_id = ?
         ORDER BY ${dateDiffQuery} ASC
         LIMIT 1`,
        [integration.speaker_request_id, bookedDate.toISOString()]
      );

      if (lunches.length > 0) {
        const selectedLunch = lunches[0];
        
        const timestampQuery = dbType === 'postgres' ? 'NOW()' : 'CURRENT_TIMESTAMP';
        
        // Update der Anfrage
        await dbRun(
          `UPDATE speaker_requests 
           SET selected_lunch_id = ?, status = 'accepted', responded_at = ${timestampQuery}
           WHERE id = ?`,
          [selectedLunch.id, integration.speaker_request_id]
        );

        // Update Lunch
        await dbRun(
          `UPDATE lunches SET status = ?, speaker_id = ?, updated_at = ${timestampQuery} WHERE id = ?`,
          ['confirmed', integration.speaker_id, selectedLunch.id]
        );

        // Update Speaker
        await dbRun(
          `UPDATE speakers SET status = ?, updated_at = ${timestampQuery} WHERE id = ?`,
          ['confirmed', integration.speaker_id]
        );

        // Update Integration
        await dbRun(
          `UPDATE calendly_integrations SET calendly_invitee_uri = ?, status = 'completed' WHERE id = ?`,
          [invitee.uri || '', integration.id]
        );

        console.log(`✅ Calendly Buchung verarbeitet: Lunch ${selectedLunch.id} für Speaker ${integration.speaker_id}`);
      }
    }
  } catch (err) {
    console.error('Fehler beim Verarbeiten der Calendly Buchung:', err);
  }
}

// Calendly Stornierung verarbeiten
async function handleCalendlyCancellation(data) {
  try {
    const eventUri = data.event;
    const invitee = data.invitee || {};

    const integration = await dbGet(
      `SELECT * FROM calendly_integrations WHERE calendly_event_uri = ? OR calendly_invitee_uri = ?`,
      [eventUri, invitee.uri]
    );

    if (integration) {
      // Setze Status zurück
      await dbRun(
        `UPDATE speaker_requests SET status = 'pending', selected_lunch_id = NULL WHERE id = ?`,
        [integration.speaker_request_id]
      );
    }
  } catch (err) {
    console.error('Fehler beim Verarbeiten der Calendly Stornierung:', err);
  }
}

// Legacy: Template Links für manuelle Erstellung
app.post('/api/speaker-requests/:id/generate-calendly', authenticateToken, async (req, res) => {
  const requestId = req.params.id;

  try {
    const request = await dbGet(
      `SELECT sr.*, s.name as speaker_name, s.email as speaker_email
       FROM speaker_requests sr
       JOIN speakers s ON sr.speaker_id = s.id
       WHERE sr.id = ?`,
      [requestId]
    );

    if (!request) {
      return res.status(404).json({ error: 'Anfrage nicht gefunden' });
    }

    // Verfügbare Lunches laden
    const lunches = await dbAll(
      `SELECT l.* FROM lunches l
       JOIN speaker_request_lunches srl ON l.id = srl.lunch_id
       WHERE srl.request_id = ?
       ORDER BY l.date ASC`,
      [requestId]
    );

    // Calendly Link generieren
    const calendlyLink = generateCalendlyLink(lunches, request);
    
    res.json({
      calendly_link: calendlyLink,
      alternative_links: {
        google_calendar: generateGoogleCalendarLink(lunches),
        doodle: generateDoodleLink(lunches, request)
      },
      instructions: {
        calendly: "Erstellen Sie ein Calendly Event mit diesen Terminen und teilen Sie den Link",
        google: "Erstellen Sie einen Google Calendar 'Find a time' Link",
        doodle: "Erstellen Sie eine Doodle-Umfrage mit diesen Terminen"
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Calendly Webhook empfangen (wenn Termin gebucht wurde)
app.post('/api/webhooks/calendly', async (req, res) => {
  try {
    const { event, payload } = req.body;

    if (event === 'invitee.created') {
      const { event_uri, invitee_uri } = payload;
      
      // Finde die zugehörige Anfrage
      const integration = await dbGet(
        `SELECT * FROM calendly_integrations WHERE calendly_event_uri = ?`,
        [event_uri]
      );
      
      if (integration) {
        // Update der Anfrage mit gebuchtem Termin
        // Die Mapping-Logik wird in handleCalendlyBooking implementiert
        await handleCalendlyBooking({ event: event_uri, invitee: { uri: invitee_uri } });
      }
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('Webhook Fehler:', err);
    res.status(200).send('OK'); // Immer OK senden, damit Calendly nicht erneut sendet
  }
});

// Helper-Funktionen
function generateCalendlyLink(lunches, request) {
  // Calendly erfordert einen Account und Event-Type
  // Format: https://calendly.com/username/event-type
  // Für mehrere Termine: Calendly "Collective" oder mehrere Events
  // Hier geben wir einen Template-Link zurück
  const firstDate = new Date(lunches[0].date);
  const dateStr = firstDate.toISOString().split('T')[0];
  
  return `https://calendly.com/YOUR-USERNAME/rotary-lunch?month=${dateStr.split('-')[0]}-${dateStr.split('-')[1]}&date=${dateStr}`;
}

function generateGoogleCalendarLink(lunches) {
  // Google Calendar "Find a time" Link mit mehreren Optionen
  // Format: https://calendar.google.com/calendar/render?action=TEMPLATE&text=...
  const text = encodeURIComponent('Rotary Lunch - Terminauswahl');
  const dates = lunches.map(l => {
    const start = new Date(l.date);
    const end = new Date(start.getTime() + 75 * 60 * 1000);
    return {
      start: start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      end: end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    };
  });
  
  // Erstelle einen Link für den ersten Termin (Google unterstützt nur einen pro Link)
  const first = dates[0];
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${first.start}/${first.end}&details=${encodeURIComponent('Bitte wählen Sie einen passenden Termin aus der Liste')}`;
}

function generateDoodleLink(lunches, request) {
  // Doodle Umfrage erstellen
  // Format: https://doodle.com/poll/create
  // Für automatische Erstellung bräuchte man die Doodle API
  const title = encodeURIComponent(`Rotary Lunch - ${request.speaker_name}`);
  const options = lunches.map(l => {
    const date = new Date(l.date);
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().split(' ')[0].substring(0, 5);
    return `${dateStr}T${timeStr}`;
  }).join(',');
  
  // Doodle Link für manuelle Erstellung
  return `https://doodle.com/poll/create?title=${title}&options=${options}`;
}

app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
  console.log(`📅 Rotary Portal Backend bereit`);
});

