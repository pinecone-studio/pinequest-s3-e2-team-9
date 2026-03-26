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

  enum ExamMode {
    SCHEDULED
    OPEN_WINDOW
  }

  enum ExamStatus {
    DRAFT
    PUBLISHED
    CLOSED
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
`;
