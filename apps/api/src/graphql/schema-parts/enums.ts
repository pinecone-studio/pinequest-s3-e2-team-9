export const schemaEnums = /* GraphQL */ `
  enum Role {
    ADMIN
    TEACHER
    STUDENT
  }

  enum QuestionType {
    MCQ
    TRUE_FALSE
    SHORT_ANSWER
    ESSAY
    IMAGE_UPLOAD
  }

  enum Difficulty {
    EASY
    MEDIUM
    HARD
  }

  enum QuestionShareScope {
    PRIVATE
    COMMUNITY
    PUBLIC
  }

  enum QuestionAccessRequestStatus {
    PENDING
    APPROVED
    REJECTED
  }

  enum QuestionBankVisibility {
    PRIVATE
    PUBLIC
  }

  enum CommunityVisibility {
    PRIVATE
    PUBLIC
  }

  enum CommunityMemberRole {
    OWNER
    MODERATOR
    MEMBER
  }

  enum CommunitySharedBankStatus {
    ACTIVE
    ARCHIVED
    FEATURED
  }

  enum CommunityCommentEntityType {
    SHARED_BANK
    SHARED_EXAM
  }

  enum ExamMode {
    SCHEDULED
    OPEN_WINDOW
    PRACTICE
  }

  enum ExamStatus {
    DRAFT
    PUBLISHED
    CLOSED
  }

  enum ExamGenerationMode {
    MANUAL
    RULE_BASED
  }

  enum AttemptStatus {
    IN_PROGRESS
    SUBMITTED
    GRADED
  }

  enum ClassStudentStatus {
    NOT_STARTED
    IN_PROGRESS
    COMPLETED
  }

  enum PassingCriteriaType {
    PERCENTAGE
    POINTS
  }

  enum AttemptIntegrityEventType {
    TAB_HIDDEN
    WINDOW_BLUR
    FULLSCREEN_EXIT
    PASTE_ATTEMPT
    COPY_ATTEMPT
    BULK_INPUT_BURST
    INACTIVE_THEN_BULK_INPUT
  }

  enum IntegritySeverity {
    LOW
    MEDIUM
    HIGH
  }

  enum IntegrityRiskLevel {
    LOW
    MEDIUM
    HIGH
  }

  enum ExamImportJobStatus {
    UPLOADED
    PROCESSING
    REVIEW
    PUBLISHED
    FAILED
  }

  enum ExamImportSourceType {
    PDF
    IMAGE
  }
`;
