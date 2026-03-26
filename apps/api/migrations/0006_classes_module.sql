PRAGMA foreign_keys = OFF;

ALTER TABLE classes ADD COLUMN subject TEXT NOT NULL DEFAULT 'Ерөнхий';
ALTER TABLE classes ADD COLUMN grade INTEGER NOT NULL DEFAULT 0;

PRAGMA foreign_keys = ON;

DELETE FROM answers WHERE attempt_id IN (
  'attempt_math_001', 'attempt_math_002', 'attempt_math_003', 'attempt_math_004',
  'attempt_physics_001', 'attempt_physics_002'
);
DELETE FROM attempts WHERE id IN (
  'attempt_math_001', 'attempt_math_002', 'attempt_math_003', 'attempt_math_004',
  'attempt_physics_001', 'attempt_physics_002'
) OR exam_id = 'exam_001';
DELETE FROM exam_questions WHERE exam_id IN ('exam_001', 'exam_math_001');
DELETE FROM exams WHERE id IN ('exam_001', 'exam_math_001', 'exam_physics_001', 'exam_physics_002', 'exam_biology_001');

UPDATE users
SET full_name = 'Тогтуун', email = 'togtuun@pinequest.dev'
WHERE id = 'user_teacher_001';

INSERT OR IGNORE INTO users (id, full_name, email, role, created_at) VALUES
  ('user_admin_001', 'PineQuest Admin', 'admin@pinequest.dev', 'ADMIN', '2026-03-24T00:00:00.000Z'),
  ('user_teacher_001', 'Тогтуун', 'togtuun@pinequest.dev', 'TEACHER', '2026-03-24T00:01:00.000Z'),
  ('user_teacher_002', 'Саруул', 'saruul@pinequest.dev', 'TEACHER', '2026-03-24T00:02:00.000Z');

WITH RECURSIVE seq(n) AS (
  SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 104
)
INSERT OR IGNORE INTO users (id, full_name, email, role, created_at)
SELECT
  printf('user_student_%03d', n),
  CASE
    WHEN n = 1 THEN 'John Doe'
    WHEN n = 2 THEN 'Jane Smith'
    WHEN n = 3 THEN 'Mike Johnson'
    ELSE printf('Student %03d', n)
  END,
  CASE
    WHEN n = 1 THEN 'john.doe@example.com'
    WHEN n = 2 THEN 'jane.smith@example.com'
    WHEN n = 3 THEN 'mike.johnson@example.com'
    ELSE printf('student%03d@pinequest.dev', n)
  END,
  'STUDENT',
  printf('2026-03-24T01:%02d:00.000Z', (n - 1) % 60)
FROM seq;

INSERT OR REPLACE INTO classes (id, name, description, subject, grade, teacher_id, created_at) VALUES
  ('class_001', 'Математик 101 - А бүлэг', 'Алгебр ба функцийн гүнзгийрүүлсэн анги', 'Математик', 10, 'user_teacher_001', '2026-03-24T02:00:00.000Z'),
  ('class_002', 'Физик (Сонгон)', 'Сонгон хичээлийн анги', 'Физик', 11, 'user_teacher_001', '2026-03-24T02:01:00.000Z'),
  ('class_003', 'Химийн суурь', 'Лабораторит түшиглэсэн хөтөлбөр', 'Хими', 10, 'user_teacher_002', '2026-03-24T02:02:00.000Z'),
  ('class_004', 'Биологи 201', 'Ахисан түвшний биологийн анги', 'Биологи', 12, 'user_teacher_002', '2026-03-24T02:03:00.000Z');

WITH RECURSIVE seq(n) AS (
  SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 104
)
INSERT OR IGNORE INTO class_students (id, class_id, student_id)
SELECT
  printf('enrollment_%03d', n),
  CASE
    WHEN n <= 28 THEN 'class_001'
    WHEN n <= 52 THEN 'class_002'
    WHEN n <= 82 THEN 'class_003'
    ELSE 'class_004'
  END,
  printf('user_student_%03d', n)
FROM seq;

INSERT OR REPLACE INTO question_banks (id, title, description, subject, owner_id, created_at) VALUES
  ('bank_class_math_001', 'Математикийн ангийн шалгалтын сан', 'Ангиудын самбарт ашиглах жишиг асуултууд', 'Математик', 'user_teacher_001', '2026-03-24T03:00:00.000Z');

