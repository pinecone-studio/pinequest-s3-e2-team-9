export const schemaExamTypes = /* GraphQL */ `
  input AttemptReviewAnswerInput {
    answerId: ID!
    manualScore: Float
    feedback: String
  }

  type ExamGenerationRule {
    label: String!
    bankIds: [ID!]!
    repository: QuestionRepositoryFilter
    subject: String
    grade: Int
    topic: String
    subtopics: [String!]!
    difficulty: Difficulty
    count: Int!
    points: Int!
  }

  type ExamDiagnosticConfig {
    enabled: Boolean!
    questionLimit: Int!
    startDifficulty: Difficulty!
    retakeMode: ExamRetakeMode!
  }

  type ExamQuestion {
    id: ID!
    question: Question!
    points: Int!
    order: Int!
  }

  type Exam {
    id: ID!
    class: Class!
    isTemplate: Boolean!
    sourceExamId: ID
    title: String!
    description: String
    mode: ExamMode!
    status: ExamStatus!
    durationMinutes: Int!
    startedAt: String
    endsAt: String
    scheduledFor: String
    shuffleQuestions: Boolean!
    shuffleAnswers: Boolean!
    generationMode: ExamGenerationMode!
    generationRules: [ExamGenerationRule!]!
    diagnosticConfig: ExamDiagnosticConfig
    passingCriteriaType: PassingCriteriaType!
    passingThreshold: Int!
    questions: [ExamQuestion!]!
    createdBy: User!
    attempts: [Attempt!]!
    createdAt: String!
  }

  type Answer {
    id: ID!
    question: Question!
    value: String!
    autoScore: Float
    manualScore: Float
    feedback: String
    createdAt: String!
  }

  type Attempt {
    id: ID!
    exam: Exam!
    student: User!
    status: AttemptStatus!
    isAdaptiveDiagnostic: Boolean!
    questionLimit: Int!
    plannedQuestions: [ExamQuestion!]!
    generationSeed: String
    answers: [Answer!]!
    autoScore: Float!
    manualScore: Float!
    totalScore: Float!
    startedAt: String!
    submittedAt: String
  }
`;
