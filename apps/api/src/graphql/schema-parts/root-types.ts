export const schemaRootTypes = /* GraphQL */ `
  type Query {
    health: Health!
    hello(name: String): Hello!
    me: User
    users: [User!]!
    classes: [Class!]!
    class(id: ID!): Class
    questionBanks: [QuestionBank!]!
    questionBank(id: ID!): QuestionBank
    questions(bankId: ID): [Question!]!
    exams: [Exam!]!
    exam(id: ID!): Exam
    attempts: [Attempt!]!
    attempt(id: ID!): Attempt
    dashboardOverview: DashboardOverview!
  }

  type Mutation {
    createClass(name: String!, description: String): Class!
    createQuestionBank(title: String!, description: String): QuestionBank!
    createQuestion(
      bankId: ID!
      type: QuestionType!
      title: String!
      prompt: String!
      options: [String!]
      correctAnswer: String
      difficulty: Difficulty = MEDIUM
      tags: [String!]
    ): Question!
    updateQuestion(
      id: ID!
      type: QuestionType!
      title: String!
      prompt: String!
      options: [String!]
      correctAnswer: String
      difficulty: Difficulty = MEDIUM
      tags: [String!]
    ): Question!
    deleteQuestion(id: ID!): Boolean!
    createExam(
      classId: ID!
      title: String!
      description: String
      mode: ExamMode = SCHEDULED
      durationMinutes: Int!
      scheduledFor: String
    ): Exam!
    assignExamToClass(examId: ID!, classId: ID!): Exam!
    addQuestionToExam(examId: ID!, questionId: ID!, points: Int!): Exam!
    publishExam(examId: ID!): Exam!
    closeExam(examId: ID!): Exam!
    startAttempt(examId: ID!, studentId: ID!): Attempt!
    saveAnswer(attemptId: ID!, questionId: ID!, value: String!): Attempt!
    submitAttempt(attemptId: ID!): Attempt!
  }

  type Health {
    ok: Boolean!
    service: String!
    runtime: String!
  }

  type Hello {
    message: String!
  }
`;
