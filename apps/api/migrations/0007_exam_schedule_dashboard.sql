ALTER TABLE exams ADD COLUMN scheduled_for TEXT;

UPDATE exams
SET scheduled_for = CASE
  WHEN id = 'exam_math_001' THEN '2026-03-25T09:00:00.000Z'
  WHEN id = 'exam_physics_001' THEN '2026-03-28T08:30:00.000Z'
  WHEN id = 'exam_physics_002' THEN '2026-03-10T08:30:00.000Z'
  WHEN id = 'exam_biology_001' THEN '2026-04-20T00:00:00.000Z'
  WHEN id = 'exam_001' THEN '2026-04-02T08:00:00.000Z'
  ELSE created_at
END
WHERE scheduled_for IS NULL;

CREATE INDEX IF NOT EXISTS idx_exams_scheduled_for ON exams(scheduled_for);
