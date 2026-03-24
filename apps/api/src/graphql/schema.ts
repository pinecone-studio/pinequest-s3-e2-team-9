export const schemaSource = /* GraphQL */ `
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

  type Query {
    health: Health!
    hello(name: String): Hello!
    me: User!
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
    createExam(
      classId: ID!
      title: String!
      description: String
      mode: ExamMode = SCHEDULED
      durationMinutes: Int!
    ): Exam!
    addQuestionToExam(examId: ID!, questionId: ID!, points: Int!): Exam!
    publishExam(examId: ID!): Exam!
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
    teacher: User!
    students: [User!]!
    exams: [Exam!]!
    createdAt: String!
  }

  type QuestionBank {
    id: ID!
    title: String!
    description: String
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

  type ExamQuestion {
    id: ID!
    question: Question!
    points: Int!
    order: Int!
  }

  type Exam {
    id: ID!
    class: Class!
    title: String!
    description: String
    mode: ExamMode!
    status: ExamStatus!
    durationMinutes: Int!
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
