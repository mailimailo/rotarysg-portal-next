const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'rotary.db');
const db = new sqlite3.Database(dbPath);

// Alle Lunch-Termine
const lunches = [
  { date: '2026-07-06T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2026-07-13T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2026-07-20T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2026-07-27T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  
  { date: '2026-08-03T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2026-08-10T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2026-08-17T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2026-08-24T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2026-08-31T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  
  { date: '2026-09-07T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2026-09-14T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2026-09-21T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2026-09-28T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  
  { date: '2026-10-05T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2026-10-12T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2026-10-19T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2026-10-26T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  
  { date: '2026-11-02T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2026-11-09T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2026-11-16T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2026-11-23T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2026-11-30T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  
  { date: '2026-12-07T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2026-12-14T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2026-12-21T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2026-12-28T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  
  { date: '2027-01-04T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2027-01-11T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2027-01-18T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2027-01-25T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  
  { date: '2027-02-01T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2027-02-08T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2027-02-15T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2027-02-22T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  
  { date: '2027-03-01T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2027-03-08T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2027-03-15T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2027-03-22T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2027-03-29T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  
  // 05.04.2027 - kein Lunch (Ostermontag) - wird übersprungen
  { date: '2027-04-12T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2027-04-19T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2027-04-26T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  
  { date: '2027-05-03T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2027-05-10T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2027-05-17T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  // 24.05.2027 - kein Lunch (Pfingstmontag) - wird übersprungen
  { date: '2027-05-31T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  
  { date: '2027-06-07T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2027-06-14T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2027-06-21T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' },
  { date: '2027-06-28T12:00:00', title: 'Lunch', location: 'Netts Schützengarten' }
];

console.log('Starte Import von', lunches.length, 'Lunches...');

let imported = 0;
let errors = 0;

lunches.forEach((lunch, index) => {
  const date = new Date(lunch.date);
  const formattedDate = date.toISOString();
  
  db.run(
    `INSERT INTO lunches (date, location, title, description, status) 
     VALUES (?, ?, ?, ?, ?)`,
    [
      formattedDate,
      lunch.location,
      lunch.title,
      `Rotary Lunch ${date.toLocaleDateString('de-CH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
      'planned'
    ],
    function(err) {
      if (err) {
        console.error(`Fehler beim Import von Lunch ${index + 1} (${lunch.date}):`, err.message);
        errors++;
      } else {
        imported++;
        console.log(`✓ Lunch ${index + 1}/${lunches.length} importiert: ${date.toLocaleDateString('de-CH')}`);
      }
      
      // Wenn alle Lunches verarbeitet wurden
      if (imported + errors === lunches.length) {
        console.log('\n=== Import abgeschlossen ===');
        console.log(`Erfolgreich importiert: ${imported}`);
        console.log(`Fehler: ${errors}`);
        db.close();
      }
    }
  );
});

