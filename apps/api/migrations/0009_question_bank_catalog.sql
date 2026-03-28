PRAGMA foreign_keys = OFF;

ALTER TABLE question_banks
ADD COLUMN grade INTEGER NOT NULL DEFAULT 10;

ALTER TABLE question_banks
ADD COLUMN topic TEXT NOT NULL DEFAULT 'Ерөнхий';

ALTER TABLE question_banks
ADD COLUMN visibility TEXT NOT NULL DEFAULT 'PRIVATE' CHECK (visibility IN ('PRIVATE', 'PUBLIC'));

PRAGMA foreign_keys = ON;

UPDATE question_banks
SET visibility = 'PUBLIC'
WHERE id IN (
  'bank_class_math_001',
  'bank-math-10',
  'bank-mn-10',
  'bank-physics-10'
);

CREATE INDEX IF NOT EXISTS idx_question_banks_visibility ON question_banks(visibility);
CREATE INDEX IF NOT EXISTS idx_question_banks_grade ON question_banks(grade);
CREATE INDEX IF NOT EXISTS idx_question_banks_subject ON question_banks(subject);
CREATE INDEX IF NOT EXISTS idx_question_banks_topic ON question_banks(topic);
