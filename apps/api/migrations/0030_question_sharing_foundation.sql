ALTER TABLE questions ADD COLUMN canonical_question_id TEXT REFERENCES questions(id);
ALTER TABLE questions ADD COLUMN forked_from_question_id TEXT REFERENCES questions(id);
ALTER TABLE questions ADD COLUMN share_scope TEXT NOT NULL DEFAULT 'PRIVATE' CHECK (share_scope IN ('PRIVATE', 'COMMUNITY', 'PUBLIC'));
ALTER TABLE questions ADD COLUMN requires_access_request INTEGER NOT NULL DEFAULT 0 CHECK (requires_access_request IN (0, 1));

CREATE INDEX IF NOT EXISTS idx_questions_canonical_question_id
  ON questions(canonical_question_id);

CREATE INDEX IF NOT EXISTS idx_questions_forked_from_question_id
  ON questions(forked_from_question_id);

CREATE INDEX IF NOT EXISTS idx_questions_share_scope
  ON questions(share_scope);
