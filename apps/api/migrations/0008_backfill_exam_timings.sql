UPDATE exams
SET started_at = COALESCE(started_at, scheduled_for, created_at)
WHERE status IN ('PUBLISHED', 'CLOSED') AND started_at IS NULL;

UPDATE exams
SET ends_at = STRFTIME(
  '%Y-%m-%dT%H:%M:%fZ',
  DATETIME(started_at, printf('+%d minutes', duration_minutes))
)
WHERE status IN ('PUBLISHED', 'CLOSED')
  AND started_at IS NOT NULL
  AND ends_at IS NULL;
