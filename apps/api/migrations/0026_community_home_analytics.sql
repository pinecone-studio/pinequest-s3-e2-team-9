PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS community_usage_events (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL,
  actor_user_id TEXT,
  event_type TEXT NOT NULL CHECK (
    event_type IN ('CREATE_COMMUNITY', 'JOIN_COMMUNITY', 'SHARE_BANK', 'COPY_BANK')
  ),
  entity_type TEXT NOT NULL CHECK (
    entity_type IN ('COMMUNITY', 'SHARED_BANK')
  ),
  entity_id TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_community_usage_events_community_id
  ON community_usage_events(community_id);

CREATE INDEX IF NOT EXISTS idx_community_usage_events_event_type
  ON community_usage_events(event_type);

CREATE INDEX IF NOT EXISTS idx_community_usage_events_entity
  ON community_usage_events(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_community_usage_events_created_at
  ON community_usage_events(created_at);
