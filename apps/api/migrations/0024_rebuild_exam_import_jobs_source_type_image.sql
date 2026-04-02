PRAGMA foreign_keys = OFF;

ALTER TABLE exam_import_jobs RENAME TO exam_import_jobs_old_source_type_fix;

CREATE TABLE exam_import_jobs (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_bank_id TEXT REFERENCES question_banks(id) ON DELETE SET NULL,
  exam_id TEXT REFERENCES exams(id) ON DELETE SET NULL,
  storage_key TEXT,
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL DEFAULT 0,
  source_type TEXT NOT NULL CHECK (source_type IN ('PDF', 'IMAGE')),
  status TEXT NOT NULL CHECK (status IN ('UPLOADED', 'PROCESSING', 'REVIEW', 'PUBLISHED', 'FAILED')),
  title TEXT NOT NULL,
  extracted_text TEXT,
  extraction_json TEXT,
  classifier_json TEXT,
  parsed_exam_json TEXT NOT NULL,
  error_message TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT INTO exam_import_jobs (
  id,
  teacher_id,
  question_bank_id,
  exam_id,
  storage_key,
  file_name,
  file_size_bytes,
  source_type,
  status,
  title,
  extracted_text,
  extraction_json,
  classifier_json,
  parsed_exam_json,
  error_message,
  created_at,
  updated_at
)
SELECT
  id,
  teacher_id,
  question_bank_id,
  exam_id,
  storage_key,
  file_name,
  file_size_bytes,
  source_type,
  status,
  title,
  extracted_text,
  extraction_json,
  classifier_json,
  parsed_exam_json,
  error_message,
  created_at,
  updated_at
FROM exam_import_jobs_old_source_type_fix;

DROP TABLE exam_import_jobs_old_source_type_fix;

CREATE INDEX IF NOT EXISTS idx_exam_import_jobs_teacher_created
  ON exam_import_jobs (teacher_id, created_at DESC);

PRAGMA foreign_keys = ON;
