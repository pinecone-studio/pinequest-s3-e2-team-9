export const schemaRootTypes = /* GraphQL */ `
  input ExamGenerationRuleInput {
    label: String!
    bankIds: [ID!]
    repository: QuestionRepositoryFilter = ALL
    subject: String
    grade: Int
    topic: String
    subtopics: [String!]
    difficulty: Difficulty
    count: Int!
    points: Int!
  }

  input ExamDiagnosticConfigInput {
    enabled: Boolean = false
    questionLimit: Int = 10
    startDifficulty: Difficulty = MEDIUM
    retakeMode: ExamRetakeMode = RANDOM_VARIANT
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
    sourceExcerpt: String
    sourceBlockId: String
    sourceBboxJson: String
    confidence: Float!
    needsReview: Boolean!
  }

  type Query {
    health: Health!
    hello(name: String): Hello!
    me: User
    users: [User!]!
    communityHome: CommunityHome!
    communities: [Community!]!
    community(id: ID!): Community
    communityExamPreview(examId: ID!, communityId: ID): CommunityExamPreview
    classes: [Class!]!
    class(id: ID!): Class
    questionBanks(repository: QuestionRepositoryFilter = ALL): [QuestionBank!]!
    questionBank(id: ID!): QuestionBank
    questions(bankId: ID, repository: QuestionRepositoryFilter = ALL): [Question!]!
    questionRepositoryTree(
      repository: QuestionRepositoryFilter = ALL
    ): [QuestionRepositorySubjectGroup!]!
    questionAccessRequests: [QuestionAccessRequest!]!
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
    createCommunity(
      name: String!
      description: String
      subject: String = "Ерөнхий"
      grade: Int = 0
      visibility: CommunityVisibility = PUBLIC
    ): Community!
    joinCommunity(communityId: ID!): Community!
    shareQuestionBankToCommunity(communityId: ID!, bankId: ID!): CommunitySharedBank!
    shareExamToCommunity(communityId: ID!, examId: ID!): CommunitySharedExam!
    addCommunityComment(
      communityId: ID!
      entityType: CommunityCommentEntityType!
      entityId: ID!
      body: String!
    ): CommunityComment!
    rateCommunityItem(
      communityId: ID!
      entityType: CommunityCommentEntityType!
      entityId: ID!
      value: Int!
    ): Boolean!
    copyCommunitySharedBankToMyBank(sharedBankId: ID!): QuestionBank!
    requestQuestionAccess(questionId: ID!): QuestionAccessRequest!
    reviewQuestionAccessRequest(requestId: ID!, approve: Boolean!): QuestionAccessRequest!
    forkQuestionToMyBank(questionId: ID!, targetBankId: ID!): Question!
    createQuestionBank(
      title: String!
      description: String
      grade: Int = 10
      subject: String = "Ерөнхий"
      topic: String = "Ерөнхий"
      repositoryKind: QuestionRepositoryKind = MINE
      visibility: QuestionBankVisibility = PRIVATE
    ): QuestionBank!
    createQuestion(
      bankId: ID
      grade: Int
      subject: String
      topic: String
      type: QuestionType!
      title: String!
      prompt: String!
      options: [String!]
      correctAnswer: String
      difficulty: Difficulty = MEDIUM
      repositoryKind: QuestionRepositoryKind
      shareScope: QuestionShareScope = PRIVATE
      requiresAccessRequest: Boolean = false
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
      repositoryKind: QuestionRepositoryKind
      shareScope: QuestionShareScope
      requiresAccessRequest: Boolean
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
      diagnosticConfig: ExamDiagnosticConfigInput
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
      diagnosticConfig: ExamDiagnosticConfigInput
      passingCriteriaType: PassingCriteriaType = PERCENTAGE
      passingThreshold: Int = 40
      questionItems: [UpdateExamDraftQuestionInput!]
    ): Exam!
    deleteExam(examId: ID!): Boolean!
    publishExam(examId: ID!): Exam!
    closeExam(examId: ID!): Exam!
    createExamImportJob(
      fileName: String!
      fileSizeBytes: Int!
      extractedText: String!
      sourceType: ExamImportSourceType!
      storageKey: String
      extractionJson: String
      classifierJson: String
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
