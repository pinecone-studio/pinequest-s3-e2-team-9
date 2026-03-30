CREATE TABLE IF NOT EXISTS exam_import_jobs (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_bank_id TEXT REFERENCES question_banks(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL DEFAULT 0,
  source_type TEXT NOT NULL CHECK (source_type IN ('PDF')),
  status TEXT NOT NULL CHECK (status IN ('UPLOADED', 'REVIEW', 'APPROVED', 'FAILED')),
  title TEXT NOT NULL,
  extracted_text TEXT,
  parsed_exam_json TEXT NOT NULL,
  error_message TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_exam_import_jobs_teacher_created
  ON exam_import_jobs (teacher_id, created_at DESC);

CREATE TABLE IF NOT EXISTS exam_import_questions (
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

CREATE INDEX IF NOT EXISTS idx_exam_import_questions_job_order
  ON exam_import_questions (job_id, display_order ASC);
