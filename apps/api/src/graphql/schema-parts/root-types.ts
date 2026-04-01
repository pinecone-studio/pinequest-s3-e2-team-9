export const schemaRootTypes = /* GraphQL */ `
  input ExamGenerationRuleInput {
    label: String!
    bankIds: [ID!]!
    difficulty: Difficulty
    count: Int!
    points: Int!
  }

  input UpdateExamDraftQuestionInput {
    questionId: ID!
    points: Int!
  }

  input ExamImportQuestionReviewInput {
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
  }

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
    examImportJobs: [ExamImportJob!]!
    examImportJob(id: ID!): ExamImportJob
    attempts: [Attempt!]!
    attempt(id: ID!): Attempt
    dashboardOverview: DashboardOverview!
  }

  type Mutation {
    createClass(name: String!, description: String): Class!
    createQuestionBank(
      title: String!
      description: String
      grade: Int = 10
      subject: String = "Ерөнхий"
      topic: String = "Ерөнхий"
      visibility: QuestionBankVisibility = PRIVATE
    ): QuestionBank!
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
    createQuestionVariants(sourceQuestionId: ID!, totalVariants: Int! = 4): [Question!]!
    createExamDraftVariants(sourceQuestionId: ID!, totalVariants: Int! = 4): [Question!]!
    groupQuestionsAsVariants(questionIds: [ID!]!): [Question!]!
    deleteQuestion(id: ID!): Boolean!
    createExam(
      classId: ID!
      title: String!
      description: String
      mode: ExamMode = SCHEDULED
      durationMinutes: Int!
      scheduledFor: String
      shuffleQuestions: Boolean = false
      shuffleAnswers: Boolean = false
      generationMode: ExamGenerationMode = MANUAL
      rules: [ExamGenerationRuleInput!]
      passingCriteriaType: PassingCriteriaType = PERCENTAGE
      passingThreshold: Int = 40
    ): Exam!
    assignExamToClass(examId: ID!, classId: ID!): Exam!
    addQuestionToExam(examId: ID!, questionId: ID!, points: Int!): Exam!
    updateExamDraft(
      examId: ID!
      classId: ID!
      title: String!
      description: String
      mode: ExamMode = SCHEDULED
      durationMinutes: Int!
      scheduledFor: String
      shuffleQuestions: Boolean = false
      shuffleAnswers: Boolean = false
      generationMode: ExamGenerationMode = MANUAL
      rules: [ExamGenerationRuleInput!]
      passingCriteriaType: PassingCriteriaType = PERCENTAGE
      passingThreshold: Int = 40
      questionItems: [UpdateExamDraftQuestionInput!]
    ): Exam!
    publishExam(examId: ID!): Exam!
    closeExam(examId: ID!): Exam!
    createExamImportJob(
      fileName: String!
      fileSizeBytes: Int!
      extractedText: String!
      storageKey: String
    ): ExamImportJob!
    approveExamImportJob(
      id: ID!
      classId: ID!
      questions: [ExamImportQuestionReviewInput!]!
    ): ExamImportJob!
    startAttempt(examId: ID!, studentId: ID!): Attempt!
    saveAnswer(attemptId: ID!, questionId: ID!, value: String!): Attempt!
    recordAttemptIntegrityEvent(
      attemptId: ID!
      type: AttemptIntegrityEventType!
      details: String
    ): Boolean!
    reviewAnswer(answerId: ID!, manualScore: Float!, feedback: String): Answer!
    submitAttempt(attemptId: ID!): Attempt!
    reviewAttempt(attemptId: ID!, answers: [AttemptReviewAnswerInput!]!): Attempt!
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
