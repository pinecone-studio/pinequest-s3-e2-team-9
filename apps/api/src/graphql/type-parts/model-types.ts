export type Role = "ADMIN" | "TEACHER" | "STUDENT";
export type QuestionBankVisibility = "PRIVATE" | "PUBLIC";
export type CommunityVisibility = "PRIVATE" | "PUBLIC";
export type CommunityMemberRole = "OWNER" | "MODERATOR" | "MEMBER";
export type CommunitySharedBankStatus = "ACTIVE" | "ARCHIVED" | "FEATURED";
export type CommunityCommentEntityType = "SHARED_BANK" | "SHARED_EXAM";
export type CommunityUsageEventType =
  | "CREATE_COMMUNITY"
  | "JOIN_COMMUNITY"
  | "SHARE_BANK"
  | "COPY_BANK";
export type CommunityUsageEntityType = "COMMUNITY" | "SHARED_BANK";
export type QuestionType =
  | "MCQ"
  | "TRUE_FALSE"
  | "SHORT_ANSWER"
  | "ESSAY"
  | "IMAGE_UPLOAD";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type QuestionShareScope = "PRIVATE" | "COMMUNITY" | "PUBLIC";
export type QuestionRepositoryKind = "MINE" | "UNIFIED";
export type QuestionRepositoryFilter = "ALL" | "MINE" | "UNIFIED";
export type QuestionAccessRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ExamMode = "SCHEDULED" | "OPEN_WINDOW" | "PRACTICE";
export type ExamStatus = "DRAFT" | "PUBLISHED" | "CLOSED";
export type ExamGenerationMode = "MANUAL" | "RULE_BASED";
export type ExamRetakeMode = "SAME_POOL" | "RANDOM_VARIANT";
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
  repository?: QuestionRepositoryFilter | null;
  subject?: string | null;
  grade?: number | null;
  topic?: string | null;
  subtopics?: string[];
  difficulty?: Difficulty | null;
  count: number;
  points: number;
};
export type ExamDiagnosticConfig = {
  enabled: boolean;
  questionLimit: number;
  startDifficulty: Difficulty;
  retakeMode: ExamRetakeMode;
};
export type ExamImportJobStatus =
  | "UPLOADED"
  | "PROCESSING"
  | "REVIEW"
  | "PUBLISHED"
  | "FAILED";
export type ExamImportSourceType = "PDF" | "IMAGE";

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

export type CommunityRow = {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  grade: number;
  visibility: CommunityVisibility;
  owner_id: string;
  created_at: string;
};

export type CommunityMemberRow = {
  id: string;
  community_id: string;
  user_id: string;
  role: CommunityMemberRole;
  joined_at: string;
};

export type CommunitySharedBankRow = {
  id: string;
  community_id: string;
  bank_id: string;
  shared_by_id: string;
  status: CommunitySharedBankStatus;
  created_at: string;
};

export type CommunitySharedExamRow = {
  id: string;
  community_id: string;
  exam_id: string;
  shared_by_id: string;
  created_at: string;
};

export type CommunityCommentRow = {
  id: string;
  community_id: string;
  author_user_id: string;
  entity_type: CommunityCommentEntityType;
  entity_id: string;
  body: string;
  created_at: string;
};

export type CommunityRatingRow = {
  id: string;
  community_id: string;
  entity_type: CommunityCommentEntityType;
  entity_id: string;
  user_id: string;
  value: number;
  created_at: string;
  updated_at: string;
};

export type CommunityUsageEventRow = {
  id: string;
  community_id: string;
  actor_user_id: string | null;
  event_type: CommunityUsageEventType;
  entity_type: CommunityUsageEntityType;
  entity_id: string;
  metadata_json: string;
  created_at: string;
};

export type QuestionRow = {
  id: string;
  bank_id: string;
  canonical_question_id: string | null;
  forked_from_question_id: string | null;
  type: QuestionType;
  title: string;
  prompt: string;
  options_json: string;
  correct_answer: string | null;
  difficulty: Difficulty;
  share_scope: QuestionShareScope;
  requires_access_request: number;
  tags_json: string;
  created_by_id: string;
  created_at: string;
};

export type QuestionAccessRequestRow = {
  id: string;
  question_id: string;
  requester_user_id: string;
  owner_user_id: string;
  status: QuestionAccessRequestStatus;
  created_at: string;
  reviewed_at: string | null;
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
  storage_key: string | null;
  file_name: string;
  file_size_bytes: number;
  source_type: ExamImportSourceType;
  status: ExamImportJobStatus;
  title: string;
  extracted_text: string | null;
  extraction_json: string | null;
  classifier_json: string | null;
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
  source_excerpt: string | null;
  source_block_id: string | null;
  source_bbox_json: string | null;
  confidence: number;
  needs_review: number;
  created_at: string;
};
