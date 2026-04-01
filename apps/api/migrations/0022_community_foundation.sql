PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS communities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL DEFAULT 'Ерөнхий',
  grade INTEGER NOT NULL DEFAULT 0,
  visibility TEXT NOT NULL DEFAULT 'PUBLIC' CHECK (visibility IN ('PRIVATE', 'PUBLIC')),
  owner_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS community_members (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('OWNER', 'MODERATOR', 'MEMBER')),
  joined_at TEXT NOT NULL,
  UNIQUE (community_id, user_id),
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS community_shared_banks (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL,
  bank_id TEXT NOT NULL,
  shared_by_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED', 'FEATURED')),
  created_at TEXT NOT NULL,
  UNIQUE (community_id, bank_id),
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  FOREIGN KEY (bank_id) REFERENCES question_banks(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_by_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_communities_owner_id
  ON communities(owner_id);

CREATE INDEX IF NOT EXISTS idx_communities_subject_grade
  ON communities(subject, grade);

CREATE INDEX IF NOT EXISTS idx_community_members_community_id
  ON community_members(community_id);

CREATE INDEX IF NOT EXISTS idx_community_members_user_id
  ON community_members(user_id);

CREATE INDEX IF NOT EXISTS idx_community_shared_banks_community_id
  ON community_shared_banks(community_id);

CREATE INDEX IF NOT EXISTS idx_community_shared_banks_bank_id
  ON community_shared_banks(bank_id);
