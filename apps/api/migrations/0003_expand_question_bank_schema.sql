PRAGMA foreign_keys = OFF;

ALTER TABLE question_banks
ADD COLUMN subject TEXT NOT NULL DEFAULT 'Асуултын сан';

CREATE TABLE questions_new (
  id TEXT PRIMARY KEY,
  bank_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY', 'IMAGE_UPLOAD')),
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  options_json TEXT NOT NULL DEFAULT '[]',
  correct_answer TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
  tags_json TEXT NOT NULL DEFAULT '[]',
  created_by_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (bank_id) REFERENCES question_banks(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE RESTRICT
);

INSERT INTO questions_new (
  id,
  bank_id,
  type,
  title,
  prompt,
  options_json,
  correct_answer,
  difficulty,
  tags_json,
  created_by_id,
  created_at
)
SELECT
  id,
  bank_id,
  type,
  title,
  prompt,
  options_json,
  correct_answer,
  difficulty,
  tags_json,
  created_by_id,
  created_at
FROM questions;

DROP TABLE questions;
ALTER TABLE questions_new RENAME TO questions;

CREATE INDEX IF NOT EXISTS idx_questions_bank_id ON questions(bank_id);

PRAGMA foreign_keys = ON;
