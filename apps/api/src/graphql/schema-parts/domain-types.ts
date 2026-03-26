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
    subject: String!
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
    summary: DashboardMetricSummary!
    upcomingExams: [DashboardUpcomingExam!]!
    recentResults: [DashboardRecentResult!]!
  }
`;
