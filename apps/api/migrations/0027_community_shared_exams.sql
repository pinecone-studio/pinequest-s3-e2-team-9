PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS community_shared_exams (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL,
  exam_id TEXT NOT NULL,
  shared_by_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (community_id, exam_id),
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_by_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_community_shared_exams_community_id
  ON community_shared_exams(community_id);

CREATE INDEX IF NOT EXISTS idx_community_shared_exams_exam_id
  ON community_shared_exams(exam_id);
