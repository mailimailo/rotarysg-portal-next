// Datenbank-Adapter: PostgreSQL oder SQLite
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');

let db = null;
let dbType = 'sqlite'; // 'sqlite' oder 'postgres'

// Export für db-helper.js
let exportedDbType = dbType;

// Prüfe ob PostgreSQL verfügbar ist
if (process.env.DATABASE_URL) {
  // PostgreSQL verwenden
  dbType = 'postgres';
  exportedDbType = 'postgres';
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('railway') ? { rejectUnauthorized: false } : false
  });
  
  db = {
    query: (text, params) => pool.query(text, params),
    run: async (text, params) => {
      const result = await pool.query(text, params);
      return { lastID: result.rows[0]?.id || result.insertId };
    },
    get: async (text, params) => {
      const result = await pool.query(text, params);
      return result.rows[0] || null;
    },
    all: async (text, params) => {
      const result = await pool.query(text, params);
      return result.rows;
    },
    serialize: (callback) => callback(),
    close: () => pool.end()
  };
  
  console.log('✅ PostgreSQL Datenbank verbunden');
} else {
  // SQLite verwenden (lokal)
  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'rotary.db');
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Datenbank-Fehler:', err.message);
    } else {
      console.log('✅ SQLite Datenbank verbunden:', dbPath);
    }
  });
}

// Helper-Funktion für SQLite-kompatible Syntax
function adaptSQL(sql) {
  if (dbType === 'postgres') {
    // SQLite zu PostgreSQL Anpassungen
    return sql
      .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY')
      .replace(/DATETIME/g, 'TIMESTAMP')
      .replace(/CURRENT_TIMESTAMP/g, 'NOW()')
      .replace(/julianday\(/g, 'EXTRACT(EPOCH FROM ')
      .replace(/\)/g, ')::numeric / 86400') // Für julianday Berechnungen
      .replace(/\?/g, (match, offset, string) => {
        // Zähle ? vor dieser Position
        const before = string.substring(0, offset);
        const count = (before.match(/\?/g) || []).length;
        return `$${count + 1}`;
      });
  }
  return sql;
}

// dbType für andere Module verfügbar machen
Object.defineProperty(module.exports, 'dbType', {
  get: () => exportedDbType
});

// Helper-Funktionen für kompatible Datenbank-Abfragen
async function dbGet(query, params = []) {
  if (exportedDbType === 'postgres') {
    let paramIndex = 1;
    const pgQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
    const result = await db.query(pgQuery, params);
    return result.rows[0] || null;
  } else {
    return new Promise((resolve, reject) => {
      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }
}

async function dbAll(query, params = []) {
  if (exportedDbType === 'postgres') {
    let paramIndex = 1;
    const pgQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
    const result = await db.query(pgQuery, params);
    return result.rows;
  } else {
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
}

async function dbRun(query, params = []) {
  if (exportedDbType === 'postgres') {
    let paramIndex = 1;
    const pgQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
    
    try {
      const result = await db.query(pgQuery, params);
      
      // Für INSERT mit RETURNING
      if (pgQuery.includes('RETURNING')) {
        const returnedId = result.rows[0]?.id;
        return {
          lastID: returnedId,
          changes: result.rowCount || 0,
          rows: result.rows
        };
      }
      
      // Für UPDATE/DELETE ohne RETURNING
      return {
        lastID: result.rows[0]?.id || null,
        changes: result.rowCount || 0
      };
    } catch (err) {
      console.error('dbRun Fehler:', err);
      console.error('Query:', pgQuery);
      console.error('Params:', params);
      throw err;
    }
  } else {
    return new Promise((resolve, reject) => {
      db.run(query, params, function(err) {
        if (err) {
          console.error('SQLite dbRun Fehler:', err);
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }
}

module.exports = {
  db,
  get dbType() { return exportedDbType; },
  adaptSQL,
  dbGet,
  dbAll,
  dbRun
};

