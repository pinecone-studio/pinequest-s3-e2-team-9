PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS community_comments (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL,
  author_user_id TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('SHARED_BANK', 'SHARED_EXAM')),
  entity_id TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_community_comments_community_id
  ON community_comments(community_id);

CREATE INDEX IF NOT EXISTS idx_community_comments_entity
  ON community_comments(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_community_comments_author
  ON community_comments(author_user_id);
