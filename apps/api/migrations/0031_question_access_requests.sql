CREATE TABLE IF NOT EXISTS question_access_requests (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  requester_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at TEXT NOT NULL,
  reviewed_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_question_access_requests_unique_pending
  ON question_access_requests(question_id, requester_user_id, status);

CREATE INDEX IF NOT EXISTS idx_question_access_requests_owner
  ON question_access_requests(owner_user_id, status, created_at);

CREATE INDEX IF NOT EXISTS idx_question_access_requests_requester
  ON question_access_requests(requester_user_id, status, created_at);

CREATE INDEX IF NOT EXISTS idx_question_access_requests_question
  ON question_access_requests(question_id, status);
