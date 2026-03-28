export const schemaExamTypes = /* GraphQL */ `
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
    autoScore: Int
    manualScore: Int
    feedback: String
    createdAt: String!
  }

  type Attempt {
    id: ID!
    exam: Exam!
    student: User!
    status: AttemptStatus!
    answers: [Answer!]!
    autoScore: Int!
    manualScore: Int!
    totalScore: Int!
    startedAt: String!
    submittedAt: String
  }
`;
