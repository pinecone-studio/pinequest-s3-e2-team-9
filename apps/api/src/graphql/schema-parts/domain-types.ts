export const schemaDomainTypes = /* GraphQL */ `
  type User {
    id: ID!
    fullName: String!
    email: String!
    role: Role!
    createdAt: String!
    classes: [Class!]!
  }

  type Class {
    id: ID!
    name: String!
    description: String
    subject: String!
    grade: Int!
    teacher: User!
    students: [User!]!
    exams: [Exam!]!
    studentCount: Int!
    assignedExamCount: Int!
    upcomingExamCount: Int!
    completedExamCount: Int!
    averageScore: Float
    studentInsights: [ClassStudentInsight!]!
    examInsights: [ClassExamInsight!]!
    createdAt: String!
  }

  type ClassStudentInsight {
    student: User!
    status: ClassStudentStatus!
    lastActiveAt: String
    averageScore: Float
    suspiciousEventCount: Int!
    integrityRisk: IntegrityRiskLevel!
    lastIntegrityEventAt: String
    integritySignals: [IntegritySignalCount!]!
    integrityEvents: [IntegrityEvent!]!
  }

  type IntegritySignalCount {
    type: AttemptIntegrityEventType!
    severity: IntegritySeverity!
    count: Int!
  }

  type IntegrityEvent {
    id: ID!
    type: AttemptIntegrityEventType!
    severity: IntegritySeverity!
    details: String!
    createdAt: String!
  }

  type ClassExamInsight {
    exam: Exam!
    submittedCount: Int!
    totalStudents: Int!
    progressPercent: Int!
    averageScore: Float
    questionCount: Int!
  }

  type QuestionBank {
    id: ID!
    title: String!
    description: String
    grade: Int!
    subject: String!
    topic: String!
    topics: [String!]!
    visibility: QuestionBankVisibility!
    questionCount: Int!
    owner: User!
    questions: [Question!]!
    createdAt: String!
  }

  type Question {
    id: ID!
    bank: QuestionBank!
    type: QuestionType!
    title: String!
    prompt: String!
    options: [String!]!
    correctAnswer: String
    difficulty: Difficulty!
    tags: [String!]!
    createdBy: User!
    createdAt: String!
  }

  type DashboardMetricSummary {
    pendingReviewCount: Int!
    draftExamCount: Int!
    ongoingExamCount: Int!
    scheduledExamCount: Int!
  }

  type DashboardUpcomingExam {
    id: ID!
    title: String!
    scheduledFor: String!
    questionCount: Int!
    status: ExamStatus!
  }

  type DashboardRecentResult {
    id: ID!
    title: String!
    passCount: Int!
    failCount: Int!
    progressPercent: Int!
    averageScorePercent: Int!
  }

  type DashboardOverview {
    teacherName: String!
    classIds: [ID!]!
    summary: DashboardMetricSummary!
    upcomingExams: [DashboardUpcomingExam!]!
    recentResults: [DashboardRecentResult!]!
  }

  type ExamImportQuestion {
    id: ID!
    order: Int!
    type: QuestionType!
    title: String!
    prompt: String!
    options: [String!]!
    answers: [String!]!
    score: Int!
    difficulty: Difficulty!
    sourcePage: Int
    confidence: Float!
    needsReview: Boolean!
    createdAt: String!
  }

  type ExamImportJob {
    id: ID!
    fileName: String!
    fileSizeBytes: Int!
    sourceType: ExamImportSourceType!
    status: ExamImportJobStatus!
    title: String!
    extractedText: String
    errorMessage: String
    totalQuestions: Int!
    reviewCount: Int!
    questionBank: QuestionBank
    exam: Exam
    createdBy: User!
    questions: [ExamImportQuestion!]!
    createdAt: String!
    updatedAt: String!
  }
`;
