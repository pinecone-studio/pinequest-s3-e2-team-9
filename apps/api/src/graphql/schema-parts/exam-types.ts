export const schemaExamTypes = /* GraphQL */ `
  input AttemptReviewAnswerInput {
    answerId: ID!
    manualScore: Float
    feedback: String
  }

  type ExamGenerationRule {
    label: String!
    bankIds: [ID!]!
    difficulty: Difficulty
    count: Int!
    points: Int!
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
    generationSeed: String
    answers: [Answer!]!
    autoScore: Float!
    manualScore: Float!
    totalScore: Float!
    startedAt: String!
    submittedAt: String
  }
`;
