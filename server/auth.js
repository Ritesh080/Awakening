import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { q, isPremium, computeStreak } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret-change-me";
const TOKEN_TTL = "30d";

// Tiny in-memory rate limiter for auth endpoints (per-IP).
const attempts = new Map();
function rateLimit(req, res, next) {
  const key = req.ip;
  const now = Date.now();
  const entry = attempts.get(key) || { count: 0, reset: now + 15 * 60e3 };
  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + 15 * 60e3;
  }
  entry.count++;
  attempts.set(key, entry);
  if (entry.count > 30) {
    return res.status(429).json({ error: "Too many attempts. Try again later." });
  }
  next();
}

export function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Not signed in" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "Session expired. Sign in again." });
  }
}

function publicUser(userId) {
  const user = q.userById.get(userId);
  const sub = q.subByUser.get(userId);
  const stats = q.statsByUser.get(userId);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.created_at,
    premium: isPremium(userId),
    subscription: sub
      ? {
          plan: sub.plan,
          status: sub.status,
          provider: sub.provider,
          currentPeriodEnd: sub.current_period_end,
        }
      : null,
    stats: {
      sessions: stats.sessions,
      minutes: Math.round(stats.seconds / 60),
      streak: computeStreak(userId),
    },
  };
}

export const authRouter = Router();

authRouter.post("/register", rateLimit, async (req, res) => {
  const { email, name, password } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: "Enter your name." });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }
  const existing = q.userByEmail.get(email.toLowerCase().trim());
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }
  const hash = await bcrypt.hash(password, 12);
  const result = q.createUser.run(email.toLowerCase().trim(), name.trim(), hash);
  const userId = Number(result.lastInsertRowid);
  res.json({ token: signToken(userId), user: publicUser(userId) });
});

authRouter.post("/login", rateLimit, async (req, res) => {
  const { email, password } = req.body || {};
  const user = q.userByEmail.get((email || "").toLowerCase().trim());
  if (!user || !(await bcrypt.compare(password || "", user.password_hash))) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }
  res.json({ token: signToken(user.id), user: publicUser(user.id) });
});

authRouter.get("/me", requireAuth, (req, res) => {
  const user = q.userById.get(req.userId);
  if (!user) return res.status(401).json({ error: "Account not found" });
  res.json({ user: publicUser(req.userId) });
});

export { publicUser };
