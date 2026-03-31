CREATE TABLE IF NOT EXISTS attempt_integrity_events (
  id TEXT PRIMARY KEY,
  attempt_id TEXT NOT NULL,
  exam_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'TAB_HIDDEN',
      'WINDOW_BLUR',
      'FULLSCREEN_EXIT',
      'PASTE_ATTEMPT',
      'COPY_ATTEMPT',
      'BULK_INPUT_BURST',
      'INACTIVE_THEN_BULK_INPUT'
    )
  ),
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH')),
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_attempt_integrity_events_attempt_id
  ON attempt_integrity_events(attempt_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_attempt_integrity_events_exam_id
  ON attempt_integrity_events(exam_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_attempt_integrity_events_student_id
  ON attempt_integrity_events(student_id, created_at DESC);