INSERT OR REPLACE INTO questions (
  id, bank_id, type, title, prompt, options_json, correct_answer, difficulty, tags_json, created_by_id, created_at
) VALUES
  ('question_class_math_001', 'bank_class_math_001', 'MCQ', 'Алгебр 1', '2x + 4 = 14 үед x хэд вэ?', '["3","4","5","6"]', '5', 'EASY', '["Математик","Алгебр"]', 'user_teacher_001', '2026-03-24T03:10:00.000Z'),
  ('question_class_math_002', 'bank_class_math_001', 'MCQ', 'Функц 1', 'f(x)=x^2 бол f(3)-ийн утга хэд вэ?', '["6","9","12","18"]', '9', 'EASY', '["Математик","Функц"]', 'user_teacher_001', '2026-03-24T03:11:00.000Z'),
  ('question_class_math_003', 'bank_class_math_001', 'SHORT_ANSWER', 'Геометр 1', 'Тэгш өнцөгт гурвалжны Пифагорын томъёог бич.', '[]', 'a^2 + b^2 = c^2', 'MEDIUM', '["Математик","Геометр"]', 'user_teacher_001', '2026-03-24T03:12:00.000Z'),
  ('question_class_math_004', 'bank_class_math_001', 'SHORT_ANSWER', 'Магадлал 1', 'Шударга зоос шидэхэд сүлд гарах магадлал хэд вэ?', '[]', '1/2', 'EASY', '["Математик","Магадлал"]', 'user_teacher_001', '2026-03-24T03:13:00.000Z');

INSERT OR REPLACE INTO exams (id, class_id, title, description, mode, status, duration_minutes, created_by_id, created_at) VALUES
  ('exam_math_001', 'class_001', 'Математикийн эцсийн шалгалт', 'Альгебр, функц, геометрийн нэгтгэсэн шалгалт', 'SCHEDULED', 'PUBLISHED', 120, 'user_teacher_001', '2026-03-25T08:00:00.000Z'),
  ('exam_physics_001', 'class_002', 'Физикийн сорил 1', 'Явцын шалгалт', 'SCHEDULED', 'PUBLISHED', 90, 'user_teacher_001', '2026-03-25T08:30:00.000Z'),
  ('exam_physics_002', 'class_002', 'Физикийн сорил 0', 'Өмнөх улирлын сорил', 'SCHEDULED', 'CLOSED', 60, 'user_teacher_001', '2026-03-10T08:30:00.000Z'),
  ('exam_biology_001', 'class_004', 'Биологийн үнэлгээ', 'Эс ба удамшлын сэдэвт шалгалт', 'SCHEDULED', 'PUBLISHED', 75, 'user_teacher_002', '2026-03-26T09:00:00.000Z');

INSERT OR REPLACE INTO exam_questions (id, exam_id, question_id, points, display_order) VALUES
  ('exam_question_class_001', 'exam_math_001', 'question_class_math_001', 25, 1),
  ('exam_question_class_002', 'exam_math_001', 'question_class_math_002', 25, 2),
  ('exam_question_class_003', 'exam_math_001', 'question_class_math_003', 25, 3),
  ('exam_question_class_004', 'exam_math_001', 'question_class_math_004', 25, 4);

INSERT OR REPLACE INTO attempts (
  id, exam_id, student_id, status, auto_score, manual_score, total_score, started_at, submitted_at
) VALUES
  ('attempt_math_001', 'exam_math_001', 'user_student_001', 'SUBMITTED', 58, 0, 58, '2026-03-25T09:00:00.000Z', '2026-03-25T09:44:00.000Z'),
  ('attempt_math_002', 'exam_math_001', 'user_student_002', 'SUBMITTED', 72, 0, 72, '2026-03-25T09:10:00.000Z', '2026-03-25T09:50:00.000Z'),
  ('attempt_math_003', 'exam_math_001', 'user_student_003', 'SUBMITTED', 86, 0, 86, '2026-03-25T09:20:00.000Z', '2026-03-25T09:56:00.000Z'),
  ('attempt_math_004', 'exam_math_001', 'user_student_004', 'IN_PROGRESS', 35, 0, 35, '2026-03-25T10:05:00.000Z', NULL),
  ('attempt_physics_001', 'exam_physics_002', 'user_student_029', 'GRADED', 78, 0, 78, '2026-03-12T08:00:00.000Z', '2026-03-12T08:52:00.000Z'),
  ('attempt_physics_002', 'exam_physics_002', 'user_student_030', 'GRADED', 69, 0, 69, '2026-03-12T08:10:00.000Z', '2026-03-12T08:55:00.000Z');
