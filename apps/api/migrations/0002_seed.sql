INSERT OR IGNORE INTO users (id, full_name, email, role, created_at)
VALUES
  ('user_admin_001', 'PineQuest Admin', 'admin@pinequest.dev', 'ADMIN', '2026-03-24T00:00:00.000Z'),
  ('user_teacher_001', 'Anu Teacher', 'anu.teacher@pinequest.dev', 'TEACHER', '2026-03-24T00:01:00.000Z'),
  ('user_student_001', 'Temuulen Student', 'temuulen.student@pinequest.dev', 'STUDENT', '2026-03-24T00:02:00.000Z'),
  ('user_student_002', 'Nomin Student', 'nomin.student@pinequest.dev', 'STUDENT', '2026-03-24T00:03:00.000Z');

INSERT OR IGNORE INTO classes (id, name, description, teacher_id, created_at)
VALUES
  (
    'class_001',
    '10A Physics',
    'Assessment pilot class for PineQuest',
    'user_teacher_001',
    '2026-03-24T00:10:00.000Z'
  );

INSERT OR IGNORE INTO class_students (id, class_id, student_id)
VALUES
  ('enrollment_001', 'class_001', 'user_student_001'),
  ('enrollment_002', 'class_001', 'user_student_002');

INSERT OR IGNORE INTO question_banks (id, title, description, owner_id, created_at)
VALUES
  (
    'bank_001',
    'Physics Midterm Bank',
    'Core mechanics and waves questions',
    'user_teacher_001',
    '2026-03-24T00:20:00.000Z'
  );

INSERT OR IGNORE INTO questions (
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
VALUES
  (
    'question_001',
    'bank_001',
    'MCQ',
    'SI unit of force',
    'Force-iin SI negjiig songono uu.',
    '["Joule","Newton","Pascal","Watt"]',
    'Newton',
    'EASY',
    '["physics","units"]',
    'user_teacher_001',
    '2026-03-24T00:25:00.000Z'
  ),
  (
    'question_002',
    'bank_001',
    'SHORT_ANSWER',
    'State Newton''s second law',
    'Newton-ы 2-р хуулийг товч бичнэ үү.',
    '[]',
    'Force equals mass times acceleration',
    'MEDIUM',
    '["physics","laws"]',
    'user_teacher_001',
    '2026-03-24T00:26:00.000Z'
  );

INSERT OR IGNORE INTO exams (
  id,
  class_id,
  title,
  description,
  mode,
  status,
  duration_minutes,
  created_by_id,
  created_at
)
VALUES
  (
    'exam_001',
    'class_001',
    'Physics Midterm Demo',
    'Scheduled assessment demo',
    'SCHEDULED',
    'PUBLISHED',
    45,
    'user_teacher_001',
    '2026-03-24T00:30:00.000Z'
  );

INSERT OR IGNORE INTO exam_questions (id, exam_id, question_id, points, display_order)
VALUES
  ('exam_question_001', 'exam_001', 'question_001', 5, 1),
  ('exam_question_002', 'exam_001', 'question_002', 10, 2);
