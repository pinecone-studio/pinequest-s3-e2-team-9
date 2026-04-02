PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS community_ratings (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('SHARED_BANK', 'SHARED_EXAM')),
  entity_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  value INTEGER NOT NULL CHECK (value BETWEEN 1 AND 5),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_community_ratings_unique
  ON community_ratings(community_id, entity_type, entity_id, user_id);

CREATE INDEX IF NOT EXISTS idx_community_ratings_entity
  ON community_ratings(community_id, entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_community_ratings_user
  ON community_ratings(user_id);
