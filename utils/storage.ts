import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('kisanai.db');
    await initDatabase(db);
  }
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS scans (
      id TEXT PRIMARY KEY,
      disease_name TEXT NOT NULL,
      name_eng TEXT,
      confidence INTEGER,
      severity TEXT,
      symptoms TEXT,
      treatment TEXT,
      image_uri TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      scan_id TEXT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS weather_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location TEXT,
      data TEXT,
      cached_at TEXT
    );
  `);
}

export async function saveScan(scan: {
  id: string;
  disease_name: string;
  name_eng: string;
  confidence: number;
  severity: string;
  symptoms: string;
  treatment: string[];
  image_uri: string;
}) {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO scans 
     (id, disease_name, name_eng, confidence, severity, symptoms, treatment, image_uri)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      scan.id,
      scan.disease_name,
      scan.name_eng,
      scan.confidence,
      scan.severity,
      scan.symptoms,
      JSON.stringify(scan.treatment),
      scan.image_uri,
    ]
  );
}

export async function getScans(): Promise<any[]> {
  const database = await getDatabase();
  return await database.getAllAsync(
    'SELECT * FROM scans ORDER BY created_at DESC LIMIT 50'
  );
}

export async function deleteScan(id: string) {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM scans WHERE id = ?', [id]);
}

export async function cacheWeather(location: string, data: any) {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT OR REPLACE INTO weather_cache (location, data, cached_at) VALUES (?, ?, ?)',
    [location, JSON.stringify(data), new Date().toISOString()]
  );
}

export async function getCachedWeather(location: string): Promise<any | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync(
    'SELECT * FROM weather_cache WHERE location = ? ORDER BY cached_at DESC LIMIT 1',
    [location]
  ) as any;
  if (!row) return null;
  const age = Date.now() - new Date(row.cached_at).getTime();
  if (age > 30 * 60 * 1000) return null; // 30 min cache
  return JSON.parse(row.data);
}
