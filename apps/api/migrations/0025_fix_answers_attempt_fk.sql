PRAGMA defer_foreign_keys = TRUE;
PRAGMA foreign_keys = OFF;

ALTER TABLE answers RENAME TO answers_old_fk_fix;

CREATE TABLE answers (
  id TEXT PRIMARY KEY,
  attempt_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  value TEXT NOT NULL,
  auto_score INTEGER,
  manual_score INTEGER,
  feedback TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (attempt_id, question_id),
  FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

INSERT INTO answers (
  id,
  attempt_id,
  question_id,
  value,
  auto_score,
  manual_score,
  feedback,
  created_at
)
SELECT
  id,
  attempt_id,
  question_id,
  value,
  auto_score,
  manual_score,
  feedback,
  created_at
FROM answers_old_fk_fix;

DROP TABLE answers_old_fk_fix;

CREATE INDEX IF NOT EXISTS idx_answers_attempt_id ON answers(attempt_id);

PRAGMA foreign_keys = ON;
