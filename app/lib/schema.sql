-- Run this in your NeonDB SQL editor to create the users table

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email               TEXT UNIQUE NOT NULL,
  password_hash       TEXT,                         -- NULL for OAuth users
  username            TEXT UNIQUE,
  full_name           TEXT,
  role                TEXT CHECK (role IN ('client', 'freelancer')),
  is_email_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  otp_code            TEXT,
  otp_expires_at      TIMESTAMPTZ,
  provider            TEXT NOT NULL DEFAULT 'credentials', -- 'credentials' | 'google'
  provider_account_id TEXT,
  avatar_url          TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index for username uniqueness checks
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
