import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db;

export function initDB() {
  db = new Database(join(__dirname, '../../data/finbridge.db'));
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id TEXT NOT NULL,
      action TEXT NOT NULL,
      input_hash TEXT,
      output_hash TEXT,
      user_id TEXT DEFAULT 'system',
      environment TEXT DEFAULT 'UAT',
      gateway_type TEXT,
      security_profile TEXT,
      integration_types TEXT,
      pii_detected INTEGER DEFAULT 0,
      pii_masked INTEGER DEFAULT 0,
      validation_status TEXT,
      generation_time_ms INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS generated_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id TEXT NOT NULL,
      config_type TEXT NOT NULL,
      config_content TEXT NOT NULL,
      schema_valid INTEGER DEFAULT 0,
      environment TEXT DEFAULT 'UAT',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}

export function getDB() {
  if (!db) initDB();
  return db;
}

export function logAudit(entry) {
  const db = getDB();
  const stmt = db.prepare(`
    INSERT INTO audit_log (request_id, action, input_hash, output_hash, user_id, environment,
      gateway_type, security_profile, integration_types, pii_detected, pii_masked,
      validation_status, generation_time_ms)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    entry.request_id, entry.action, entry.input_hash || null,
    entry.output_hash || null, entry.user_id || 'system',
    entry.environment || 'UAT', entry.gateway_type || null,
    entry.security_profile || null, entry.integration_types || null,
    entry.pii_detected || 0, entry.pii_masked || 0,
    entry.validation_status || null, entry.generation_time_ms || null
  );
}

export function saveConfig(entry) {
  const db = getDB();
  const stmt = db.prepare(`
    INSERT INTO generated_configs (request_id, config_type, config_content, schema_valid, environment)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(entry.request_id, entry.config_type, entry.config_content, entry.schema_valid ? 1 : 0, entry.environment || 'UAT');
}

export function getAuditHistory(limit = 50) {
  const db = getDB();
  return db.prepare('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT ?').all(limit);
}

export function getConfigHistory(limit = 20) {
  const db = getDB();
  return db.prepare('SELECT * FROM generated_configs ORDER BY created_at DESC LIMIT ?').all(limit);
}
