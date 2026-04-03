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
    repositoryKind: QuestionRepositoryKind!
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
    repositoryKind: QuestionRepositoryKind!
    canonicalQuestionId: ID
    forkedFromQuestionId: ID
    type: QuestionType!
    title: String!
    prompt: String!
    options: [String!]!
    correctAnswer: String
    difficulty: Difficulty!
    shareScope: QuestionShareScope!
    requiresAccessRequest: Boolean!
    tags: [String!]!
    createdBy: User!
    createdAt: String!
  }

  type QuestionAccessRequest {
    id: ID!
    question: Question!
    requester: User!
    owner: User!
    status: QuestionAccessRequestStatus!
    createdAt: String!
    reviewedAt: String
  }

  type QuestionRepositorySubjectGroup {
    subject: String!
    grades: [QuestionRepositoryGradeGroup!]!
  }

  type QuestionRepositoryGradeGroup {
    grade: Int!
    topics: [QuestionRepositoryTopicGroup!]!
  }

  type QuestionRepositoryTopicGroup {
    topic: String!
    bankCount: Int!
    questionCount: Int!
    subtopics: [QuestionRepositorySubtopicGroup!]!
  }

  type QuestionRepositorySubtopicGroup {
    name: String!
    questionCount: Int!
    bankIds: [ID!]!
  }

  type CommunityMember {
    id: ID!
    role: CommunityMemberRole!
    joinedAt: String!
    user: User!
  }

  type CommunitySharedBank {
    id: ID!
    status: CommunitySharedBankStatus!
    copyCount: Int!
    ratingCount: Int!
    averageRating: Float!
    viewerRating: Int
    createdAt: String!
    sharedBy: User!
    bank: QuestionBank!
    comments: [CommunityComment!]!
  }

  type CommunityComment {
    id: ID!
    entityType: CommunityCommentEntityType!
    entityId: ID!
    body: String!
    createdAt: String!
    author: User!
  }

  type CommunityContributor {
    user: User!
    role: CommunityMemberRole!
    sharedBankCount: Int!
    sharedExamCount: Int!
    commentCount: Int!
    score: Int!
  }

  type CommunitySharedExam {
    id: ID!
    examId: ID!
    title: String!
    description: String
    subject: String!
    grade: Int!
    className: String!
    status: ExamStatus!
    durationMinutes: Int!
    questionCount: Int!
    attemptCount: Int!
    averageScorePercent: Int!
    ratingCount: Int!
    averageRating: Float!
    viewerRating: Int
    createdAt: String!
    sharedBy: User!
    comments: [CommunityComment!]!
  }

  type CommunityExamPreviewQuestion {
    id: ID!
    order: Int!
    prompt: String!
    type: QuestionType!
    options: [String!]!
    correctAnswer: String
    points: Int!
    topic: String!
    tags: [String!]!
  }

  type CommunityExamPreviewSummary {
    studentCount: Int!
    submittedCount: Int!
    averagePercent: Int!
    passRate: Int!
    highestPercent: Int!
    lowestPercent: Int!
    completionRate: Int!
  }

  type CommunityExamPreviewBar {
    label: String!
    value: Int!
    meta: String!
    note: String
  }

  type CommunityExamPreviewInsight {
    title: String!
    description: String!
    tone: String!
  }

  type CommunityExamPreview {
    examId: ID!
    communityId: ID
    communityName: String
    title: String!
    description: String
    subject: String!
    grade: Int!
    className: String!
    status: ExamStatus!
    durationMinutes: Int!
    questionCount: Int!
    totalPoints: Int!
    passingCriteriaType: PassingCriteriaType!
    passingThreshold: Int!
    createdAt: String!
    sharedAt: String
    sharedBy: User
    questions: [CommunityExamPreviewQuestion!]!
    summary: CommunityExamPreviewSummary!
    scoreDistribution: [CommunityExamPreviewBar!]!
    topicPerformance: [CommunityExamPreviewBar!]!
    questionPerformance: [CommunityExamPreviewBar!]!
    insights: [CommunityExamPreviewInsight!]!
    overallConclusion: String!
  }

  type CommunityHomeStats {
    totalCommunities: Int!
    totalSharedBanks: Int!
    totalCopies: Int!
    activeTeachers: Int!
  }

  type CommunityActivityPoint {
    label: String!
    value: Int!
  }

  type CommunityTrendingBank {
    sharedBankId: ID!
    copyCount: Int!
    communityId: ID!
    communityName: String!
    bank: QuestionBank!
  }

  type CommunityTrendingExam {
    examId: ID!
    title: String!
    subject: String!
    grade: Int!
    attemptCount: Int!
    averageScorePercent: Int!
    createdBy: User!
    communityId: ID
    communityName: String
  }

  type CommunityQuestionInsight {
    questionId: ID!
    prompt: String!
    subject: String!
    grade: Int!
    topic: String!
    bankTitle: String!
    communityId: ID!
    communityName: String!
    attemptCount: Int!
    missRate: Int!
  }

  type CommunityHome {
    stats: CommunityHomeStats!
    weeklyActivity: [CommunityActivityPoint!]!
    trendingBanks: [CommunityTrendingBank!]!
    topExams: [CommunityTrendingExam!]!
    mostMissedQuestions: [CommunityQuestionInsight!]!
  }

  type Community {
    id: ID!
    name: String!
    description: String
    subject: String!
    grade: Int!
    visibility: CommunityVisibility!
    viewerRole: CommunityMemberRole
    memberCount: Int!
    sharedBankCount: Int!
    sharedExamCount: Int!
    owner: User!
    members: [CommunityMember!]!
    sharedBanks: [CommunitySharedBank!]!
    sharedExams: [CommunitySharedExam!]!
    topContributors: [CommunityContributor!]!
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
    sourceExcerpt: String
    sourceBlockId: String
    sourceBboxJson: String
    confidence: Float!
    needsReview: Boolean!
    createdAt: String!
  }

  type ExamImportJob {
    id: ID!
    storageKey: String
    fileName: String!
    fileSizeBytes: Int!
    sourceType: ExamImportSourceType!
    status: ExamImportJobStatus!
    title: String!
    extractedText: String
    extractionJson: String
    classifierJson: String
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
