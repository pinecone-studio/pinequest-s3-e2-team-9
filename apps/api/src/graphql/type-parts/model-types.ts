export type Role = "ADMIN" | "TEACHER" | "STUDENT";
export type QuestionBankVisibility = "PRIVATE" | "PUBLIC";
export type QuestionType =
  | "MCQ"
  | "TRUE_FALSE"
  | "SHORT_ANSWER"
  | "ESSAY"
  | "IMAGE_UPLOAD";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type ExamMode = "SCHEDULED" | "OPEN_WINDOW";
export type ExamStatus = "DRAFT" | "PUBLISHED" | "CLOSED";
export type ExamGenerationMode = "MANUAL" | "RULE_BASED";
export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "GRADED";
export type ClassStudentStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type PassingCriteriaType = "PERCENTAGE" | "POINTS";
export type AttemptIntegrityEventType =
  | "TAB_HIDDEN"
  | "WINDOW_BLUR"
  | "FULLSCREEN_EXIT"
  | "PASTE_ATTEMPT"
  | "COPY_ATTEMPT"
  | "BULK_INPUT_BURST"
  | "INACTIVE_THEN_BULK_INPUT";
export type IntegritySeverity = "LOW" | "MEDIUM" | "HIGH";
export type IntegrityRiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type ExamGenerationRule = {
  label: string;
  bankIds: string[];
  difficulty?: Difficulty | null;
  count: number;
  points: number;
};
export type ExamImportJobStatus =
  | "UPLOADED"
  | "PROCESSING"
  | "REVIEW"
  | "PUBLISHED"
  | "FAILED";
export type ExamImportSourceType = "PDF";

export type UserRow = {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  created_at: string;
};

export type ClassRow = {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  grade: number;
  teacher_id: string;
  created_at: string;
};

export type QuestionBankRow = {
  id: string;
  title: string;
  description: string | null;
  grade: number;
  subject: string;
  topic: string;
  visibility: QuestionBankVisibility;
  owner_id: string;
  created_at: string;
};

export type QuestionRow = {
  id: string;
  bank_id: string;
  type: QuestionType;
  title: string;
  prompt: string;
  options_json: string;
  correct_answer: string | null;
  difficulty: Difficulty;
  tags_json: string;
  created_by_id: string;
  created_at: string;
};

export type ExamRow = {
  id: string;
  class_id: string;
  is_template: number;
  source_exam_id: string | null;
  title: string;
  description: string | null;
  mode: ExamMode;
  status: ExamStatus;
  duration_minutes: number;
  started_at: string | null;
  ends_at: string | null;
  created_by_id: string;
  scheduled_for: string | null;
  shuffle_questions: number;
  shuffle_answers: number;
  generation_mode: ExamGenerationMode;
  rules_json: string;
  passing_criteria_type: PassingCriteriaType;
  passing_threshold: number;
  created_at: string;
};

export type ExamQuestionRow = {
  id: string;
  exam_id: string;
  question_id: string;
  points: number;
  display_order: number;
};

export type AttemptRow = {
  id: string;
  exam_id: string;
  student_id: string;
  status: AttemptStatus;
  auto_score: number;
  manual_score: number;
  total_score: number;
  generation_seed: string | null;
  started_at: string;
  submitted_at: string | null;
};

export type AnswerRow = {
  id: string;
  attempt_id: string;
  question_id: string;
  value: string;
  auto_score: number | null;
  manual_score: number | null;
  feedback: string | null;
  created_at: string;
};

export type AttemptIntegrityEventRow = {
  id: string;
  attempt_id: string;
  exam_id: string;
  student_id: string;
  event_type: AttemptIntegrityEventType;
  severity: IntegritySeverity;
  details_json: string;
  created_at: string;
};

export type ExamImportJobRow = {
  id: string;
  teacher_id: string;
  question_bank_id: string | null;
  exam_id: string | null;
  file_name: string;
  file_size_bytes: number;
  source_type: ExamImportSourceType;
  status: ExamImportJobStatus;
  title: string;
  extracted_text: string | null;
  parsed_exam_json: string;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type ExamImportQuestionRow = {
  id: string;
  job_id: string;
  display_order: number;
  type: QuestionType;
  title: string;
  prompt: string;
  options_json: string;
  answers_json: string;
  score: number;
  difficulty: Difficulty;
  source_page: number | null;
  confidence: number;
  needs_review: number;
  created_at: string;
};
