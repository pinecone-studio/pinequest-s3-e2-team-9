PRAGMA foreign_keys = OFF;

ALTER TABLE exam_import_questions RENAME TO exam_import_questions_old_fk_fix;

CREATE TABLE exam_import_questions (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES exam_import_jobs(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY', 'IMAGE_UPLOAD')),
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  options_json TEXT NOT NULL DEFAULT '[]',
  answers_json TEXT NOT NULL DEFAULT '[]',
  score INTEGER NOT NULL DEFAULT 1,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
  source_page INTEGER,
  confidence REAL NOT NULL DEFAULT 0.5,
  needs_review INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

INSERT INTO exam_import_questions (
  id,
  job_id,
  display_order,
  type,
  title,
  prompt,
  options_json,
  answers_json,
  score,
  difficulty,
  source_page,
  confidence,
  needs_review,
  created_at
)
SELECT
  id,
  job_id,
  display_order,
  type,
  title,
  prompt,
  options_json,
  answers_json,
  score,
  difficulty,
  source_page,
  confidence,
  needs_review,
  created_at
FROM exam_import_questions_old_fk_fix;

DROP TABLE exam_import_questions_old_fk_fix;

CREATE INDEX IF NOT EXISTS idx_exam_import_questions_job_order
  ON exam_import_questions (job_id, display_order ASC);

PRAGMA foreign_keys = ON;
