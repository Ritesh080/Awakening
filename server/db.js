import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(path.join(dataDir, "awakening.db"));

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    user_id                INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    plan                   TEXT NOT NULL,              -- 'monthly' | 'yearly'
    status                 TEXT NOT NULL,              -- 'active' | 'canceling' | 'canceled' | 'past_due'
    provider               TEXT NOT NULL,              -- 'stripe' | 'demo'
    stripe_customer_id     TEXT,
    stripe_subscription_id TEXT,
    current_period_end     TEXT,
    updated_at             TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS completions (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_id   TEXT NOT NULL,
    seconds      INTEGER NOT NULL DEFAULT 0,
    completed_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_completions_user ON completions(user_id, completed_at);

  CREATE TABLE IF NOT EXISTS user_settings (
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key        TEXT NOT NULL,
    value      TEXT NOT NULL,             -- JSON blob
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, key)
  );
`);

export const q = {
  createUser: db.prepare(
    "INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)"
  ),
  userByEmail: db.prepare("SELECT * FROM users WHERE email = ?"),
  userById: db.prepare("SELECT id, email, name, created_at FROM users WHERE id = ?"),

  subByUser: db.prepare("SELECT * FROM subscriptions WHERE user_id = ?"),
  subByStripeSubId: db.prepare(
    "SELECT * FROM subscriptions WHERE stripe_subscription_id = ?"
  ),
  upsertSub: db.prepare(`
    INSERT INTO subscriptions
      (user_id, plan, status, provider, stripe_customer_id, stripe_subscription_id, current_period_end, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      plan = excluded.plan,
      status = excluded.status,
      provider = excluded.provider,
      stripe_customer_id = COALESCE(excluded.stripe_customer_id, stripe_customer_id),
      stripe_subscription_id = COALESCE(excluded.stripe_subscription_id, stripe_subscription_id),
      current_period_end = excluded.current_period_end,
      updated_at = datetime('now')
  `),
  setSubStatus: db.prepare(
    "UPDATE subscriptions SET status = ?, updated_at = datetime('now') WHERE user_id = ?"
  ),

  addCompletion: db.prepare(
    "INSERT INTO completions (user_id, program_id, seconds) VALUES (?, ?, ?)"
  ),
  statsByUser: db.prepare(`
    SELECT COUNT(*) AS sessions, COALESCE(SUM(seconds), 0) AS seconds
    FROM completions WHERE user_id = ?
  `),
  recentDays: db.prepare(`
    SELECT DISTINCT date(completed_at) AS day
    FROM completions WHERE user_id = ?
    ORDER BY day DESC LIMIT 60
  `),
  recentCompletions: db.prepare(`
    SELECT program_id, seconds, completed_at
    FROM completions WHERE user_id = ?
    ORDER BY completed_at DESC LIMIT 10
  `),
  byProgram: db.prepare(`
    SELECT program_id, COUNT(*) AS sessions, COALESCE(SUM(seconds), 0) AS seconds
    FROM completions WHERE user_id = ?
    GROUP BY program_id
  `),
  distinctDays: db.prepare(`
    SELECT COUNT(DISTINCT date(completed_at)) AS days
    FROM completions WHERE user_id = ?
  `),

  allSettings: db.prepare("SELECT key, value FROM user_settings WHERE user_id = ?"),
  upsertSetting: db.prepare(`
    INSERT INTO user_settings (user_id, key, value, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, key) DO UPDATE SET
      value = excluded.value, updated_at = datetime('now')
  `),
};

export function isPremium(userId) {
  const sub = q.subByUser.get(userId);
  if (!sub) return false;
  if (sub.status !== "active" && sub.status !== "canceling") return false;
  if (sub.current_period_end && new Date(sub.current_period_end) < new Date()) {
    return false;
  }
  return true;
}

export function computeStreak(userId) {
  const rows = q.recentDays.all(userId).map((r) => r.day);
  if (rows.length === 0) return 0;
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400e3).toISOString().slice(0, 10);
  if (rows[0] !== today && rows[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < rows.length; i++) {
    const prev = new Date(rows[i - 1]);
    const cur = new Date(rows[i]);
    if ((prev - cur) / 86400e3 === 1) streak++;
    else break;
  }
  return streak;
}
