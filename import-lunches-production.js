// Import Script für Production (Railway)
// Verwendet die API statt direkter Datenbank-Zugriff

const axios = require('axios');

// API URL - Railway Backend
const API_URL = process.env.API_URL || 'https://rotary-portal-backend-production-bd6b.up.railway.app/api';

// Login Credentials
const USERNAME = process.env.USERNAME || 'praesident';
const PASSWORD = process.env.PASSWORD || 'admin123';

let authToken = '';

// Login
async function login() {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      username: USERNAME,
      password: PASSWORD
    });
    authToken = response.data.token;
    console.log('✅ Login erfolgreich');
    return true;
  } catch (error) {
    console.error('❌ Login fehlgeschlagen:', error.response?.data || error.message);
    return false;
  }
}

// Lunch erstellen
async function createLunch(date, title) {
  try {
    const response = await axios.post(
      `${API_URL}/lunches`,
      {
        date: date,
        title: title,
        location: 'Netts Schützengarten',
        status: 'planned'
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`❌ Fehler beim Erstellen von ${date}:`, error.response?.data || error.message);
    return null;
  }
}

// Alle Lunches importieren
async function importLunches() {
  console.log('🚀 Starte Lunch-Import...\n');

  // Login
  const loggedIn = await login();
  if (!loggedIn) {
    console.error('❌ Konnte nicht einloggen. Abbruch.');
    process.exit(1);
  }

  // Lunches definieren
  const lunches = [
    // Juli 2026
    { date: '2026-07-06T12:00:00', title: 'Lunch' },
    { date: '2026-07-13T12:00:00', title: 'Lunch' },
    { date: '2026-07-20T12:00:00', title: 'Lunch' },
    { date: '2026-07-27T12:00:00', title: 'Lunch' },
    
    // August 2026
    { date: '2026-08-03T12:00:00', title: 'Lunch' },
    { date: '2026-08-10T12:00:00', title: 'Lunch' },
    { date: '2026-08-17T12:00:00', title: 'Lunch' },
    { date: '2026-08-24T12:00:00', title: 'Lunch' },
    { date: '2026-08-31T12:00:00', title: 'Lunch' },
    
    // September 2026
    { date: '2026-09-07T12:00:00', title: 'Lunch' },
    { date: '2026-09-14T12:00:00', title: 'Lunch' },
    { date: '2026-09-21T12:00:00', title: 'Lunch' },
    { date: '2026-09-28T12:00:00', title: 'Lunch' },
    
    // Oktober 2026
    { date: '2026-10-05T12:00:00', title: 'Lunch' },
    { date: '2026-10-12T12:00:00', title: 'Lunch' },
    { date: '2026-10-19T12:00:00', title: 'Lunch' },
    { date: '2026-10-26T12:00:00', title: 'Lunch' },
    
    // November 2026
    { date: '2026-11-02T12:00:00', title: 'Lunch' },
    { date: '2026-11-09T12:00:00', title: 'Lunch' },
    { date: '2026-11-16T12:00:00', title: 'Lunch' },
    { date: '2026-11-23T12:00:00', title: 'Lunch' },
    { date: '2026-11-30T12:00:00', title: 'Lunch' },
    
    // Dezember 2026
    { date: '2026-12-07T12:00:00', title: 'Lunch' },
    { date: '2026-12-14T12:00:00', title: 'Lunch' },
    { date: '2026-12-21T12:00:00', title: 'Lunch' },
    { date: '2026-12-28T12:00:00', title: 'Lunch' },
    
    // Januar 2027
    { date: '2027-01-04T12:00:00', title: 'Lunch' },
    { date: '2027-01-11T12:00:00', title: 'Lunch' },
    { date: '2027-01-18T12:00:00', title: 'Lunch' },
    { date: '2027-01-25T12:00:00', title: 'Lunch' },
    
    // Februar 2027
    { date: '2027-02-01T12:00:00', title: 'Lunch' },
    { date: '2027-02-08T12:00:00', title: 'Lunch' },
    { date: '2027-02-15T12:00:00', title: 'Lunch' },
    { date: '2027-02-22T12:00:00', title: 'Lunch' },
    
    // März 2027
    { date: '2027-03-01T12:00:00', title: 'Lunch' },
    { date: '2027-03-08T12:00:00', title: 'Lunch' },
    { date: '2027-03-15T12:00:00', title: 'Lunch' },
    { date: '2027-03-22T12:00:00', title: 'Lunch' },
    { date: '2027-03-29T12:00:00', title: 'Lunch' },
    
    // April 2027 (ohne Ostermontag 05.04.2027)
    { date: '2027-04-12T12:00:00', title: 'Lunch' },
    { date: '2027-04-19T12:00:00', title: 'Lunch' },
    { date: '2027-04-26T12:00:00', title: 'Lunch' },
    
    // Mai 2027 (ohne Pfingstmontag 24.05.2027)
    { date: '2027-05-03T12:00:00', title: 'Lunch' },
    { date: '2027-05-10T12:00:00', title: 'Lunch' },
    { date: '2027-05-17T12:00:00', title: 'Lunch' },
    { date: '2027-05-31T12:00:00', title: 'Lunch' },
    
    // Juni 2027
    { date: '2027-06-07T12:00:00', title: 'Lunch' },
    { date: '2027-06-14T12:00:00', title: 'Lunch' },
    { date: '2027-06-21T12:00:00', title: 'Lunch' },
    { date: '2027-06-28T12:00:00', title: 'Lunch' }
  ];

  console.log(`📅 Importiere ${lunches.length} Lunches...\n`);

  let success = 0;
  let failed = 0;

  for (const lunch of lunches) {
    const result = await createLunch(lunch.date, lunch.title);
    if (result) {
      success++;
      const date = new Date(lunch.date).toLocaleDateString('de-CH');
      console.log(`✅ ${date} - ${lunch.title}`);
    } else {
      failed++;
    }
    // Kleine Pause zwischen Requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n✅ Import abgeschlossen!`);
  console.log(`   Erfolgreich: ${success}`);
  console.log(`   Fehlgeschlagen: ${failed}`);
  console.log(`   Gesamt: ${lunches.length}`);
}

// Script ausführen
importLunches().catch(error => {
  console.error('❌ Fehler:', error);
  process.exit(1);
});

