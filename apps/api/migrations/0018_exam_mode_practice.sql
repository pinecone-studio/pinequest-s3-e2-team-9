ALTER TABLE exams RENAME TO exams_old;

CREATE TABLE exams (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  is_template INTEGER NOT NULL DEFAULT 0,
  source_exam_id TEXT REFERENCES exams(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  mode TEXT NOT NULL CHECK (mode IN ('SCHEDULED', 'OPEN_WINDOW', 'PRACTICE')),
  status TEXT NOT NULL CHECK (status IN ('DRAFT', 'PUBLISHED', 'CLOSED')),
  duration_minutes INTEGER NOT NULL,
  started_at TEXT,
  ends_at TEXT,
  created_by_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_for TEXT,
  shuffle_questions INTEGER NOT NULL DEFAULT 0,
  shuffle_answers INTEGER NOT NULL DEFAULT 0,
  generation_mode TEXT NOT NULL DEFAULT 'MANUAL' CHECK (generation_mode IN ('MANUAL', 'RULE_BASED')),
  rules_json TEXT NOT NULL DEFAULT '[]',
  passing_criteria_type TEXT NOT NULL DEFAULT 'PERCENTAGE' CHECK (passing_criteria_type IN ('PERCENTAGE', 'POINTS')),
  passing_threshold INTEGER NOT NULL DEFAULT 40,
  created_at TEXT NOT NULL
);

INSERT INTO exams (
  id,
  class_id,
  is_template,
  source_exam_id,
  title,
  description,
  mode,
  status,
  duration_minutes,
  started_at,
  ends_at,
  created_by_id,
  scheduled_for,
  shuffle_questions,
  shuffle_answers,
  generation_mode,
  rules_json,
  passing_criteria_type,
  passing_threshold,
  created_at
)
SELECT
  id,
  class_id,
  is_template,
  source_exam_id,
  title,
  description,
  mode,
  status,
  duration_minutes,
  started_at,
  ends_at,
  created_by_id,
  scheduled_for,
  shuffle_questions,
  shuffle_answers,
  generation_mode,
  rules_json,
  passing_criteria_type,
  passing_threshold,
  created_at
FROM exams_old;

DROP TABLE exams_old;

CREATE INDEX IF NOT EXISTS idx_exams_class_status
  ON exams (class_id, status);

CREATE INDEX IF NOT EXISTS idx_exams_created_by
  ON exams (created_by_id, created_at DESC);
