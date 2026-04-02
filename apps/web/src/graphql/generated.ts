import { gql } from '@apollo/client';
import * as ApolloReactCommon from '../lib/apollo-codegen';
import * as ApolloReactHooks from '../lib/apollo-codegen';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Answer = {
  __typename?: 'Answer';
  autoScore?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['String']['output'];
  feedback?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  manualScore?: Maybe<Scalars['Float']['output']>;
  question: Question;
  value: Scalars['String']['output'];
};

export type Attempt = {
  __typename?: 'Attempt';
  answers: Array<Answer>;
  autoScore: Scalars['Float']['output'];
  exam: Exam;
  generationSeed?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  manualScore: Scalars['Float']['output'];
  startedAt: Scalars['String']['output'];
  status: AttemptStatus;
  student: User;
  submittedAt?: Maybe<Scalars['String']['output']>;
  totalScore: Scalars['Float']['output'];
};

export enum AttemptIntegrityEventType {
  BulkInputBurst = 'BULK_INPUT_BURST',
  CopyAttempt = 'COPY_ATTEMPT',
  FullscreenExit = 'FULLSCREEN_EXIT',
  InactiveThenBulkInput = 'INACTIVE_THEN_BULK_INPUT',
  PasteAttempt = 'PASTE_ATTEMPT',
  TabHidden = 'TAB_HIDDEN',
  WindowBlur = 'WINDOW_BLUR'
}

export type AttemptReviewAnswerInput = {
  answerId: Scalars['ID']['input'];
  feedback?: InputMaybe<Scalars['String']['input']>;
  manualScore?: InputMaybe<Scalars['Float']['input']>;
};

export enum AttemptStatus {
  Graded = 'GRADED',
  InProgress = 'IN_PROGRESS',
  Submitted = 'SUBMITTED'
}

export type Class = {
  __typename?: 'Class';
  assignedExamCount: Scalars['Int']['output'];
  averageScore?: Maybe<Scalars['Float']['output']>;
  completedExamCount: Scalars['Int']['output'];
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  examInsights: Array<ClassExamInsight>;
  exams: Array<Exam>;
  grade: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  studentCount: Scalars['Int']['output'];
  studentInsights: Array<ClassStudentInsight>;
  students: Array<User>;
  subject: Scalars['String']['output'];
  teacher: User;
  upcomingExamCount: Scalars['Int']['output'];
};

export type ClassExamInsight = {
  __typename?: 'ClassExamInsight';
  averageScore?: Maybe<Scalars['Float']['output']>;
  exam: Exam;
  progressPercent: Scalars['Int']['output'];
  questionCount: Scalars['Int']['output'];
  submittedCount: Scalars['Int']['output'];
  totalStudents: Scalars['Int']['output'];
};

export type ClassStudentInsight = {
  __typename?: 'ClassStudentInsight';
  averageScore?: Maybe<Scalars['Float']['output']>;
  integrityEvents: Array<IntegrityEvent>;
  integrityRisk: IntegrityRiskLevel;
  integritySignals: Array<IntegritySignalCount>;
  lastActiveAt?: Maybe<Scalars['String']['output']>;
  lastIntegrityEventAt?: Maybe<Scalars['String']['output']>;
  status: ClassStudentStatus;
  student: User;
  suspiciousEventCount: Scalars['Int']['output'];
};

export enum ClassStudentStatus {
  Completed = 'COMPLETED',
  InProgress = 'IN_PROGRESS',
  NotStarted = 'NOT_STARTED'
}

export type Community = {
  __typename?: 'Community';
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  grade: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  memberCount: Scalars['Int']['output'];
  members: Array<CommunityMember>;
  name: Scalars['String']['output'];
  owner: User;
  sharedBankCount: Scalars['Int']['output'];
  sharedBanks: Array<CommunitySharedBank>;
  sharedExamCount: Scalars['Int']['output'];
  sharedExams: Array<CommunitySharedExam>;
  subject: Scalars['String']['output'];
  topContributors: Array<CommunityContributor>;
  viewerRole?: Maybe<CommunityMemberRole>;
  visibility: CommunityVisibility;
};

export type CommunityActivityPoint = {
  __typename?: 'CommunityActivityPoint';
  label: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type CommunityComment = {
  __typename?: 'CommunityComment';
  author: User;
  body: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  entityId: Scalars['ID']['output'];
  entityType: CommunityCommentEntityType;
  id: Scalars['ID']['output'];
};

export enum CommunityCommentEntityType {
  SharedBank = 'SHARED_BANK',
  SharedExam = 'SHARED_EXAM'
}

export type CommunityContributor = {
  __typename?: 'CommunityContributor';
  commentCount: Scalars['Int']['output'];
  role: CommunityMemberRole;
  score: Scalars['Int']['output'];
  sharedBankCount: Scalars['Int']['output'];
  sharedExamCount: Scalars['Int']['output'];
  user: User;
};

export type CommunityExamPreview = {
  __typename?: 'CommunityExamPreview';
  className: Scalars['String']['output'];
  communityId?: Maybe<Scalars['ID']['output']>;
  communityName?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  durationMinutes: Scalars['Int']['output'];
  examId: Scalars['ID']['output'];
  grade: Scalars['Int']['output'];
  insights: Array<CommunityExamPreviewInsight>;
  overallConclusion: Scalars['String']['output'];
  passingCriteriaType: PassingCriteriaType;
  passingThreshold: Scalars['Int']['output'];
  questionCount: Scalars['Int']['output'];
  questionPerformance: Array<CommunityExamPreviewBar>;
  questions: Array<CommunityExamPreviewQuestion>;
  scoreDistribution: Array<CommunityExamPreviewBar>;
  sharedAt?: Maybe<Scalars['String']['output']>;
  sharedBy?: Maybe<User>;
  status: ExamStatus;
  subject: Scalars['String']['output'];
  summary: CommunityExamPreviewSummary;
  title: Scalars['String']['output'];
  topicPerformance: Array<CommunityExamPreviewBar>;
  totalPoints: Scalars['Int']['output'];
};

export type CommunityExamPreviewBar = {
  __typename?: 'CommunityExamPreviewBar';
  label: Scalars['String']['output'];
  meta: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  value: Scalars['Int']['output'];
};

export type CommunityExamPreviewInsight = {
  __typename?: 'CommunityExamPreviewInsight';
  description: Scalars['String']['output'];
  title: Scalars['String']['output'];
  tone: Scalars['String']['output'];
};

export type CommunityExamPreviewQuestion = {
  __typename?: 'CommunityExamPreviewQuestion';
  correctAnswer?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  options: Array<Scalars['String']['output']>;
  order: Scalars['Int']['output'];
  points: Scalars['Int']['output'];
  prompt: Scalars['String']['output'];
  tags: Array<Scalars['String']['output']>;
  topic: Scalars['String']['output'];
  type: QuestionType;
};

export type CommunityExamPreviewSummary = {
  __typename?: 'CommunityExamPreviewSummary';
  averagePercent: Scalars['Int']['output'];
  completionRate: Scalars['Int']['output'];
  highestPercent: Scalars['Int']['output'];
  lowestPercent: Scalars['Int']['output'];
  passRate: Scalars['Int']['output'];
  studentCount: Scalars['Int']['output'];
  submittedCount: Scalars['Int']['output'];
};

export type CommunityHome = {
  __typename?: 'CommunityHome';
  mostMissedQuestions: Array<CommunityQuestionInsight>;
  stats: CommunityHomeStats;
  topExams: Array<CommunityTrendingExam>;
  trendingBanks: Array<CommunityTrendingBank>;
  weeklyActivity: Array<CommunityActivityPoint>;
};

export type CommunityHomeStats = {
  __typename?: 'CommunityHomeStats';
  activeTeachers: Scalars['Int']['output'];
  totalCommunities: Scalars['Int']['output'];
  totalCopies: Scalars['Int']['output'];
  totalSharedBanks: Scalars['Int']['output'];
};

export type CommunityMember = {
  __typename?: 'CommunityMember';
  id: Scalars['ID']['output'];
  joinedAt: Scalars['String']['output'];
  role: CommunityMemberRole;
  user: User;
};

export enum CommunityMemberRole {
  Member = 'MEMBER',
  Moderator = 'MODERATOR',
  Owner = 'OWNER'
}

export type CommunityQuestionInsight = {
  __typename?: 'CommunityQuestionInsight';
  attemptCount: Scalars['Int']['output'];
  bankTitle: Scalars['String']['output'];
  communityId: Scalars['ID']['output'];
  communityName: Scalars['String']['output'];
  grade: Scalars['Int']['output'];
  missRate: Scalars['Int']['output'];
  prompt: Scalars['String']['output'];
  questionId: Scalars['ID']['output'];
  subject: Scalars['String']['output'];
  topic: Scalars['String']['output'];
};

export type CommunitySharedBank = {
  __typename?: 'CommunitySharedBank';
  averageRating: Scalars['Float']['output'];
  bank: QuestionBank;
  comments: Array<CommunityComment>;
  copyCount: Scalars['Int']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  ratingCount: Scalars['Int']['output'];
  sharedBy: User;
  status: CommunitySharedBankStatus;
  viewerRating?: Maybe<Scalars['Int']['output']>;
};

export enum CommunitySharedBankStatus {
  Active = 'ACTIVE',
  Archived = 'ARCHIVED',
  Featured = 'FEATURED'
}

export type CommunitySharedExam = {
  __typename?: 'CommunitySharedExam';
  attemptCount: Scalars['Int']['output'];
  averageRating: Scalars['Float']['output'];
  averageScorePercent: Scalars['Int']['output'];
  className: Scalars['String']['output'];
  comments: Array<CommunityComment>;
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  durationMinutes: Scalars['Int']['output'];
  examId: Scalars['ID']['output'];
  grade: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  questionCount: Scalars['Int']['output'];
  ratingCount: Scalars['Int']['output'];
  sharedBy: User;
  status: ExamStatus;
  subject: Scalars['String']['output'];
  title: Scalars['String']['output'];
  viewerRating?: Maybe<Scalars['Int']['output']>;
};

export type CommunityTrendingBank = {
  __typename?: 'CommunityTrendingBank';
  bank: QuestionBank;
  communityId: Scalars['ID']['output'];
  communityName: Scalars['String']['output'];
  copyCount: Scalars['Int']['output'];
  sharedBankId: Scalars['ID']['output'];
};

export type CommunityTrendingExam = {
  __typename?: 'CommunityTrendingExam';
  attemptCount: Scalars['Int']['output'];
  averageScorePercent: Scalars['Int']['output'];
  communityId?: Maybe<Scalars['ID']['output']>;
  communityName?: Maybe<Scalars['String']['output']>;
  createdBy: User;
  examId: Scalars['ID']['output'];
  grade: Scalars['Int']['output'];
  subject: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export enum CommunityVisibility {
  Private = 'PRIVATE',
  Public = 'PUBLIC'
}

export type DashboardMetricSummary = {
  __typename?: 'DashboardMetricSummary';
  draftExamCount: Scalars['Int']['output'];
  ongoingExamCount: Scalars['Int']['output'];
  pendingReviewCount: Scalars['Int']['output'];
  scheduledExamCount: Scalars['Int']['output'];
};

export type DashboardOverview = {
  __typename?: 'DashboardOverview';
  classIds: Array<Scalars['ID']['output']>;
  recentResults: Array<DashboardRecentResult>;
  summary: DashboardMetricSummary;
  teacherName: Scalars['String']['output'];
  upcomingExams: Array<DashboardUpcomingExam>;
};

export type DashboardRecentResult = {
  __typename?: 'DashboardRecentResult';
  averageScorePercent: Scalars['Int']['output'];
  failCount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  passCount: Scalars['Int']['output'];
  progressPercent: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export type DashboardUpcomingExam = {
  __typename?: 'DashboardUpcomingExam';
  id: Scalars['ID']['output'];
  questionCount: Scalars['Int']['output'];
  scheduledFor: Scalars['String']['output'];
  status: ExamStatus;
  title: Scalars['String']['output'];
};

export enum Difficulty {
  Easy = 'EASY',
  Hard = 'HARD',
  Medium = 'MEDIUM'
}

export type Exam = {
  __typename?: 'Exam';
  attempts: Array<Attempt>;
  class: Class;
  createdAt: Scalars['String']['output'];
  createdBy: User;
  description?: Maybe<Scalars['String']['output']>;
  durationMinutes: Scalars['Int']['output'];
  endsAt?: Maybe<Scalars['String']['output']>;
  generationMode: ExamGenerationMode;
  generationRules: Array<ExamGenerationRule>;
  id: Scalars['ID']['output'];
  isTemplate: Scalars['Boolean']['output'];
  mode: ExamMode;
  passingCriteriaType: PassingCriteriaType;
  passingThreshold: Scalars['Int']['output'];
  questions: Array<ExamQuestion>;
  scheduledFor?: Maybe<Scalars['String']['output']>;
  shuffleAnswers: Scalars['Boolean']['output'];
  shuffleQuestions: Scalars['Boolean']['output'];
  sourceExamId?: Maybe<Scalars['ID']['output']>;
  startedAt?: Maybe<Scalars['String']['output']>;
  status: ExamStatus;
  title: Scalars['String']['output'];
};

export enum ExamGenerationMode {
  Manual = 'MANUAL',
  RuleBased = 'RULE_BASED'
}

export type ExamGenerationRule = {
  __typename?: 'ExamGenerationRule';
  bankIds: Array<Scalars['ID']['output']>;
  count: Scalars['Int']['output'];
  difficulty?: Maybe<Difficulty>;
  label: Scalars['String']['output'];
  points: Scalars['Int']['output'];
};

export type ExamGenerationRuleInput = {
  bankIds: Array<Scalars['ID']['input']>;
  count: Scalars['Int']['input'];
  difficulty?: InputMaybe<Difficulty>;
  label: Scalars['String']['input'];
  points: Scalars['Int']['input'];
};

export type ExamImportJob = {
  __typename?: 'ExamImportJob';
  classifierJson?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  createdBy: User;
  errorMessage?: Maybe<Scalars['String']['output']>;
  exam?: Maybe<Exam>;
  extractedText?: Maybe<Scalars['String']['output']>;
  extractionJson?: Maybe<Scalars['String']['output']>;
  fileName: Scalars['String']['output'];
  fileSizeBytes: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  questionBank?: Maybe<QuestionBank>;
  questions: Array<ExamImportQuestion>;
  reviewCount: Scalars['Int']['output'];
  sourceType: ExamImportSourceType;
  status: ExamImportJobStatus;
  storageKey?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  totalQuestions: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
};

export enum ExamImportJobStatus {
  Failed = 'FAILED',
  Processing = 'PROCESSING',
  Published = 'PUBLISHED',
  Review = 'REVIEW',
  Uploaded = 'UPLOADED'
}

export type ExamImportQuestion = {
  __typename?: 'ExamImportQuestion';
  answers: Array<Scalars['String']['output']>;
  confidence: Scalars['Float']['output'];
  createdAt: Scalars['String']['output'];
  difficulty: Difficulty;
  id: Scalars['ID']['output'];
  needsReview: Scalars['Boolean']['output'];
  options: Array<Scalars['String']['output']>;
  order: Scalars['Int']['output'];
  prompt: Scalars['String']['output'];
  score: Scalars['Int']['output'];
  sourceBboxJson?: Maybe<Scalars['String']['output']>;
  sourceBlockId?: Maybe<Scalars['String']['output']>;
  sourceExcerpt?: Maybe<Scalars['String']['output']>;
  sourcePage?: Maybe<Scalars['Int']['output']>;
  title: Scalars['String']['output'];
  type: QuestionType;
};

export type ExamImportQuestionReviewInput = {
  answers: Array<Scalars['String']['input']>;
  confidence: Scalars['Float']['input'];
  difficulty: Difficulty;
  id: Scalars['ID']['input'];
  needsReview: Scalars['Boolean']['input'];
  options: Array<Scalars['String']['input']>;
  order: Scalars['Int']['input'];
  prompt: Scalars['String']['input'];
  score: Scalars['Int']['input'];
  sourceBboxJson?: InputMaybe<Scalars['String']['input']>;
  sourceBlockId?: InputMaybe<Scalars['String']['input']>;
  sourceExcerpt?: InputMaybe<Scalars['String']['input']>;
  sourcePage?: InputMaybe<Scalars['Int']['input']>;
  title: Scalars['String']['input'];
  type: QuestionType;
};

export enum ExamImportSourceType {
  Image = 'IMAGE',
  Pdf = 'PDF'
}

export enum ExamMode {
  OpenWindow = 'OPEN_WINDOW',
  Practice = 'PRACTICE',
  Scheduled = 'SCHEDULED'
}

export type ExamQuestion = {
  __typename?: 'ExamQuestion';
  id: Scalars['ID']['output'];
  order: Scalars['Int']['output'];
  points: Scalars['Int']['output'];
  question: Question;
};

export enum ExamStatus {
  Closed = 'CLOSED',
  Draft = 'DRAFT',
  Published = 'PUBLISHED'
}

export type Health = {
  __typename?: 'Health';
  ok: Scalars['Boolean']['output'];
  runtime: Scalars['String']['output'];
  service: Scalars['String']['output'];
};

export type Hello = {
  __typename?: 'Hello';
  message: Scalars['String']['output'];
};

export type IntegrityEvent = {
  __typename?: 'IntegrityEvent';
  createdAt: Scalars['String']['output'];
  details: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  severity: IntegritySeverity;
  type: AttemptIntegrityEventType;
};

export enum IntegrityRiskLevel {
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM'
}

export enum IntegritySeverity {
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM'
}

export type IntegritySignalCount = {
  __typename?: 'IntegritySignalCount';
  count: Scalars['Int']['output'];
  severity: IntegritySeverity;
  type: AttemptIntegrityEventType;
};

export type Mutation = {
  __typename?: 'Mutation';
  addCommunityComment: CommunityComment;
  addQuestionToExam: Exam;
  approveExamImportJob: ExamImportJob;
  assignExamToClass: Exam;
  closeExam: Exam;
  copyCommunitySharedBankToMyBank: QuestionBank;
  createClass: Class;
  createCommunity: Community;
  createExam: Exam;
  createExamDraftVariants: Array<Question>;
  createExamImportJob: ExamImportJob;
  createQuestion: Question;
  createQuestionBank: QuestionBank;
  createQuestionVariants: Array<Question>;
  deleteQuestion: Scalars['Boolean']['output'];
  forkQuestionToMyBank: Question;
  groupQuestionsAsVariants: Array<Question>;
  joinCommunity: Community;
  publishExam: Exam;
  rateCommunityItem: Scalars['Boolean']['output'];
  recordAttemptIntegrityEvent: Scalars['Boolean']['output'];
  requestQuestionAccess: QuestionAccessRequest;
  reviewAnswer: Answer;
  reviewAttempt: Attempt;
  reviewQuestionAccessRequest: QuestionAccessRequest;
  saveAnswer: Attempt;
  shareExamToCommunity: CommunitySharedExam;
  shareQuestionBankToCommunity: CommunitySharedBank;
  startAttempt: Attempt;
  submitAttempt: Attempt;
  updateExamDraft: Exam;
  updateQuestion: Question;
};


export type MutationAddCommunityCommentArgs = {
  body: Scalars['String']['input'];
  communityId: Scalars['ID']['input'];
  entityId: Scalars['ID']['input'];
  entityType: CommunityCommentEntityType;
};


export type MutationAddQuestionToExamArgs = {
  examId: Scalars['ID']['input'];
  points: Scalars['Int']['input'];
  questionId: Scalars['ID']['input'];
};


export type MutationApproveExamImportJobArgs = {
  classId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  questions: Array<ExamImportQuestionReviewInput>;
};


export type MutationAssignExamToClassArgs = {
  classId: Scalars['ID']['input'];
  examId: Scalars['ID']['input'];
};


export type MutationCloseExamArgs = {
  examId: Scalars['ID']['input'];
};


export type MutationCopyCommunitySharedBankToMyBankArgs = {
  sharedBankId: Scalars['ID']['input'];
};


export type MutationCreateClassArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationCreateCommunityArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  grade?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  subject?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<CommunityVisibility>;
};


export type MutationCreateExamArgs = {
  classId: Scalars['ID']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  durationMinutes: Scalars['Int']['input'];
  generationMode?: InputMaybe<ExamGenerationMode>;
  mode?: InputMaybe<ExamMode>;
  passingCriteriaType?: InputMaybe<PassingCriteriaType>;
  passingThreshold?: InputMaybe<Scalars['Int']['input']>;
  rules?: InputMaybe<Array<ExamGenerationRuleInput>>;
  scheduledFor?: InputMaybe<Scalars['String']['input']>;
  shuffleAnswers?: InputMaybe<Scalars['Boolean']['input']>;
  shuffleQuestions?: InputMaybe<Scalars['Boolean']['input']>;
  title: Scalars['String']['input'];
};


export type MutationCreateExamDraftVariantsArgs = {
  sourceQuestionId: Scalars['ID']['input'];
  totalVariants?: Scalars['Int']['input'];
};


export type MutationCreateExamImportJobArgs = {
  classifierJson?: InputMaybe<Scalars['String']['input']>;
  extractedText: Scalars['String']['input'];
  extractionJson?: InputMaybe<Scalars['String']['input']>;
  fileName: Scalars['String']['input'];
  fileSizeBytes: Scalars['Int']['input'];
  sourceType: ExamImportSourceType;
  storageKey?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateQuestionArgs = {
  bankId: Scalars['ID']['input'];
  correctAnswer?: InputMaybe<Scalars['String']['input']>;
  difficulty?: InputMaybe<Difficulty>;
  options?: InputMaybe<Array<Scalars['String']['input']>>;
  prompt: Scalars['String']['input'];
  requiresAccessRequest?: InputMaybe<Scalars['Boolean']['input']>;
  shareScope?: InputMaybe<QuestionShareScope>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title: Scalars['String']['input'];
  type: QuestionType;
};


export type MutationCreateQuestionBankArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  grade?: InputMaybe<Scalars['Int']['input']>;
  subject?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  topic?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<QuestionBankVisibility>;
};


export type MutationCreateQuestionVariantsArgs = {
  sourceQuestionId: Scalars['ID']['input'];
  totalVariants?: Scalars['Int']['input'];
};


export type MutationDeleteQuestionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationForkQuestionToMyBankArgs = {
  questionId: Scalars['ID']['input'];
  targetBankId: Scalars['ID']['input'];
};


export type MutationGroupQuestionsAsVariantsArgs = {
  questionIds: Array<Scalars['ID']['input']>;
};


export type MutationJoinCommunityArgs = {
  communityId: Scalars['ID']['input'];
};


export type MutationPublishExamArgs = {
  examId: Scalars['ID']['input'];
};


export type MutationRateCommunityItemArgs = {
  communityId: Scalars['ID']['input'];
  entityId: Scalars['ID']['input'];
  entityType: CommunityCommentEntityType;
  value: Scalars['Int']['input'];
};


export type MutationRecordAttemptIntegrityEventArgs = {
  attemptId: Scalars['ID']['input'];
  details?: InputMaybe<Scalars['String']['input']>;
  type: AttemptIntegrityEventType;
};


export type MutationRequestQuestionAccessArgs = {
  questionId: Scalars['ID']['input'];
};


export type MutationReviewAnswerArgs = {
  answerId: Scalars['ID']['input'];
  feedback?: InputMaybe<Scalars['String']['input']>;
  manualScore: Scalars['Float']['input'];
};


export type MutationReviewAttemptArgs = {
  answers: Array<AttemptReviewAnswerInput>;
  attemptId: Scalars['ID']['input'];
};


export type MutationReviewQuestionAccessRequestArgs = {
  approve: Scalars['Boolean']['input'];
  requestId: Scalars['ID']['input'];
};


export type MutationSaveAnswerArgs = {
  attemptId: Scalars['ID']['input'];
  questionId: Scalars['ID']['input'];
  value: Scalars['String']['input'];
};


export type MutationShareExamToCommunityArgs = {
  communityId: Scalars['ID']['input'];
  examId: Scalars['ID']['input'];
};


export type MutationShareQuestionBankToCommunityArgs = {
  bankId: Scalars['ID']['input'];
  communityId: Scalars['ID']['input'];
};


export type MutationStartAttemptArgs = {
  examId: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
};


export type MutationSubmitAttemptArgs = {
  attemptId: Scalars['ID']['input'];
};


export type MutationUpdateExamDraftArgs = {
  classId: Scalars['ID']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  durationMinutes: Scalars['Int']['input'];
  examId: Scalars['ID']['input'];
  generationMode?: InputMaybe<ExamGenerationMode>;
  mode?: InputMaybe<ExamMode>;
  passingCriteriaType?: InputMaybe<PassingCriteriaType>;
  passingThreshold?: InputMaybe<Scalars['Int']['input']>;
  questionItems?: InputMaybe<Array<UpdateExamDraftQuestionInput>>;
  rules?: InputMaybe<Array<ExamGenerationRuleInput>>;
  scheduledFor?: InputMaybe<Scalars['String']['input']>;
  shuffleAnswers?: InputMaybe<Scalars['Boolean']['input']>;
  shuffleQuestions?: InputMaybe<Scalars['Boolean']['input']>;
  title: Scalars['String']['input'];
};


export type MutationUpdateQuestionArgs = {
  correctAnswer?: InputMaybe<Scalars['String']['input']>;
  difficulty?: InputMaybe<Difficulty>;
  id: Scalars['ID']['input'];
  options?: InputMaybe<Array<Scalars['String']['input']>>;
  prompt: Scalars['String']['input'];
  requiresAccessRequest?: InputMaybe<Scalars['Boolean']['input']>;
  shareScope?: InputMaybe<QuestionShareScope>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title: Scalars['String']['input'];
  type: QuestionType;
};

export enum PassingCriteriaType {
  Percentage = 'PERCENTAGE',
  Points = 'POINTS'
}

export type Query = {
  __typename?: 'Query';
  attempt?: Maybe<Attempt>;
  attempts: Array<Attempt>;
  class?: Maybe<Class>;
  classes: Array<Class>;
  communities: Array<Community>;
  community?: Maybe<Community>;
  communityExamPreview?: Maybe<CommunityExamPreview>;
  communityHome: CommunityHome;
  dashboardOverview: DashboardOverview;
  exam?: Maybe<Exam>;
  examImportJob?: Maybe<ExamImportJob>;
  examImportJobs: Array<ExamImportJob>;
  exams: Array<Exam>;
  health: Health;
  hello: Hello;
  me?: Maybe<User>;
  questionAccessRequests: Array<QuestionAccessRequest>;
  questionBank?: Maybe<QuestionBank>;
  questionBanks: Array<QuestionBank>;
  questions: Array<Question>;
  users: Array<User>;
};


export type QueryAttemptArgs = {
  id: Scalars['ID']['input'];
};


export type QueryClassArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCommunityArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCommunityExamPreviewArgs = {
  communityId?: InputMaybe<Scalars['ID']['input']>;
  examId: Scalars['ID']['input'];
};


export type QueryExamArgs = {
  id: Scalars['ID']['input'];
};


export type QueryExamImportJobArgs = {
  id: Scalars['ID']['input'];
};


export type QueryHelloArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};


export type QueryQuestionBankArgs = {
  id: Scalars['ID']['input'];
};


export type QueryQuestionsArgs = {
  bankId?: InputMaybe<Scalars['ID']['input']>;
};

export type Question = {
  __typename?: 'Question';
  bank: QuestionBank;
  canonicalQuestionId?: Maybe<Scalars['ID']['output']>;
  correctAnswer?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  createdBy: User;
  difficulty: Difficulty;
  forkedFromQuestionId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  options: Array<Scalars['String']['output']>;
  prompt: Scalars['String']['output'];
  requiresAccessRequest: Scalars['Boolean']['output'];
  shareScope: QuestionShareScope;
  tags: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  type: QuestionType;
};

export type QuestionAccessRequest = {
  __typename?: 'QuestionAccessRequest';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  owner: User;
  question: Question;
  requester: User;
  reviewedAt?: Maybe<Scalars['String']['output']>;
  status: QuestionAccessRequestStatus;
};

export enum QuestionAccessRequestStatus {
  Approved = 'APPROVED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export type QuestionBank = {
  __typename?: 'QuestionBank';
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  grade: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  owner: User;
  questionCount: Scalars['Int']['output'];
  questions: Array<Question>;
  subject: Scalars['String']['output'];
  title: Scalars['String']['output'];
  topic: Scalars['String']['output'];
  topics: Array<Scalars['String']['output']>;
  visibility: QuestionBankVisibility;
};

export enum QuestionBankVisibility {
  Private = 'PRIVATE',
  Public = 'PUBLIC'
}

export enum QuestionShareScope {
  Community = 'COMMUNITY',
  Private = 'PRIVATE',
  Public = 'PUBLIC'
}

export enum QuestionType {
  Essay = 'ESSAY',
  ImageUpload = 'IMAGE_UPLOAD',
  Mcq = 'MCQ',
  ShortAnswer = 'SHORT_ANSWER',
  TrueFalse = 'TRUE_FALSE'
}

export enum Role {
  Admin = 'ADMIN',
  Student = 'STUDENT',
  Teacher = 'TEACHER'
}

export type UpdateExamDraftQuestionInput = {
  points: Scalars['Int']['input'];
  questionId: Scalars['ID']['input'];
};

export type User = {
  __typename?: 'User';
  classes: Array<Class>;
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  role: Role;
};

export type AddCommunityCommentActionMutationVariables = Exact<{
  communityId: Scalars['ID']['input'];
  entityType: CommunityCommentEntityType;
  entityId: Scalars['ID']['input'];
  body: Scalars['String']['input'];
}>;


export type AddCommunityCommentActionMutation = { __typename?: 'Mutation', addCommunityComment: { __typename?: 'CommunityComment', id: string, entityType: CommunityCommentEntityType, entityId: string, body: string, createdAt: string, author: { __typename?: 'User', id: string, fullName: string } } };

export type AddQuestionToExamMutationVariables = Exact<{
  examId: Scalars['ID']['input'];
  questionId: Scalars['ID']['input'];
  points: Scalars['Int']['input'];
}>;


export type AddQuestionToExamMutation = { __typename?: 'Mutation', addQuestionToExam: { __typename?: 'Exam', id: string, questions: Array<{ __typename?: 'ExamQuestion', id: string, points: number, order: number, question: { __typename?: 'Question', id: string } }> } };

export type ApproveExamImportJobMutationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  classId: Scalars['ID']['input'];
  questions: Array<ExamImportQuestionReviewInput> | ExamImportQuestionReviewInput;
}>;


export type ApproveExamImportJobMutationMutation = { __typename?: 'Mutation', approveExamImportJob: { __typename?: 'ExamImportJob', id: string, fileName: string, status: ExamImportJobStatus, title: string, extractionJson?: string | null, classifierJson?: string | null, totalQuestions: number, reviewCount: number, questionBank?: { __typename?: 'QuestionBank', id: string, title: string } | null, exam?: { __typename?: 'Exam', id: string, title: string, class: { __typename?: 'Class', id: string, name: string } } | null, questions: Array<{ __typename?: 'ExamImportQuestion', id: string, order: number, type: QuestionType, title: string, prompt: string, options: Array<string>, answers: Array<string>, score: number, difficulty: Difficulty, sourcePage?: number | null, sourceExcerpt?: string | null, sourceBlockId?: string | null, sourceBboxJson?: string | null, confidence: number, needsReview: boolean, createdAt: string }> } };

export type AssignExamToClassMutationVariables = Exact<{
  examId: Scalars['ID']['input'];
  classId: Scalars['ID']['input'];
}>;


export type AssignExamToClassMutation = { __typename?: 'Mutation', assignExamToClass: { __typename?: 'Exam', id: string, title: string, status: ExamStatus, class: { __typename?: 'Class', id: string, name: string } } };

export type CloseExamMutationVariables = Exact<{
  examId: Scalars['ID']['input'];
}>;


export type CloseExamMutation = { __typename?: 'Mutation', closeExam: { __typename?: 'Exam', id: string, status: ExamStatus } };

export type CopyCommunitySharedBankToMyBankActionMutationVariables = Exact<{
  sharedBankId: Scalars['ID']['input'];
}>;


export type CopyCommunitySharedBankToMyBankActionMutation = { __typename?: 'Mutation', copyCommunitySharedBankToMyBank: { __typename?: 'QuestionBank', id: string, title: string, grade: number, subject: string, topic: string, visibility: QuestionBankVisibility, questionCount: number, owner: { __typename?: 'User', id: string, fullName: string } } };

export type CreateClassMutationVariables = Exact<{
  name: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateClassMutation = { __typename?: 'Mutation', createClass: { __typename?: 'Class', id: string, name: string, subject: string, grade: number } };

export type CreateCommunityActionMutationVariables = Exact<{
  name: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  subject: Scalars['String']['input'];
  grade: Scalars['Int']['input'];
  visibility: CommunityVisibility;
}>;


export type CreateCommunityActionMutation = { __typename?: 'Mutation', createCommunity: { __typename?: 'Community', id: string, name: string, description?: string | null, subject: string, grade: number, visibility: CommunityVisibility, viewerRole?: CommunityMemberRole | null, memberCount: number, sharedBankCount: number, createdAt: string } };

export type CreateExamDraftVariantsMutationMutationVariables = Exact<{
  sourceQuestionId: Scalars['ID']['input'];
  totalVariants: Scalars['Int']['input'];
}>;


export type CreateExamDraftVariantsMutationMutation = { __typename?: 'Mutation', createExamDraftVariants: Array<{ __typename?: 'Question', id: string, title: string, prompt: string, type: QuestionType, difficulty: Difficulty, options: Array<string>, correctAnswer?: string | null, tags: Array<string> }> };

export type CreateExamImportJobMutationMutationVariables = Exact<{
  fileName: Scalars['String']['input'];
  fileSizeBytes: Scalars['Int']['input'];
  extractedText: Scalars['String']['input'];
  sourceType: ExamImportSourceType;
  storageKey?: InputMaybe<Scalars['String']['input']>;
  extractionJson?: InputMaybe<Scalars['String']['input']>;
  classifierJson?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateExamImportJobMutationMutation = { __typename?: 'Mutation', createExamImportJob: { __typename?: 'ExamImportJob', id: string, storageKey?: string | null, fileName: string, fileSizeBytes: number, sourceType: ExamImportSourceType, status: ExamImportJobStatus, title: string, extractionJson?: string | null, classifierJson?: string | null, errorMessage?: string | null, totalQuestions: number, reviewCount: number, createdAt: string, updatedAt: string, questions: Array<{ __typename?: 'ExamImportQuestion', id: string, order: number, type: QuestionType, title: string, prompt: string, options: Array<string>, answers: Array<string>, score: number, difficulty: Difficulty, sourcePage?: number | null, sourceExcerpt?: string | null, sourceBlockId?: string | null, sourceBboxJson?: string | null, confidence: number, needsReview: boolean, createdAt: string }> } };

export type CreateExamMutationVariables = Exact<{
  classId: Scalars['ID']['input'];
  title: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  mode: ExamMode;
  durationMinutes: Scalars['Int']['input'];
  scheduledFor?: InputMaybe<Scalars['String']['input']>;
  shuffleQuestions: Scalars['Boolean']['input'];
  shuffleAnswers: Scalars['Boolean']['input'];
  generationMode: ExamGenerationMode;
  rules?: InputMaybe<Array<ExamGenerationRuleInput> | ExamGenerationRuleInput>;
  passingCriteriaType: PassingCriteriaType;
  passingThreshold: Scalars['Int']['input'];
}>;


export type CreateExamMutation = { __typename?: 'Mutation', createExam: { __typename?: 'Exam', id: string, title: string, status: ExamStatus, mode: ExamMode, durationMinutes: number, scheduledFor?: string | null, shuffleQuestions: boolean, shuffleAnswers: boolean, generationMode: ExamGenerationMode, passingCriteriaType: PassingCriteriaType, passingThreshold: number, createdAt: string, generationRules: Array<{ __typename?: 'ExamGenerationRule', label: string, bankIds: Array<string>, difficulty?: Difficulty | null, count: number, points: number }>, class: { __typename?: 'Class', id: string, name: string } } };

export type CreateQuestionBankMutationMutationVariables = Exact<{
  title: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  grade: Scalars['Int']['input'];
  subject: Scalars['String']['input'];
  topic: Scalars['String']['input'];
  visibility: QuestionBankVisibility;
}>;


export type CreateQuestionBankMutationMutation = { __typename?: 'Mutation', createQuestionBank: { __typename?: 'QuestionBank', id: string, title: string, grade: number, subject: string, topic: string, visibility: QuestionBankVisibility } };

export type CreateQuestionVariantsMutationMutationVariables = Exact<{
  sourceQuestionId: Scalars['ID']['input'];
  totalVariants: Scalars['Int']['input'];
}>;


export type CreateQuestionVariantsMutationMutation = { __typename?: 'Mutation', createQuestionVariants: Array<{ __typename?: 'Question', id: string }> };

export type CreateQuestionMutationMutationVariables = Exact<{
  bankId: Scalars['ID']['input'];
  type: QuestionType;
  title: Scalars['String']['input'];
  prompt: Scalars['String']['input'];
  options?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  correctAnswer?: InputMaybe<Scalars['String']['input']>;
  difficulty: Difficulty;
  shareScope?: InputMaybe<QuestionShareScope>;
  requiresAccessRequest?: InputMaybe<Scalars['Boolean']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type CreateQuestionMutationMutation = { __typename?: 'Mutation', createQuestion: { __typename?: 'Question', id: string } };

export type DeleteQuestionMutationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteQuestionMutationMutation = { __typename?: 'Mutation', deleteQuestion: boolean };

export type ForkQuestionToMyBankMutationVariables = Exact<{
  questionId: Scalars['ID']['input'];
  targetBankId: Scalars['ID']['input'];
}>;


export type ForkQuestionToMyBankMutation = { __typename?: 'Mutation', forkQuestionToMyBank: { __typename?: 'Question', id: string, title: string, prompt: string, bank: { __typename?: 'QuestionBank', id: string, title: string } } };

export type GroupQuestionsAsVariantsMutationMutationVariables = Exact<{
  questionIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type GroupQuestionsAsVariantsMutationMutation = { __typename?: 'Mutation', groupQuestionsAsVariants: Array<{ __typename?: 'Question', id: string }> };

export type JoinCommunityActionMutationVariables = Exact<{
  communityId: Scalars['ID']['input'];
}>;


export type JoinCommunityActionMutation = { __typename?: 'Mutation', joinCommunity: { __typename?: 'Community', id: string, viewerRole?: CommunityMemberRole | null, memberCount: number, sharedBankCount: number } };

export type PublishExamMutationVariables = Exact<{
  examId: Scalars['ID']['input'];
}>;


export type PublishExamMutation = { __typename?: 'Mutation', publishExam: { __typename?: 'Exam', id: string, status: ExamStatus, startedAt?: string | null, endsAt?: string | null } };

export type RateCommunityItemActionMutationVariables = Exact<{
  communityId: Scalars['ID']['input'];
  entityType: CommunityCommentEntityType;
  entityId: Scalars['ID']['input'];
  value: Scalars['Int']['input'];
}>;


export type RateCommunityItemActionMutation = { __typename?: 'Mutation', rateCommunityItem: boolean };

export type RecordAttemptIntegrityEventMutationVariables = Exact<{
  attemptId: Scalars['ID']['input'];
  type: AttemptIntegrityEventType;
  details?: InputMaybe<Scalars['String']['input']>;
}>;


export type RecordAttemptIntegrityEventMutation = { __typename?: 'Mutation', recordAttemptIntegrityEvent: boolean };

export type RequestQuestionAccessMutationVariables = Exact<{
  questionId: Scalars['ID']['input'];
}>;


export type RequestQuestionAccessMutation = { __typename?: 'Mutation', requestQuestionAccess: { __typename?: 'QuestionAccessRequest', id: string, status: QuestionAccessRequestStatus, createdAt: string, reviewedAt?: string | null, question: { __typename?: 'Question', id: string }, requester: { __typename?: 'User', id: string, fullName: string }, owner: { __typename?: 'User', id: string, fullName: string } } };

export type ReviewAnswerMutationVariables = Exact<{
  answerId: Scalars['ID']['input'];
  manualScore: Scalars['Float']['input'];
  feedback?: InputMaybe<Scalars['String']['input']>;
}>;


export type ReviewAnswerMutation = { __typename?: 'Mutation', reviewAnswer: { __typename?: 'Answer', id: string, manualScore?: number | null, feedback?: string | null } };

export type ReviewAttemptMutationVariables = Exact<{
  attemptId: Scalars['ID']['input'];
  answers: Array<AttemptReviewAnswerInput> | AttemptReviewAnswerInput;
}>;


export type ReviewAttemptMutation = { __typename?: 'Mutation', reviewAttempt: { __typename?: 'Attempt', id: string, status: AttemptStatus, autoScore: number, manualScore: number, totalScore: number, submittedAt?: string | null, answers: Array<{ __typename?: 'Answer', id: string, autoScore?: number | null, manualScore?: number | null, feedback?: string | null }> } };

export type ReviewQuestionAccessRequestMutationVariables = Exact<{
  requestId: Scalars['ID']['input'];
  approve: Scalars['Boolean']['input'];
}>;


export type ReviewQuestionAccessRequestMutation = { __typename?: 'Mutation', reviewQuestionAccessRequest: { __typename?: 'QuestionAccessRequest', id: string, status: QuestionAccessRequestStatus, reviewedAt?: string | null, question: { __typename?: 'Question', id: string } } };

export type SaveAnswerMutationVariables = Exact<{
  attemptId: Scalars['ID']['input'];
  questionId: Scalars['ID']['input'];
  value: Scalars['String']['input'];
}>;


export type SaveAnswerMutation = { __typename?: 'Mutation', saveAnswer: { __typename?: 'Attempt', id: string, status: AttemptStatus, totalScore: number, startedAt: string, submittedAt?: string | null, answers: Array<{ __typename?: 'Answer', id: string, value: string, question: { __typename?: 'Question', id: string } }> } };

export type ShareExamToCommunityActionMutationVariables = Exact<{
  communityId: Scalars['ID']['input'];
  examId: Scalars['ID']['input'];
}>;


export type ShareExamToCommunityActionMutation = { __typename?: 'Mutation', shareExamToCommunity: { __typename?: 'CommunitySharedExam', id: string, examId: string, title: string, description?: string | null, subject: string, grade: number, className: string, status: ExamStatus, durationMinutes: number, questionCount: number, attemptCount: number, averageScorePercent: number, createdAt: string, sharedBy: { __typename?: 'User', id: string, fullName: string } } };

export type ShareQuestionBankToCommunityActionMutationVariables = Exact<{
  communityId: Scalars['ID']['input'];
  bankId: Scalars['ID']['input'];
}>;


export type ShareQuestionBankToCommunityActionMutation = { __typename?: 'Mutation', shareQuestionBankToCommunity: { __typename?: 'CommunitySharedBank', id: string, status: CommunitySharedBankStatus, createdAt: string, sharedBy: { __typename?: 'User', id: string, fullName: string }, bank: { __typename?: 'QuestionBank', id: string, title: string, questionCount: number, owner: { __typename?: 'User', id: string, fullName: string } } } };

export type StartAttemptMutationVariables = Exact<{
  examId: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
}>;


export type StartAttemptMutation = { __typename?: 'Mutation', startAttempt: { __typename?: 'Attempt', id: string, status: AttemptStatus, totalScore: number, startedAt: string, submittedAt?: string | null, exam: { __typename?: 'Exam', id: string }, answers: Array<{ __typename?: 'Answer', id: string, value: string, question: { __typename?: 'Question', id: string } }> } };

export type SubmitAttemptMutationVariables = Exact<{
  attemptId: Scalars['ID']['input'];
}>;


export type SubmitAttemptMutation = { __typename?: 'Mutation', submitAttempt: { __typename?: 'Attempt', id: string, status: AttemptStatus, totalScore: number, startedAt: string, submittedAt?: string | null } };

export type UpdateExamDraftMutationVariables = Exact<{
  examId: Scalars['ID']['input'];
  classId: Scalars['ID']['input'];
  title: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  mode: ExamMode;
  durationMinutes: Scalars['Int']['input'];
  scheduledFor?: InputMaybe<Scalars['String']['input']>;
  shuffleQuestions: Scalars['Boolean']['input'];
  shuffleAnswers: Scalars['Boolean']['input'];
  generationMode: ExamGenerationMode;
  rules?: InputMaybe<Array<ExamGenerationRuleInput> | ExamGenerationRuleInput>;
  passingCriteriaType: PassingCriteriaType;
  passingThreshold: Scalars['Int']['input'];
  questionItems?: InputMaybe<Array<UpdateExamDraftQuestionInput> | UpdateExamDraftQuestionInput>;
}>;


export type UpdateExamDraftMutation = { __typename?: 'Mutation', updateExamDraft: { __typename?: 'Exam', id: string, title: string, status: ExamStatus, mode: ExamMode, durationMinutes: number, scheduledFor?: string | null, shuffleQuestions: boolean, shuffleAnswers: boolean, generationMode: ExamGenerationMode, passingCriteriaType: PassingCriteriaType, passingThreshold: number, createdAt: string, generationRules: Array<{ __typename?: 'ExamGenerationRule', label: string, bankIds: Array<string>, difficulty?: Difficulty | null, count: number, points: number }>, class: { __typename?: 'Class', id: string, name: string } } };

export type UpdateQuestionMutationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  type: QuestionType;
  title: Scalars['String']['input'];
  prompt: Scalars['String']['input'];
  options?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  correctAnswer?: InputMaybe<Scalars['String']['input']>;
  difficulty: Difficulty;
  shareScope?: InputMaybe<QuestionShareScope>;
  requiresAccessRequest?: InputMaybe<Scalars['Boolean']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type UpdateQuestionMutationMutation = { __typename?: 'Mutation', updateQuestion: { __typename?: 'Question', id: string } };

export type ClassDetailQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ClassDetailQuery = { __typename?: 'Query', class?: { __typename?: 'Class', id: string, name: string, description?: string | null, subject: string, grade: number, studentCount: number, assignedExamCount: number, upcomingExamCount: number, completedExamCount: number, averageScore?: number | null, teacher: { __typename?: 'User', id: string, fullName: string }, studentInsights: Array<{ __typename?: 'ClassStudentInsight', status: ClassStudentStatus, lastActiveAt?: string | null, averageScore?: number | null, suspiciousEventCount: number, integrityRisk: IntegrityRiskLevel, lastIntegrityEventAt?: string | null, integritySignals: Array<{ __typename?: 'IntegritySignalCount', type: AttemptIntegrityEventType, severity: IntegritySeverity, count: number }>, integrityEvents: Array<{ __typename?: 'IntegrityEvent', id: string, type: AttemptIntegrityEventType, severity: IntegritySeverity, details: string, createdAt: string }>, student: { __typename?: 'User', id: string, fullName: string, email: string } }>, examInsights: Array<{ __typename?: 'ClassExamInsight', submittedCount: number, totalStudents: number, progressPercent: number, averageScore?: number | null, questionCount: number, exam: { __typename?: 'Exam', id: string, title: string, durationMinutes: number, status: ExamStatus, createdAt: string, scheduledFor?: string | null, startedAt?: string | null, endsAt?: string | null } }> } | null };

export type ClassesListQueryVariables = Exact<{ [key: string]: never; }>;


export type ClassesListQuery = { __typename?: 'Query', classes: Array<{ __typename?: 'Class', id: string, name: string, subject: string, grade: number, studentCount: number, assignedExamCount: number, upcomingExamCount: number, completedExamCount: number, averageScore?: number | null }> };

export type CommunityDetailQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type CommunityDetailQuery = { __typename?: 'Query', community?: { __typename?: 'Community', id: string, name: string, description?: string | null, subject: string, grade: number, visibility: CommunityVisibility, viewerRole?: CommunityMemberRole | null, memberCount: number, sharedBankCount: number, sharedExamCount: number, topContributors: Array<{ __typename?: 'CommunityContributor', role: CommunityMemberRole, sharedBankCount: number, sharedExamCount: number, commentCount: number, score: number, user: { __typename?: 'User', id: string, fullName: string } }>, members: Array<{ __typename?: 'CommunityMember', id: string, role: CommunityMemberRole, joinedAt: string, user: { __typename?: 'User', id: string, fullName: string } }>, sharedBanks: Array<{ __typename?: 'CommunitySharedBank', id: string, status: CommunitySharedBankStatus, copyCount: number, ratingCount: number, averageRating: number, viewerRating?: number | null, createdAt: string, sharedBy: { __typename?: 'User', id: string, fullName: string }, comments: Array<{ __typename?: 'CommunityComment', id: string, entityType: CommunityCommentEntityType, entityId: string, body: string, createdAt: string, author: { __typename?: 'User', id: string, fullName: string } }>, bank: { __typename?: 'QuestionBank', id: string, title: string, description?: string | null, grade: number, subject: string, topic: string, visibility: QuestionBankVisibility, questionCount: number, createdAt: string, owner: { __typename?: 'User', id: string, fullName: string } } }>, sharedExams: Array<{ __typename?: 'CommunitySharedExam', id: string, examId: string, title: string, description?: string | null, subject: string, grade: number, className: string, status: ExamStatus, durationMinutes: number, questionCount: number, attemptCount: number, averageScorePercent: number, ratingCount: number, averageRating: number, viewerRating?: number | null, createdAt: string, sharedBy: { __typename?: 'User', id: string, fullName: string }, comments: Array<{ __typename?: 'CommunityComment', id: string, entityType: CommunityCommentEntityType, entityId: string, body: string, createdAt: string, author: { __typename?: 'User', id: string, fullName: string } }> }> } | null };

export type CommunityExamPreviewQueryVariables = Exact<{
  examId: Scalars['ID']['input'];
  communityId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type CommunityExamPreviewQuery = { __typename?: 'Query', communityExamPreview?: { __typename?: 'CommunityExamPreview', examId: string, communityId?: string | null, communityName?: string | null, title: string, description?: string | null, subject: string, grade: number, className: string, status: ExamStatus, durationMinutes: number, questionCount: number, totalPoints: number, passingCriteriaType: PassingCriteriaType, passingThreshold: number, createdAt: string, sharedAt?: string | null, overallConclusion: string, sharedBy?: { __typename?: 'User', id: string, fullName: string } | null, summary: { __typename?: 'CommunityExamPreviewSummary', studentCount: number, submittedCount: number, averagePercent: number, passRate: number, highestPercent: number, lowestPercent: number, completionRate: number }, questions: Array<{ __typename?: 'CommunityExamPreviewQuestion', id: string, order: number, prompt: string, type: QuestionType, options: Array<string>, correctAnswer?: string | null, points: number, topic: string, tags: Array<string> }>, scoreDistribution: Array<{ __typename?: 'CommunityExamPreviewBar', label: string, value: number, meta: string, note?: string | null }>, topicPerformance: Array<{ __typename?: 'CommunityExamPreviewBar', label: string, value: number, meta: string, note?: string | null }>, questionPerformance: Array<{ __typename?: 'CommunityExamPreviewBar', label: string, value: number, meta: string, note?: string | null }>, insights: Array<{ __typename?: 'CommunityExamPreviewInsight', title: string, description: string, tone: string }> } | null };

export type CommunityOverviewQueryVariables = Exact<{ [key: string]: never; }>;


export type CommunityOverviewQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, fullName: string, classes: Array<{ __typename?: 'Class', id: string, subject: string, grade: number }> } | null, communityHome: { __typename?: 'CommunityHome', stats: { __typename?: 'CommunityHomeStats', totalCommunities: number, totalSharedBanks: number, totalCopies: number, activeTeachers: number }, weeklyActivity: Array<{ __typename?: 'CommunityActivityPoint', label: string, value: number }>, trendingBanks: Array<{ __typename?: 'CommunityTrendingBank', sharedBankId: string, copyCount: number, communityId: string, communityName: string, bank: { __typename?: 'QuestionBank', id: string, title: string, description?: string | null, grade: number, subject: string, topic: string, visibility: QuestionBankVisibility, questionCount: number, createdAt: string, owner: { __typename?: 'User', id: string, fullName: string } } }>, topExams: Array<{ __typename?: 'CommunityTrendingExam', examId: string, title: string, subject: string, grade: number, attemptCount: number, averageScorePercent: number, communityId?: string | null, communityName?: string | null, createdBy: { __typename?: 'User', id: string, fullName: string } }>, mostMissedQuestions: Array<{ __typename?: 'CommunityQuestionInsight', questionId: string, prompt: string, subject: string, grade: number, topic: string, bankTitle: string, communityId: string, communityName: string, attemptCount: number, missRate: number }> }, communities: Array<{ __typename?: 'Community', id: string, name: string, description?: string | null, subject: string, grade: number, visibility: CommunityVisibility, viewerRole?: CommunityMemberRole | null, memberCount: number, sharedBankCount: number, createdAt: string }>, questionBanks: Array<{ __typename?: 'QuestionBank', id: string, title: string, description?: string | null, grade: number, subject: string, topic: string, topics: Array<string>, visibility: QuestionBankVisibility, questionCount: number, createdAt: string, owner: { __typename?: 'User', id: string, fullName: string } }> };

export type CreateExamOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type CreateExamOptionsQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null, questionAccessRequests: Array<{ __typename?: 'QuestionAccessRequest', id: string, status: QuestionAccessRequestStatus, requester: { __typename?: 'User', id: string }, question: { __typename?: 'Question', id: string } }>, classes: Array<{ __typename?: 'Class', id: string, name: string, subject: string, grade: number }>, questionBanks: Array<{ __typename?: 'QuestionBank', id: string, title: string, subject: string, grade: number, topic: string }>, questions: Array<{ __typename?: 'Question', id: string, title: string, prompt: string, type: QuestionType, difficulty: Difficulty, shareScope: QuestionShareScope, requiresAccessRequest: boolean, createdAt: string, options: Array<string>, correctAnswer?: string | null, tags: Array<string>, createdBy: { __typename?: 'User', id: string, fullName: string }, bank: { __typename?: 'QuestionBank', id: string, title: string, subject: string, grade: number, topic: string, owner: { __typename?: 'User', id: string } } }> };

export type DashboardOverviewQueryVariables = Exact<{ [key: string]: never; }>;


export type DashboardOverviewQuery = { __typename?: 'Query', dashboardOverview: { __typename?: 'DashboardOverview', teacherName: string, summary: { __typename?: 'DashboardMetricSummary', pendingReviewCount: number, draftExamCount: number, ongoingExamCount: number, scheduledExamCount: number }, upcomingExams: Array<{ __typename?: 'DashboardUpcomingExam', id: string, title: string, scheduledFor: string, questionCount: number, status: ExamStatus }>, recentResults: Array<{ __typename?: 'DashboardRecentResult', id: string, title: string, passCount: number, failCount: number, progressPercent: number, averageScorePercent: number }> } };

export type EditExamDraftQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type EditExamDraftQuery = { __typename?: 'Query', exam?: { __typename?: 'Exam', id: string, title: string, description?: string | null, mode: ExamMode, status: ExamStatus, durationMinutes: number, scheduledFor?: string | null, shuffleQuestions: boolean, shuffleAnswers: boolean, generationMode: ExamGenerationMode, passingCriteriaType: PassingCriteriaType, passingThreshold: number, generationRules: Array<{ __typename?: 'ExamGenerationRule', label: string, bankIds: Array<string>, difficulty?: Difficulty | null, count: number, points: number }>, class: { __typename?: 'Class', id: string, name: string }, questions: Array<{ __typename?: 'ExamQuestion', id: string, order: number, points: number, question: { __typename?: 'Question', id: string, bank: { __typename?: 'QuestionBank', id: string } } }> } | null };

export type HealthQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type HealthQueryQuery = { __typename?: 'Query', health: { __typename?: 'Health', ok: boolean, service: string, runtime: string } };

export type MyExamDetailQueryQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MyExamDetailQueryQuery = { __typename?: 'Query', exam?: { __typename?: 'Exam', id: string, mode: ExamMode, isTemplate: boolean, sourceExamId?: string | null, title: string, status: ExamStatus, durationMinutes: number, passingCriteriaType: PassingCriteriaType, passingThreshold: number, createdAt: string, startedAt?: string | null, endsAt?: string | null, createdBy: { __typename?: 'User', id: string }, class: { __typename?: 'Class', id: string, name: string, subject: string, grade: number, studentCount: number }, questions: Array<{ __typename?: 'ExamQuestion', id: string, points: number, order: number, question: { __typename?: 'Question', id: string, title: string, prompt: string, tags: Array<string>, type: QuestionType, options: Array<string>, correctAnswer?: string | null, bank: { __typename?: 'QuestionBank', id: string, topic: string } } }>, attempts: Array<{ __typename?: 'Attempt', id: string, status: AttemptStatus, autoScore: number, manualScore: number, totalScore: number, startedAt: string, submittedAt?: string | null, student: { __typename?: 'User', id: string, fullName: string }, answers: Array<{ __typename?: 'Answer', id: string, value: string, autoScore?: number | null, manualScore?: number | null, feedback?: string | null, createdAt: string, question: { __typename?: 'Question', id: string, title: string, prompt: string, tags: Array<string>, type: QuestionType } }> }> } | null };

export type MyExamsSectionQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type MyExamsSectionQueryQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, classes: Array<{ __typename?: 'Class', id: string }> } | null, exams: Array<{ __typename?: 'Exam', id: string, mode: ExamMode, isTemplate: boolean, sourceExamId?: string | null, title: string, status: ExamStatus, durationMinutes: number, passingCriteriaType: PassingCriteriaType, passingThreshold: number, createdAt: string, scheduledFor?: string | null, startedAt?: string | null, endsAt?: string | null, createdBy: { __typename?: 'User', id: string }, class: { __typename?: 'Class', id: string, name: string, subject: string, grade: number, studentCount: number }, questions: Array<{ __typename?: 'ExamQuestion', id: string, points: number, order: number }>, attempts: Array<{ __typename?: 'Attempt', id: string, status: AttemptStatus, totalScore: number }> }> };

export type MyExamsQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type MyExamsQueryQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, classes: Array<{ __typename?: 'Class', id: string }> } | null, exams: Array<{ __typename?: 'Exam', id: string, mode: ExamMode, isTemplate: boolean, sourceExamId?: string | null, title: string, status: ExamStatus, durationMinutes: number, passingCriteriaType: PassingCriteriaType, passingThreshold: number, createdAt: string, startedAt?: string | null, endsAt?: string | null, createdBy: { __typename?: 'User', id: string }, class: { __typename?: 'Class', id: string, name: string, subject: string, grade: number, students: Array<{ __typename?: 'User', id: string, fullName: string }> }, questions: Array<{ __typename?: 'ExamQuestion', id: string, points: number, order: number, question: { __typename?: 'Question', id: string, title: string, prompt: string, tags: Array<string>, type: QuestionType, options: Array<string>, correctAnswer?: string | null, bank: { __typename?: 'QuestionBank', id: string, topic: string } } }>, attempts: Array<{ __typename?: 'Attempt', id: string, status: AttemptStatus, autoScore: number, manualScore: number, totalScore: number, startedAt: string, submittedAt?: string | null, student: { __typename?: 'User', id: string, fullName: string }, answers: Array<{ __typename?: 'Answer', id: string, value: string, autoScore?: number | null, manualScore?: number | null, feedback?: string | null, createdAt: string, question: { __typename?: 'Question', id: string, title: string, prompt: string, tags: Array<string>, type: QuestionType } }> }> }> };

export type QuestionBankDetailQueryQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type QuestionBankDetailQueryQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null, questionAccessRequests: Array<{ __typename?: 'QuestionAccessRequest', id: string, status: QuestionAccessRequestStatus, createdAt: string, reviewedAt?: string | null, requester: { __typename?: 'User', id: string, fullName: string }, owner: { __typename?: 'User', id: string, fullName: string }, question: { __typename?: 'Question', id: string, title: string, prompt: string, bank: { __typename?: 'QuestionBank', id: string, title: string } } }>, questionBanks: Array<{ __typename?: 'QuestionBank', id: string, title: string, grade: number, subject: string, topic: string, owner: { __typename?: 'User', id: string } }>, questionBank?: { __typename?: 'QuestionBank', id: string, title: string, description?: string | null, grade: number, subject: string, topic: string, topics: Array<string>, visibility: QuestionBankVisibility, questionCount: number, owner: { __typename?: 'User', id: string, fullName: string }, questions: Array<{ __typename?: 'Question', id: string, title: string, prompt: string, type: QuestionType, difficulty: Difficulty, shareScope: QuestionShareScope, requiresAccessRequest: boolean, options: Array<string>, correctAnswer?: string | null, tags: Array<string>, createdBy: { __typename?: 'User', id: string, fullName: string } }> } | null };

export type QuestionBanksQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type QuestionBanksQueryQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null, questionBanks: Array<{ __typename?: 'QuestionBank', id: string, title: string, description?: string | null, grade: number, subject: string, topic: string, topics: Array<string>, visibility: QuestionBankVisibility, questionCount: number, createdAt: string, owner: { __typename?: 'User', id: string, fullName: string } }> };

export type StudentExamRoomQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type StudentExamRoomQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, fullName: string } | null, exam?: { __typename?: 'Exam', id: string, title: string, description?: string | null, mode: ExamMode, status: ExamStatus, durationMinutes: number, startedAt?: string | null, endsAt?: string | null, scheduledFor?: string | null, shuffleQuestions: boolean, shuffleAnswers: boolean, passingCriteriaType: PassingCriteriaType, passingThreshold: number, createdAt: string, class: { __typename?: 'Class', id: string, name: string, subject: string, grade: number, teacher: { __typename?: 'User', id: string, fullName: string } }, questions: Array<{ __typename?: 'ExamQuestion', id: string, order: number, points: number, question: { __typename?: 'Question', id: string, title: string, prompt: string, tags: Array<string>, type: QuestionType, difficulty: Difficulty, options: Array<string>, correctAnswer?: string | null, bank: { __typename?: 'QuestionBank', id: string, topic: string } } }> } | null, attempts: Array<{ __typename?: 'Attempt', id: string, status: AttemptStatus, totalScore: number, generationSeed?: string | null, startedAt: string, submittedAt?: string | null, exam: { __typename?: 'Exam', id: string }, answers: Array<{ __typename?: 'Answer', id: string, value: string, autoScore?: number | null, manualScore?: number | null, feedback?: string | null, question: { __typename?: 'Question', id: string, title: string, prompt: string, type: QuestionType, correctAnswer?: string | null, tags: Array<string>, bank: { __typename?: 'QuestionBank', id: string, topic: string } } }> }> };

export type StudentHomeQueryVariables = Exact<{ [key: string]: never; }>;


export type StudentHomeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, fullName: string, classes: Array<{ __typename?: 'Class', id: string, name: string, subject: string, grade: number, teacher: { __typename?: 'User', id: string, fullName: string } }> } | null, exams: Array<{ __typename?: 'Exam', id: string, title: string, mode: ExamMode, status: ExamStatus, durationMinutes: number, startedAt?: string | null, endsAt?: string | null, scheduledFor?: string | null, createdAt: string, class: { __typename?: 'Class', id: string, name: string, subject: string, grade: number, teacher: { __typename?: 'User', id: string, fullName: string } }, questions: Array<{ __typename?: 'ExamQuestion', id: string, points: number }> }>, attempts: Array<{ __typename?: 'Attempt', id: string, status: AttemptStatus, totalScore: number, startedAt: string, submittedAt?: string | null, exam: { __typename?: 'Exam', id: string, title: string, mode: ExamMode, status: ExamStatus, durationMinutes: number, startedAt?: string | null, endsAt?: string | null, scheduledFor?: string | null, createdAt: string, class: { __typename?: 'Class', id: string, name: string, subject: string, grade: number, teacher: { __typename?: 'User', id: string, fullName: string } }, questions: Array<{ __typename?: 'ExamQuestion', id: string, points: number }> } }> };


export const AddCommunityCommentActionDocument = gql`
    mutation AddCommunityCommentAction($communityId: ID!, $entityType: CommunityCommentEntityType!, $entityId: ID!, $body: String!) {
  addCommunityComment(
    communityId: $communityId
    entityType: $entityType
    entityId: $entityId
    body: $body
  ) {
    id
    entityType
    entityId
    body
    createdAt
    author {
      id
      fullName
    }
  }
}
    `;
export type AddCommunityCommentActionMutationFn = ApolloReactCommon.MutationFunction<AddCommunityCommentActionMutation, AddCommunityCommentActionMutationVariables>;

/**
 * __useAddCommunityCommentActionMutation__
 *
 * To run a mutation, you first call `useAddCommunityCommentActionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddCommunityCommentActionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addCommunityCommentActionMutation, { data, loading, error }] = useAddCommunityCommentActionMutation({
 *   variables: {
 *      communityId: // value for 'communityId'
 *      entityType: // value for 'entityType'
 *      entityId: // value for 'entityId'
 *      body: // value for 'body'
 *   },
 * });
 */
export function useAddCommunityCommentActionMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<AddCommunityCommentActionMutation, AddCommunityCommentActionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<AddCommunityCommentActionMutation, AddCommunityCommentActionMutationVariables>(AddCommunityCommentActionDocument, options);
      }
export type AddCommunityCommentActionMutationHookResult = ReturnType<typeof useAddCommunityCommentActionMutation>;
export type AddCommunityCommentActionMutationResult = ApolloReactCommon.MutationResult<AddCommunityCommentActionMutation>;
export type AddCommunityCommentActionMutationOptions = ApolloReactCommon.BaseMutationOptions<AddCommunityCommentActionMutation, AddCommunityCommentActionMutationVariables>;
export const AddQuestionToExamDocument = gql`
    mutation AddQuestionToExam($examId: ID!, $questionId: ID!, $points: Int!) {
  addQuestionToExam(examId: $examId, questionId: $questionId, points: $points) {
    id
    questions {
      id
      points
      order
      question {
        id
      }
    }
  }
}
    `;
export type AddQuestionToExamMutationFn = ApolloReactCommon.MutationFunction<AddQuestionToExamMutation, AddQuestionToExamMutationVariables>;

/**
 * __useAddQuestionToExamMutation__
 *
 * To run a mutation, you first call `useAddQuestionToExamMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddQuestionToExamMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addQuestionToExamMutation, { data, loading, error }] = useAddQuestionToExamMutation({
 *   variables: {
 *      examId: // value for 'examId'
 *      questionId: // value for 'questionId'
 *      points: // value for 'points'
 *   },
 * });
 */
export function useAddQuestionToExamMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<AddQuestionToExamMutation, AddQuestionToExamMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<AddQuestionToExamMutation, AddQuestionToExamMutationVariables>(AddQuestionToExamDocument, options);
      }
export type AddQuestionToExamMutationHookResult = ReturnType<typeof useAddQuestionToExamMutation>;
export type AddQuestionToExamMutationResult = ApolloReactCommon.MutationResult<AddQuestionToExamMutation>;
export type AddQuestionToExamMutationOptions = ApolloReactCommon.BaseMutationOptions<AddQuestionToExamMutation, AddQuestionToExamMutationVariables>;
export const ApproveExamImportJobMutationDocument = gql`
    mutation ApproveExamImportJobMutation($id: ID!, $classId: ID!, $questions: [ExamImportQuestionReviewInput!]!) {
  approveExamImportJob(id: $id, classId: $classId, questions: $questions) {
    id
    fileName
    status
    title
    extractionJson
    classifierJson
    totalQuestions
    reviewCount
    questionBank {
      id
      title
    }
    exam {
      id
      title
      class {
        id
        name
      }
    }
    questions {
      id
      order
      type
      title
      prompt
      options
      answers
      score
      difficulty
      sourcePage
      sourceExcerpt
      sourceBlockId
      sourceBboxJson
      confidence
      needsReview
      createdAt
    }
  }
}
    `;
export type ApproveExamImportJobMutationMutationFn = ApolloReactCommon.MutationFunction<ApproveExamImportJobMutationMutation, ApproveExamImportJobMutationMutationVariables>;

/**
 * __useApproveExamImportJobMutationMutation__
 *
 * To run a mutation, you first call `useApproveExamImportJobMutationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useApproveExamImportJobMutationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [approveExamImportJobMutationMutation, { data, loading, error }] = useApproveExamImportJobMutationMutation({
 *   variables: {
 *      id: // value for 'id'
 *      classId: // value for 'classId'
 *      questions: // value for 'questions'
 *   },
 * });
 */
export function useApproveExamImportJobMutationMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ApproveExamImportJobMutationMutation, ApproveExamImportJobMutationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<ApproveExamImportJobMutationMutation, ApproveExamImportJobMutationMutationVariables>(ApproveExamImportJobMutationDocument, options);
      }
export type ApproveExamImportJobMutationMutationHookResult = ReturnType<typeof useApproveExamImportJobMutationMutation>;
export type ApproveExamImportJobMutationMutationResult = ApolloReactCommon.MutationResult<ApproveExamImportJobMutationMutation>;
export type ApproveExamImportJobMutationMutationOptions = ApolloReactCommon.BaseMutationOptions<ApproveExamImportJobMutationMutation, ApproveExamImportJobMutationMutationVariables>;
export const AssignExamToClassDocument = gql`
    mutation AssignExamToClass($examId: ID!, $classId: ID!) {
  assignExamToClass(examId: $examId, classId: $classId) {
    id
    title
    status
    class {
      id
      name
    }
  }
}
    `;
export type AssignExamToClassMutationFn = ApolloReactCommon.MutationFunction<AssignExamToClassMutation, AssignExamToClassMutationVariables>;

/**
 * __useAssignExamToClassMutation__
 *
 * To run a mutation, you first call `useAssignExamToClassMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignExamToClassMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignExamToClassMutation, { data, loading, error }] = useAssignExamToClassMutation({
 *   variables: {
 *      examId: // value for 'examId'
 *      classId: // value for 'classId'
 *   },
 * });
 */
export function useAssignExamToClassMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<AssignExamToClassMutation, AssignExamToClassMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<AssignExamToClassMutation, AssignExamToClassMutationVariables>(AssignExamToClassDocument, options);
      }
export type AssignExamToClassMutationHookResult = ReturnType<typeof useAssignExamToClassMutation>;
export type AssignExamToClassMutationResult = ApolloReactCommon.MutationResult<AssignExamToClassMutation>;
export type AssignExamToClassMutationOptions = ApolloReactCommon.BaseMutationOptions<AssignExamToClassMutation, AssignExamToClassMutationVariables>;
export const CloseExamDocument = gql`
    mutation CloseExam($examId: ID!) {
  closeExam(examId: $examId) {
    id
    status
  }
}
    `;
export type CloseExamMutationFn = ApolloReactCommon.MutationFunction<CloseExamMutation, CloseExamMutationVariables>;

/**
 * __useCloseExamMutation__
 *
 * To run a mutation, you first call `useCloseExamMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCloseExamMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [closeExamMutation, { data, loading, error }] = useCloseExamMutation({
 *   variables: {
 *      examId: // value for 'examId'
 *   },
 * });
 */
export function useCloseExamMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CloseExamMutation, CloseExamMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CloseExamMutation, CloseExamMutationVariables>(CloseExamDocument, options);
      }
export type CloseExamMutationHookResult = ReturnType<typeof useCloseExamMutation>;
export type CloseExamMutationResult = ApolloReactCommon.MutationResult<CloseExamMutation>;
export type CloseExamMutationOptions = ApolloReactCommon.BaseMutationOptions<CloseExamMutation, CloseExamMutationVariables>;
export const CopyCommunitySharedBankToMyBankActionDocument = gql`
    mutation CopyCommunitySharedBankToMyBankAction($sharedBankId: ID!) {
  copyCommunitySharedBankToMyBank(sharedBankId: $sharedBankId) {
    id
    title
    grade
    subject
    topic
    visibility
    questionCount
    owner {
      id
      fullName
    }
  }
}
    `;
export type CopyCommunitySharedBankToMyBankActionMutationFn = ApolloReactCommon.MutationFunction<CopyCommunitySharedBankToMyBankActionMutation, CopyCommunitySharedBankToMyBankActionMutationVariables>;

/**
 * __useCopyCommunitySharedBankToMyBankActionMutation__
 *
 * To run a mutation, you first call `useCopyCommunitySharedBankToMyBankActionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCopyCommunitySharedBankToMyBankActionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [copyCommunitySharedBankToMyBankActionMutation, { data, loading, error }] = useCopyCommunitySharedBankToMyBankActionMutation({
 *   variables: {
 *      sharedBankId: // value for 'sharedBankId'
 *   },
 * });
 */
export function useCopyCommunitySharedBankToMyBankActionMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CopyCommunitySharedBankToMyBankActionMutation, CopyCommunitySharedBankToMyBankActionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CopyCommunitySharedBankToMyBankActionMutation, CopyCommunitySharedBankToMyBankActionMutationVariables>(CopyCommunitySharedBankToMyBankActionDocument, options);
      }
export type CopyCommunitySharedBankToMyBankActionMutationHookResult = ReturnType<typeof useCopyCommunitySharedBankToMyBankActionMutation>;
export type CopyCommunitySharedBankToMyBankActionMutationResult = ApolloReactCommon.MutationResult<CopyCommunitySharedBankToMyBankActionMutation>;
export type CopyCommunitySharedBankToMyBankActionMutationOptions = ApolloReactCommon.BaseMutationOptions<CopyCommunitySharedBankToMyBankActionMutation, CopyCommunitySharedBankToMyBankActionMutationVariables>;
export const CreateClassDocument = gql`
    mutation CreateClass($name: String!, $description: String) {
  createClass(name: $name, description: $description) {
    id
    name
    subject
    grade
  }
}
    `;
export type CreateClassMutationFn = ApolloReactCommon.MutationFunction<CreateClassMutation, CreateClassMutationVariables>;

/**
 * __useCreateClassMutation__
 *
 * To run a mutation, you first call `useCreateClassMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateClassMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createClassMutation, { data, loading, error }] = useCreateClassMutation({
 *   variables: {
 *      name: // value for 'name'
 *      description: // value for 'description'
 *   },
 * });
 */
export function useCreateClassMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateClassMutation, CreateClassMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateClassMutation, CreateClassMutationVariables>(CreateClassDocument, options);
      }
export type CreateClassMutationHookResult = ReturnType<typeof useCreateClassMutation>;
export type CreateClassMutationResult = ApolloReactCommon.MutationResult<CreateClassMutation>;
export type CreateClassMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateClassMutation, CreateClassMutationVariables>;
export const CreateCommunityActionDocument = gql`
    mutation CreateCommunityAction($name: String!, $description: String, $subject: String!, $grade: Int!, $visibility: CommunityVisibility!) {
  createCommunity(
    name: $name
    description: $description
    subject: $subject
    grade: $grade
    visibility: $visibility
  ) {
    id
    name
    description
    subject
    grade
    visibility
    viewerRole
    memberCount
    sharedBankCount
    createdAt
  }
}
    `;
export type CreateCommunityActionMutationFn = ApolloReactCommon.MutationFunction<CreateCommunityActionMutation, CreateCommunityActionMutationVariables>;

/**
 * __useCreateCommunityActionMutation__
 *
 * To run a mutation, you first call `useCreateCommunityActionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCommunityActionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCommunityActionMutation, { data, loading, error }] = useCreateCommunityActionMutation({
 *   variables: {
 *      name: // value for 'name'
 *      description: // value for 'description'
 *      subject: // value for 'subject'
 *      grade: // value for 'grade'
 *      visibility: // value for 'visibility'
 *   },
 * });
 */
export function useCreateCommunityActionMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateCommunityActionMutation, CreateCommunityActionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateCommunityActionMutation, CreateCommunityActionMutationVariables>(CreateCommunityActionDocument, options);
      }
export type CreateCommunityActionMutationHookResult = ReturnType<typeof useCreateCommunityActionMutation>;
export type CreateCommunityActionMutationResult = ApolloReactCommon.MutationResult<CreateCommunityActionMutation>;
export type CreateCommunityActionMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateCommunityActionMutation, CreateCommunityActionMutationVariables>;
export const CreateExamDraftVariantsMutationDocument = gql`
    mutation CreateExamDraftVariantsMutation($sourceQuestionId: ID!, $totalVariants: Int!) {
  createExamDraftVariants(
    sourceQuestionId: $sourceQuestionId
    totalVariants: $totalVariants
  ) {
    id
    title
    prompt
    type
    difficulty
    options
    correctAnswer
    tags
  }
}
    `;
export type CreateExamDraftVariantsMutationMutationFn = ApolloReactCommon.MutationFunction<CreateExamDraftVariantsMutationMutation, CreateExamDraftVariantsMutationMutationVariables>;

/**
 * __useCreateExamDraftVariantsMutationMutation__
 *
 * To run a mutation, you first call `useCreateExamDraftVariantsMutationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateExamDraftVariantsMutationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createExamDraftVariantsMutationMutation, { data, loading, error }] = useCreateExamDraftVariantsMutationMutation({
 *   variables: {
 *      sourceQuestionId: // value for 'sourceQuestionId'
 *      totalVariants: // value for 'totalVariants'
 *   },
 * });
 */
export function useCreateExamDraftVariantsMutationMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateExamDraftVariantsMutationMutation, CreateExamDraftVariantsMutationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateExamDraftVariantsMutationMutation, CreateExamDraftVariantsMutationMutationVariables>(CreateExamDraftVariantsMutationDocument, options);
      }
export type CreateExamDraftVariantsMutationMutationHookResult = ReturnType<typeof useCreateExamDraftVariantsMutationMutation>;
export type CreateExamDraftVariantsMutationMutationResult = ApolloReactCommon.MutationResult<CreateExamDraftVariantsMutationMutation>;
export type CreateExamDraftVariantsMutationMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateExamDraftVariantsMutationMutation, CreateExamDraftVariantsMutationMutationVariables>;
export const CreateExamImportJobMutationDocument = gql`
    mutation CreateExamImportJobMutation($fileName: String!, $fileSizeBytes: Int!, $extractedText: String!, $sourceType: ExamImportSourceType!, $storageKey: String, $extractionJson: String, $classifierJson: String) {
  createExamImportJob(
    fileName: $fileName
    fileSizeBytes: $fileSizeBytes
    extractedText: $extractedText
    sourceType: $sourceType
    storageKey: $storageKey
    extractionJson: $extractionJson
    classifierJson: $classifierJson
  ) {
    id
    storageKey
    fileName
    fileSizeBytes
    sourceType
    status
    title
    extractionJson
    classifierJson
    errorMessage
    totalQuestions
    reviewCount
    createdAt
    updatedAt
    questions {
      id
      order
      type
      title
      prompt
      options
      answers
      score
      difficulty
      sourcePage
      sourceExcerpt
      sourceBlockId
      sourceBboxJson
      confidence
      needsReview
      createdAt
    }
  }
}
    `;
export type CreateExamImportJobMutationMutationFn = ApolloReactCommon.MutationFunction<CreateExamImportJobMutationMutation, CreateExamImportJobMutationMutationVariables>;

/**
 * __useCreateExamImportJobMutationMutation__
 *
 * To run a mutation, you first call `useCreateExamImportJobMutationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateExamImportJobMutationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createExamImportJobMutationMutation, { data, loading, error }] = useCreateExamImportJobMutationMutation({
 *   variables: {
 *      fileName: // value for 'fileName'
 *      fileSizeBytes: // value for 'fileSizeBytes'
 *      extractedText: // value for 'extractedText'
 *      sourceType: // value for 'sourceType'
 *      storageKey: // value for 'storageKey'
 *      extractionJson: // value for 'extractionJson'
 *      classifierJson: // value for 'classifierJson'
 *   },
 * });
 */
export function useCreateExamImportJobMutationMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateExamImportJobMutationMutation, CreateExamImportJobMutationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateExamImportJobMutationMutation, CreateExamImportJobMutationMutationVariables>(CreateExamImportJobMutationDocument, options);
      }
export type CreateExamImportJobMutationMutationHookResult = ReturnType<typeof useCreateExamImportJobMutationMutation>;
export type CreateExamImportJobMutationMutationResult = ApolloReactCommon.MutationResult<CreateExamImportJobMutationMutation>;
export type CreateExamImportJobMutationMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateExamImportJobMutationMutation, CreateExamImportJobMutationMutationVariables>;
export const CreateExamDocument = gql`
    mutation CreateExam($classId: ID!, $title: String!, $description: String, $mode: ExamMode!, $durationMinutes: Int!, $scheduledFor: String, $shuffleQuestions: Boolean!, $shuffleAnswers: Boolean!, $generationMode: ExamGenerationMode!, $rules: [ExamGenerationRuleInput!], $passingCriteriaType: PassingCriteriaType!, $passingThreshold: Int!) {
  createExam(
    classId: $classId
    title: $title
    description: $description
    mode: $mode
    durationMinutes: $durationMinutes
    scheduledFor: $scheduledFor
    shuffleQuestions: $shuffleQuestions
    shuffleAnswers: $shuffleAnswers
    generationMode: $generationMode
    rules: $rules
    passingCriteriaType: $passingCriteriaType
    passingThreshold: $passingThreshold
  ) {
    id
    title
    status
    mode
    durationMinutes
    scheduledFor
    shuffleQuestions
    shuffleAnswers
    generationMode
    generationRules {
      label
      bankIds
      difficulty
      count
      points
    }
    passingCriteriaType
    passingThreshold
    createdAt
    class {
      id
      name
    }
  }
}
    `;
export type CreateExamMutationFn = ApolloReactCommon.MutationFunction<CreateExamMutation, CreateExamMutationVariables>;

/**
 * __useCreateExamMutation__
 *
 * To run a mutation, you first call `useCreateExamMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateExamMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createExamMutation, { data, loading, error }] = useCreateExamMutation({
 *   variables: {
 *      classId: // value for 'classId'
 *      title: // value for 'title'
 *      description: // value for 'description'
 *      mode: // value for 'mode'
 *      durationMinutes: // value for 'durationMinutes'
 *      scheduledFor: // value for 'scheduledFor'
 *      shuffleQuestions: // value for 'shuffleQuestions'
 *      shuffleAnswers: // value for 'shuffleAnswers'
 *      generationMode: // value for 'generationMode'
 *      rules: // value for 'rules'
 *      passingCriteriaType: // value for 'passingCriteriaType'
 *      passingThreshold: // value for 'passingThreshold'
 *   },
 * });
 */
export function useCreateExamMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateExamMutation, CreateExamMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateExamMutation, CreateExamMutationVariables>(CreateExamDocument, options);
      }
export type CreateExamMutationHookResult = ReturnType<typeof useCreateExamMutation>;
export type CreateExamMutationResult = ApolloReactCommon.MutationResult<CreateExamMutation>;
export type CreateExamMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateExamMutation, CreateExamMutationVariables>;
export const CreateQuestionBankMutationDocument = gql`
    mutation CreateQuestionBankMutation($title: String!, $description: String, $grade: Int!, $subject: String!, $topic: String!, $visibility: QuestionBankVisibility!) {
  createQuestionBank(
    title: $title
    description: $description
    grade: $grade
    subject: $subject
    topic: $topic
    visibility: $visibility
  ) {
    id
    title
    grade
    subject
    topic
    visibility
  }
}
    `;
export type CreateQuestionBankMutationMutationFn = ApolloReactCommon.MutationFunction<CreateQuestionBankMutationMutation, CreateQuestionBankMutationMutationVariables>;

/**
 * __useCreateQuestionBankMutationMutation__
 *
 * To run a mutation, you first call `useCreateQuestionBankMutationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateQuestionBankMutationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createQuestionBankMutationMutation, { data, loading, error }] = useCreateQuestionBankMutationMutation({
 *   variables: {
 *      title: // value for 'title'
 *      description: // value for 'description'
 *      grade: // value for 'grade'
 *      subject: // value for 'subject'
 *      topic: // value for 'topic'
 *      visibility: // value for 'visibility'
 *   },
 * });
 */
export function useCreateQuestionBankMutationMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateQuestionBankMutationMutation, CreateQuestionBankMutationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateQuestionBankMutationMutation, CreateQuestionBankMutationMutationVariables>(CreateQuestionBankMutationDocument, options);
      }
export type CreateQuestionBankMutationMutationHookResult = ReturnType<typeof useCreateQuestionBankMutationMutation>;
export type CreateQuestionBankMutationMutationResult = ApolloReactCommon.MutationResult<CreateQuestionBankMutationMutation>;
export type CreateQuestionBankMutationMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateQuestionBankMutationMutation, CreateQuestionBankMutationMutationVariables>;
export const CreateQuestionVariantsMutationDocument = gql`
    mutation CreateQuestionVariantsMutation($sourceQuestionId: ID!, $totalVariants: Int!) {
  createQuestionVariants(
    sourceQuestionId: $sourceQuestionId
    totalVariants: $totalVariants
  ) {
    id
  }
}
    `;
export type CreateQuestionVariantsMutationMutationFn = ApolloReactCommon.MutationFunction<CreateQuestionVariantsMutationMutation, CreateQuestionVariantsMutationMutationVariables>;

/**
 * __useCreateQuestionVariantsMutationMutation__
 *
 * To run a mutation, you first call `useCreateQuestionVariantsMutationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateQuestionVariantsMutationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createQuestionVariantsMutationMutation, { data, loading, error }] = useCreateQuestionVariantsMutationMutation({
 *   variables: {
 *      sourceQuestionId: // value for 'sourceQuestionId'
 *      totalVariants: // value for 'totalVariants'
 *   },
 * });
 */
export function useCreateQuestionVariantsMutationMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateQuestionVariantsMutationMutation, CreateQuestionVariantsMutationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateQuestionVariantsMutationMutation, CreateQuestionVariantsMutationMutationVariables>(CreateQuestionVariantsMutationDocument, options);
      }
export type CreateQuestionVariantsMutationMutationHookResult = ReturnType<typeof useCreateQuestionVariantsMutationMutation>;
export type CreateQuestionVariantsMutationMutationResult = ApolloReactCommon.MutationResult<CreateQuestionVariantsMutationMutation>;
export type CreateQuestionVariantsMutationMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateQuestionVariantsMutationMutation, CreateQuestionVariantsMutationMutationVariables>;
export const CreateQuestionMutationDocument = gql`
    mutation CreateQuestionMutation($bankId: ID!, $type: QuestionType!, $title: String!, $prompt: String!, $options: [String!], $correctAnswer: String, $difficulty: Difficulty!, $shareScope: QuestionShareScope, $requiresAccessRequest: Boolean, $tags: [String!]) {
  createQuestion(
    bankId: $bankId
    type: $type
    title: $title
    prompt: $prompt
    options: $options
    correctAnswer: $correctAnswer
    difficulty: $difficulty
    shareScope: $shareScope
    requiresAccessRequest: $requiresAccessRequest
    tags: $tags
  ) {
    id
  }
}
    `;
export type CreateQuestionMutationMutationFn = ApolloReactCommon.MutationFunction<CreateQuestionMutationMutation, CreateQuestionMutationMutationVariables>;

/**
 * __useCreateQuestionMutationMutation__
 *
 * To run a mutation, you first call `useCreateQuestionMutationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateQuestionMutationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createQuestionMutationMutation, { data, loading, error }] = useCreateQuestionMutationMutation({
 *   variables: {
 *      bankId: // value for 'bankId'
 *      type: // value for 'type'
 *      title: // value for 'title'
 *      prompt: // value for 'prompt'
 *      options: // value for 'options'
 *      correctAnswer: // value for 'correctAnswer'
 *      difficulty: // value for 'difficulty'
 *      shareScope: // value for 'shareScope'
 *      requiresAccessRequest: // value for 'requiresAccessRequest'
 *      tags: // value for 'tags'
 *   },
 * });
 */
export function useCreateQuestionMutationMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateQuestionMutationMutation, CreateQuestionMutationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateQuestionMutationMutation, CreateQuestionMutationMutationVariables>(CreateQuestionMutationDocument, options);
      }
export type CreateQuestionMutationMutationHookResult = ReturnType<typeof useCreateQuestionMutationMutation>;
export type CreateQuestionMutationMutationResult = ApolloReactCommon.MutationResult<CreateQuestionMutationMutation>;
export type CreateQuestionMutationMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateQuestionMutationMutation, CreateQuestionMutationMutationVariables>;
export const DeleteQuestionMutationDocument = gql`
    mutation DeleteQuestionMutation($id: ID!) {
  deleteQuestion(id: $id)
}
    `;
export type DeleteQuestionMutationMutationFn = ApolloReactCommon.MutationFunction<DeleteQuestionMutationMutation, DeleteQuestionMutationMutationVariables>;

/**
 * __useDeleteQuestionMutationMutation__
 *
 * To run a mutation, you first call `useDeleteQuestionMutationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteQuestionMutationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteQuestionMutationMutation, { data, loading, error }] = useDeleteQuestionMutationMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteQuestionMutationMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteQuestionMutationMutation, DeleteQuestionMutationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteQuestionMutationMutation, DeleteQuestionMutationMutationVariables>(DeleteQuestionMutationDocument, options);
      }
export type DeleteQuestionMutationMutationHookResult = ReturnType<typeof useDeleteQuestionMutationMutation>;
export type DeleteQuestionMutationMutationResult = ApolloReactCommon.MutationResult<DeleteQuestionMutationMutation>;
export type DeleteQuestionMutationMutationOptions = ApolloReactCommon.BaseMutationOptions<DeleteQuestionMutationMutation, DeleteQuestionMutationMutationVariables>;
export const ForkQuestionToMyBankDocument = gql`
    mutation ForkQuestionToMyBank($questionId: ID!, $targetBankId: ID!) {
  forkQuestionToMyBank(questionId: $questionId, targetBankId: $targetBankId) {
    id
    title
    prompt
    bank {
      id
      title
    }
  }
}
    `;
export type ForkQuestionToMyBankMutationFn = ApolloReactCommon.MutationFunction<ForkQuestionToMyBankMutation, ForkQuestionToMyBankMutationVariables>;

/**
 * __useForkQuestionToMyBankMutation__
 *
 * To run a mutation, you first call `useForkQuestionToMyBankMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useForkQuestionToMyBankMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [forkQuestionToMyBankMutation, { data, loading, error }] = useForkQuestionToMyBankMutation({
 *   variables: {
 *      questionId: // value for 'questionId'
 *      targetBankId: // value for 'targetBankId'
 *   },
 * });
 */
export function useForkQuestionToMyBankMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ForkQuestionToMyBankMutation, ForkQuestionToMyBankMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<ForkQuestionToMyBankMutation, ForkQuestionToMyBankMutationVariables>(ForkQuestionToMyBankDocument, options);
      }
export type ForkQuestionToMyBankMutationHookResult = ReturnType<typeof useForkQuestionToMyBankMutation>;
export type ForkQuestionToMyBankMutationResult = ApolloReactCommon.MutationResult<ForkQuestionToMyBankMutation>;
export type ForkQuestionToMyBankMutationOptions = ApolloReactCommon.BaseMutationOptions<ForkQuestionToMyBankMutation, ForkQuestionToMyBankMutationVariables>;
export const GroupQuestionsAsVariantsMutationDocument = gql`
    mutation GroupQuestionsAsVariantsMutation($questionIds: [ID!]!) {
  groupQuestionsAsVariants(questionIds: $questionIds) {
    id
  }
}
    `;
export type GroupQuestionsAsVariantsMutationMutationFn = ApolloReactCommon.MutationFunction<GroupQuestionsAsVariantsMutationMutation, GroupQuestionsAsVariantsMutationMutationVariables>;

/**
 * __useGroupQuestionsAsVariantsMutationMutation__
 *
 * To run a mutation, you first call `useGroupQuestionsAsVariantsMutationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGroupQuestionsAsVariantsMutationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [groupQuestionsAsVariantsMutationMutation, { data, loading, error }] = useGroupQuestionsAsVariantsMutationMutation({
 *   variables: {
 *      questionIds: // value for 'questionIds'
 *   },
 * });
 */
export function useGroupQuestionsAsVariantsMutationMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<GroupQuestionsAsVariantsMutationMutation, GroupQuestionsAsVariantsMutationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<GroupQuestionsAsVariantsMutationMutation, GroupQuestionsAsVariantsMutationMutationVariables>(GroupQuestionsAsVariantsMutationDocument, options);
      }
export type GroupQuestionsAsVariantsMutationMutationHookResult = ReturnType<typeof useGroupQuestionsAsVariantsMutationMutation>;
export type GroupQuestionsAsVariantsMutationMutationResult = ApolloReactCommon.MutationResult<GroupQuestionsAsVariantsMutationMutation>;
export type GroupQuestionsAsVariantsMutationMutationOptions = ApolloReactCommon.BaseMutationOptions<GroupQuestionsAsVariantsMutationMutation, GroupQuestionsAsVariantsMutationMutationVariables>;
export const JoinCommunityActionDocument = gql`
    mutation JoinCommunityAction($communityId: ID!) {
  joinCommunity(communityId: $communityId) {
    id
    viewerRole
    memberCount
    sharedBankCount
  }
}
    `;
export type JoinCommunityActionMutationFn = ApolloReactCommon.MutationFunction<JoinCommunityActionMutation, JoinCommunityActionMutationVariables>;

/**
 * __useJoinCommunityActionMutation__
 *
 * To run a mutation, you first call `useJoinCommunityActionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useJoinCommunityActionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [joinCommunityActionMutation, { data, loading, error }] = useJoinCommunityActionMutation({
 *   variables: {
 *      communityId: // value for 'communityId'
 *   },
 * });
 */
export function useJoinCommunityActionMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<JoinCommunityActionMutation, JoinCommunityActionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<JoinCommunityActionMutation, JoinCommunityActionMutationVariables>(JoinCommunityActionDocument, options);
      }
export type JoinCommunityActionMutationHookResult = ReturnType<typeof useJoinCommunityActionMutation>;
export type JoinCommunityActionMutationResult = ApolloReactCommon.MutationResult<JoinCommunityActionMutation>;
export type JoinCommunityActionMutationOptions = ApolloReactCommon.BaseMutationOptions<JoinCommunityActionMutation, JoinCommunityActionMutationVariables>;
export const PublishExamDocument = gql`
    mutation PublishExam($examId: ID!) {
  publishExam(examId: $examId) {
    id
    status
    startedAt
    endsAt
  }
}
    `;
export type PublishExamMutationFn = ApolloReactCommon.MutationFunction<PublishExamMutation, PublishExamMutationVariables>;

/**
 * __usePublishExamMutation__
 *
 * To run a mutation, you first call `usePublishExamMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePublishExamMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [publishExamMutation, { data, loading, error }] = usePublishExamMutation({
 *   variables: {
 *      examId: // value for 'examId'
 *   },
 * });
 */
export function usePublishExamMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<PublishExamMutation, PublishExamMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<PublishExamMutation, PublishExamMutationVariables>(PublishExamDocument, options);
      }
export type PublishExamMutationHookResult = ReturnType<typeof usePublishExamMutation>;
export type PublishExamMutationResult = ApolloReactCommon.MutationResult<PublishExamMutation>;
export type PublishExamMutationOptions = ApolloReactCommon.BaseMutationOptions<PublishExamMutation, PublishExamMutationVariables>;
export const RateCommunityItemActionDocument = gql`
    mutation RateCommunityItemAction($communityId: ID!, $entityType: CommunityCommentEntityType!, $entityId: ID!, $value: Int!) {
  rateCommunityItem(
    communityId: $communityId
    entityType: $entityType
    entityId: $entityId
    value: $value
  )
}
    `;
export type RateCommunityItemActionMutationFn = ApolloReactCommon.MutationFunction<RateCommunityItemActionMutation, RateCommunityItemActionMutationVariables>;

/**
 * __useRateCommunityItemActionMutation__
 *
 * To run a mutation, you first call `useRateCommunityItemActionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRateCommunityItemActionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [rateCommunityItemActionMutation, { data, loading, error }] = useRateCommunityItemActionMutation({
 *   variables: {
 *      communityId: // value for 'communityId'
 *      entityType: // value for 'entityType'
 *      entityId: // value for 'entityId'
 *      value: // value for 'value'
 *   },
 * });
 */
export function useRateCommunityItemActionMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<RateCommunityItemActionMutation, RateCommunityItemActionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<RateCommunityItemActionMutation, RateCommunityItemActionMutationVariables>(RateCommunityItemActionDocument, options);
      }
export type RateCommunityItemActionMutationHookResult = ReturnType<typeof useRateCommunityItemActionMutation>;
export type RateCommunityItemActionMutationResult = ApolloReactCommon.MutationResult<RateCommunityItemActionMutation>;
export type RateCommunityItemActionMutationOptions = ApolloReactCommon.BaseMutationOptions<RateCommunityItemActionMutation, RateCommunityItemActionMutationVariables>;
export const RecordAttemptIntegrityEventDocument = gql`
    mutation RecordAttemptIntegrityEvent($attemptId: ID!, $type: AttemptIntegrityEventType!, $details: String) {
  recordAttemptIntegrityEvent(
    attemptId: $attemptId
    type: $type
    details: $details
  )
}
    `;
export type RecordAttemptIntegrityEventMutationFn = ApolloReactCommon.MutationFunction<RecordAttemptIntegrityEventMutation, RecordAttemptIntegrityEventMutationVariables>;

/**
 * __useRecordAttemptIntegrityEventMutation__
 *
 * To run a mutation, you first call `useRecordAttemptIntegrityEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRecordAttemptIntegrityEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [recordAttemptIntegrityEventMutation, { data, loading, error }] = useRecordAttemptIntegrityEventMutation({
 *   variables: {
 *      attemptId: // value for 'attemptId'
 *      type: // value for 'type'
 *      details: // value for 'details'
 *   },
 * });
 */
export function useRecordAttemptIntegrityEventMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<RecordAttemptIntegrityEventMutation, RecordAttemptIntegrityEventMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<RecordAttemptIntegrityEventMutation, RecordAttemptIntegrityEventMutationVariables>(RecordAttemptIntegrityEventDocument, options);
      }
export type RecordAttemptIntegrityEventMutationHookResult = ReturnType<typeof useRecordAttemptIntegrityEventMutation>;
export type RecordAttemptIntegrityEventMutationResult = ApolloReactCommon.MutationResult<RecordAttemptIntegrityEventMutation>;
export type RecordAttemptIntegrityEventMutationOptions = ApolloReactCommon.BaseMutationOptions<RecordAttemptIntegrityEventMutation, RecordAttemptIntegrityEventMutationVariables>;
export const RequestQuestionAccessDocument = gql`
    mutation RequestQuestionAccess($questionId: ID!) {
  requestQuestionAccess(questionId: $questionId) {
    id
    status
    createdAt
    reviewedAt
    question {
      id
    }
    requester {
      id
      fullName
    }
    owner {
      id
      fullName
    }
  }
}
    `;
export type RequestQuestionAccessMutationFn = ApolloReactCommon.MutationFunction<RequestQuestionAccessMutation, RequestQuestionAccessMutationVariables>;

/**
 * __useRequestQuestionAccessMutation__
 *
 * To run a mutation, you first call `useRequestQuestionAccessMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRequestQuestionAccessMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [requestQuestionAccessMutation, { data, loading, error }] = useRequestQuestionAccessMutation({
 *   variables: {
 *      questionId: // value for 'questionId'
 *   },
 * });
 */
export function useRequestQuestionAccessMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<RequestQuestionAccessMutation, RequestQuestionAccessMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<RequestQuestionAccessMutation, RequestQuestionAccessMutationVariables>(RequestQuestionAccessDocument, options);
      }
export type RequestQuestionAccessMutationHookResult = ReturnType<typeof useRequestQuestionAccessMutation>;
export type RequestQuestionAccessMutationResult = ApolloReactCommon.MutationResult<RequestQuestionAccessMutation>;
export type RequestQuestionAccessMutationOptions = ApolloReactCommon.BaseMutationOptions<RequestQuestionAccessMutation, RequestQuestionAccessMutationVariables>;
export const ReviewAnswerDocument = gql`
    mutation ReviewAnswer($answerId: ID!, $manualScore: Float!, $feedback: String) {
  reviewAnswer(
    answerId: $answerId
    manualScore: $manualScore
    feedback: $feedback
  ) {
    id
    manualScore
    feedback
  }
}
    `;
export type ReviewAnswerMutationFn = ApolloReactCommon.MutationFunction<ReviewAnswerMutation, ReviewAnswerMutationVariables>;

/**
 * __useReviewAnswerMutation__
 *
 * To run a mutation, you first call `useReviewAnswerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReviewAnswerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reviewAnswerMutation, { data, loading, error }] = useReviewAnswerMutation({
 *   variables: {
 *      answerId: // value for 'answerId'
 *      manualScore: // value for 'manualScore'
 *      feedback: // value for 'feedback'
 *   },
 * });
 */
export function useReviewAnswerMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ReviewAnswerMutation, ReviewAnswerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<ReviewAnswerMutation, ReviewAnswerMutationVariables>(ReviewAnswerDocument, options);
      }
export type ReviewAnswerMutationHookResult = ReturnType<typeof useReviewAnswerMutation>;
export type ReviewAnswerMutationResult = ApolloReactCommon.MutationResult<ReviewAnswerMutation>;
export type ReviewAnswerMutationOptions = ApolloReactCommon.BaseMutationOptions<ReviewAnswerMutation, ReviewAnswerMutationVariables>;
export const ReviewAttemptDocument = gql`
    mutation ReviewAttempt($attemptId: ID!, $answers: [AttemptReviewAnswerInput!]!) {
  reviewAttempt(attemptId: $attemptId, answers: $answers) {
    id
    status
    autoScore
    manualScore
    totalScore
    submittedAt
    answers {
      id
      autoScore
      manualScore
      feedback
    }
  }
}
    `;
export type ReviewAttemptMutationFn = ApolloReactCommon.MutationFunction<ReviewAttemptMutation, ReviewAttemptMutationVariables>;

/**
 * __useReviewAttemptMutation__
 *
 * To run a mutation, you first call `useReviewAttemptMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReviewAttemptMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reviewAttemptMutation, { data, loading, error }] = useReviewAttemptMutation({
 *   variables: {
 *      attemptId: // value for 'attemptId'
 *      answers: // value for 'answers'
 *   },
 * });
 */
export function useReviewAttemptMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ReviewAttemptMutation, ReviewAttemptMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<ReviewAttemptMutation, ReviewAttemptMutationVariables>(ReviewAttemptDocument, options);
      }
export type ReviewAttemptMutationHookResult = ReturnType<typeof useReviewAttemptMutation>;
export type ReviewAttemptMutationResult = ApolloReactCommon.MutationResult<ReviewAttemptMutation>;
export type ReviewAttemptMutationOptions = ApolloReactCommon.BaseMutationOptions<ReviewAttemptMutation, ReviewAttemptMutationVariables>;
export const ReviewQuestionAccessRequestDocument = gql`
    mutation ReviewQuestionAccessRequest($requestId: ID!, $approve: Boolean!) {
  reviewQuestionAccessRequest(requestId: $requestId, approve: $approve) {
    id
    status
    reviewedAt
    question {
      id
    }
  }
}
    `;
export type ReviewQuestionAccessRequestMutationFn = ApolloReactCommon.MutationFunction<ReviewQuestionAccessRequestMutation, ReviewQuestionAccessRequestMutationVariables>;

/**
 * __useReviewQuestionAccessRequestMutation__
 *
 * To run a mutation, you first call `useReviewQuestionAccessRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReviewQuestionAccessRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reviewQuestionAccessRequestMutation, { data, loading, error }] = useReviewQuestionAccessRequestMutation({
 *   variables: {
 *      requestId: // value for 'requestId'
 *      approve: // value for 'approve'
 *   },
 * });
 */
export function useReviewQuestionAccessRequestMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ReviewQuestionAccessRequestMutation, ReviewQuestionAccessRequestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<ReviewQuestionAccessRequestMutation, ReviewQuestionAccessRequestMutationVariables>(ReviewQuestionAccessRequestDocument, options);
      }
export type ReviewQuestionAccessRequestMutationHookResult = ReturnType<typeof useReviewQuestionAccessRequestMutation>;
export type ReviewQuestionAccessRequestMutationResult = ApolloReactCommon.MutationResult<ReviewQuestionAccessRequestMutation>;
export type ReviewQuestionAccessRequestMutationOptions = ApolloReactCommon.BaseMutationOptions<ReviewQuestionAccessRequestMutation, ReviewQuestionAccessRequestMutationVariables>;
export const SaveAnswerDocument = gql`
    mutation SaveAnswer($attemptId: ID!, $questionId: ID!, $value: String!) {
  saveAnswer(attemptId: $attemptId, questionId: $questionId, value: $value) {
    id
    status
    totalScore
    startedAt
    submittedAt
    answers {
      id
      value
      question {
        id
      }
    }
  }
}
    `;
export type SaveAnswerMutationFn = ApolloReactCommon.MutationFunction<SaveAnswerMutation, SaveAnswerMutationVariables>;

/**
 * __useSaveAnswerMutation__
 *
 * To run a mutation, you first call `useSaveAnswerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveAnswerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveAnswerMutation, { data, loading, error }] = useSaveAnswerMutation({
 *   variables: {
 *      attemptId: // value for 'attemptId'
 *      questionId: // value for 'questionId'
 *      value: // value for 'value'
 *   },
 * });
 */
export function useSaveAnswerMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SaveAnswerMutation, SaveAnswerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SaveAnswerMutation, SaveAnswerMutationVariables>(SaveAnswerDocument, options);
      }
export type SaveAnswerMutationHookResult = ReturnType<typeof useSaveAnswerMutation>;
export type SaveAnswerMutationResult = ApolloReactCommon.MutationResult<SaveAnswerMutation>;
export type SaveAnswerMutationOptions = ApolloReactCommon.BaseMutationOptions<SaveAnswerMutation, SaveAnswerMutationVariables>;
export const ShareExamToCommunityActionDocument = gql`
    mutation ShareExamToCommunityAction($communityId: ID!, $examId: ID!) {
  shareExamToCommunity(communityId: $communityId, examId: $examId) {
    id
    examId
    title
    description
    subject
    grade
    className
    status
    durationMinutes
    questionCount
    attemptCount
    averageScorePercent
    createdAt
    sharedBy {
      id
      fullName
    }
  }
}
    `;
export type ShareExamToCommunityActionMutationFn = ApolloReactCommon.MutationFunction<ShareExamToCommunityActionMutation, ShareExamToCommunityActionMutationVariables>;

/**
 * __useShareExamToCommunityActionMutation__
 *
 * To run a mutation, you first call `useShareExamToCommunityActionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useShareExamToCommunityActionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [shareExamToCommunityActionMutation, { data, loading, error }] = useShareExamToCommunityActionMutation({
 *   variables: {
 *      communityId: // value for 'communityId'
 *      examId: // value for 'examId'
 *   },
 * });
 */
export function useShareExamToCommunityActionMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ShareExamToCommunityActionMutation, ShareExamToCommunityActionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<ShareExamToCommunityActionMutation, ShareExamToCommunityActionMutationVariables>(ShareExamToCommunityActionDocument, options);
      }
export type ShareExamToCommunityActionMutationHookResult = ReturnType<typeof useShareExamToCommunityActionMutation>;
export type ShareExamToCommunityActionMutationResult = ApolloReactCommon.MutationResult<ShareExamToCommunityActionMutation>;
export type ShareExamToCommunityActionMutationOptions = ApolloReactCommon.BaseMutationOptions<ShareExamToCommunityActionMutation, ShareExamToCommunityActionMutationVariables>;
export const ShareQuestionBankToCommunityActionDocument = gql`
    mutation ShareQuestionBankToCommunityAction($communityId: ID!, $bankId: ID!) {
  shareQuestionBankToCommunity(communityId: $communityId, bankId: $bankId) {
    id
    status
    createdAt
    sharedBy {
      id
      fullName
    }
    bank {
      id
      title
      questionCount
      owner {
        id
        fullName
      }
    }
  }
}
    `;
export type ShareQuestionBankToCommunityActionMutationFn = ApolloReactCommon.MutationFunction<ShareQuestionBankToCommunityActionMutation, ShareQuestionBankToCommunityActionMutationVariables>;

/**
 * __useShareQuestionBankToCommunityActionMutation__
 *
 * To run a mutation, you first call `useShareQuestionBankToCommunityActionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useShareQuestionBankToCommunityActionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [shareQuestionBankToCommunityActionMutation, { data, loading, error }] = useShareQuestionBankToCommunityActionMutation({
 *   variables: {
 *      communityId: // value for 'communityId'
 *      bankId: // value for 'bankId'
 *   },
 * });
 */
export function useShareQuestionBankToCommunityActionMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ShareQuestionBankToCommunityActionMutation, ShareQuestionBankToCommunityActionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<ShareQuestionBankToCommunityActionMutation, ShareQuestionBankToCommunityActionMutationVariables>(ShareQuestionBankToCommunityActionDocument, options);
      }
export type ShareQuestionBankToCommunityActionMutationHookResult = ReturnType<typeof useShareQuestionBankToCommunityActionMutation>;
export type ShareQuestionBankToCommunityActionMutationResult = ApolloReactCommon.MutationResult<ShareQuestionBankToCommunityActionMutation>;
export type ShareQuestionBankToCommunityActionMutationOptions = ApolloReactCommon.BaseMutationOptions<ShareQuestionBankToCommunityActionMutation, ShareQuestionBankToCommunityActionMutationVariables>;
export const StartAttemptDocument = gql`
    mutation StartAttempt($examId: ID!, $studentId: ID!) {
  startAttempt(examId: $examId, studentId: $studentId) {
    id
    status
    totalScore
    startedAt
    submittedAt
    exam {
      id
    }
    answers {
      id
      value
      question {
        id
      }
    }
  }
}
    `;
export type StartAttemptMutationFn = ApolloReactCommon.MutationFunction<StartAttemptMutation, StartAttemptMutationVariables>;

/**
 * __useStartAttemptMutation__
 *
 * To run a mutation, you first call `useStartAttemptMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useStartAttemptMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [startAttemptMutation, { data, loading, error }] = useStartAttemptMutation({
 *   variables: {
 *      examId: // value for 'examId'
 *      studentId: // value for 'studentId'
 *   },
 * });
 */
export function useStartAttemptMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<StartAttemptMutation, StartAttemptMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<StartAttemptMutation, StartAttemptMutationVariables>(StartAttemptDocument, options);
      }
export type StartAttemptMutationHookResult = ReturnType<typeof useStartAttemptMutation>;
export type StartAttemptMutationResult = ApolloReactCommon.MutationResult<StartAttemptMutation>;
export type StartAttemptMutationOptions = ApolloReactCommon.BaseMutationOptions<StartAttemptMutation, StartAttemptMutationVariables>;
export const SubmitAttemptDocument = gql`
    mutation SubmitAttempt($attemptId: ID!) {
  submitAttempt(attemptId: $attemptId) {
    id
    status
    totalScore
    startedAt
    submittedAt
  }
}
    `;
export type SubmitAttemptMutationFn = ApolloReactCommon.MutationFunction<SubmitAttemptMutation, SubmitAttemptMutationVariables>;

/**
 * __useSubmitAttemptMutation__
 *
 * To run a mutation, you first call `useSubmitAttemptMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitAttemptMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitAttemptMutation, { data, loading, error }] = useSubmitAttemptMutation({
 *   variables: {
 *      attemptId: // value for 'attemptId'
 *   },
 * });
 */
export function useSubmitAttemptMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SubmitAttemptMutation, SubmitAttemptMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SubmitAttemptMutation, SubmitAttemptMutationVariables>(SubmitAttemptDocument, options);
      }
export type SubmitAttemptMutationHookResult = ReturnType<typeof useSubmitAttemptMutation>;
export type SubmitAttemptMutationResult = ApolloReactCommon.MutationResult<SubmitAttemptMutation>;
export type SubmitAttemptMutationOptions = ApolloReactCommon.BaseMutationOptions<SubmitAttemptMutation, SubmitAttemptMutationVariables>;
export const UpdateExamDraftDocument = gql`
    mutation UpdateExamDraft($examId: ID!, $classId: ID!, $title: String!, $description: String, $mode: ExamMode!, $durationMinutes: Int!, $scheduledFor: String, $shuffleQuestions: Boolean!, $shuffleAnswers: Boolean!, $generationMode: ExamGenerationMode!, $rules: [ExamGenerationRuleInput!], $passingCriteriaType: PassingCriteriaType!, $passingThreshold: Int!, $questionItems: [UpdateExamDraftQuestionInput!]) {
  updateExamDraft(
    examId: $examId
    classId: $classId
    title: $title
    description: $description
    mode: $mode
    durationMinutes: $durationMinutes
    scheduledFor: $scheduledFor
    shuffleQuestions: $shuffleQuestions
    shuffleAnswers: $shuffleAnswers
    generationMode: $generationMode
    rules: $rules
    passingCriteriaType: $passingCriteriaType
    passingThreshold: $passingThreshold
    questionItems: $questionItems
  ) {
    id
    title
    status
    mode
    durationMinutes
    scheduledFor
    shuffleQuestions
    shuffleAnswers
    generationMode
    generationRules {
      label
      bankIds
      difficulty
      count
      points
    }
    passingCriteriaType
    passingThreshold
    createdAt
    class {
      id
      name
    }
  }
}
    `;
export type UpdateExamDraftMutationFn = ApolloReactCommon.MutationFunction<UpdateExamDraftMutation, UpdateExamDraftMutationVariables>;

/**
 * __useUpdateExamDraftMutation__
 *
 * To run a mutation, you first call `useUpdateExamDraftMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateExamDraftMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateExamDraftMutation, { data, loading, error }] = useUpdateExamDraftMutation({
 *   variables: {
 *      examId: // value for 'examId'
 *      classId: // value for 'classId'
 *      title: // value for 'title'
 *      description: // value for 'description'
 *      mode: // value for 'mode'
 *      durationMinutes: // value for 'durationMinutes'
 *      scheduledFor: // value for 'scheduledFor'
 *      shuffleQuestions: // value for 'shuffleQuestions'
 *      shuffleAnswers: // value for 'shuffleAnswers'
 *      generationMode: // value for 'generationMode'
 *      rules: // value for 'rules'
 *      passingCriteriaType: // value for 'passingCriteriaType'
 *      passingThreshold: // value for 'passingThreshold'
 *      questionItems: // value for 'questionItems'
 *   },
 * });
 */
export function useUpdateExamDraftMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateExamDraftMutation, UpdateExamDraftMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateExamDraftMutation, UpdateExamDraftMutationVariables>(UpdateExamDraftDocument, options);
      }
export type UpdateExamDraftMutationHookResult = ReturnType<typeof useUpdateExamDraftMutation>;
export type UpdateExamDraftMutationResult = ApolloReactCommon.MutationResult<UpdateExamDraftMutation>;
export type UpdateExamDraftMutationOptions = ApolloReactCommon.BaseMutationOptions<UpdateExamDraftMutation, UpdateExamDraftMutationVariables>;
export const UpdateQuestionMutationDocument = gql`
    mutation UpdateQuestionMutation($id: ID!, $type: QuestionType!, $title: String!, $prompt: String!, $options: [String!], $correctAnswer: String, $difficulty: Difficulty!, $shareScope: QuestionShareScope, $requiresAccessRequest: Boolean, $tags: [String!]) {
  updateQuestion(
    id: $id
    type: $type
    title: $title
    prompt: $prompt
    options: $options
    correctAnswer: $correctAnswer
    difficulty: $difficulty
    shareScope: $shareScope
    requiresAccessRequest: $requiresAccessRequest
    tags: $tags
  ) {
    id
  }
}
    `;
export type UpdateQuestionMutationMutationFn = ApolloReactCommon.MutationFunction<UpdateQuestionMutationMutation, UpdateQuestionMutationMutationVariables>;

/**
 * __useUpdateQuestionMutationMutation__
 *
 * To run a mutation, you first call `useUpdateQuestionMutationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateQuestionMutationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateQuestionMutationMutation, { data, loading, error }] = useUpdateQuestionMutationMutation({
 *   variables: {
 *      id: // value for 'id'
 *      type: // value for 'type'
 *      title: // value for 'title'
 *      prompt: // value for 'prompt'
 *      options: // value for 'options'
 *      correctAnswer: // value for 'correctAnswer'
 *      difficulty: // value for 'difficulty'
 *      shareScope: // value for 'shareScope'
 *      requiresAccessRequest: // value for 'requiresAccessRequest'
 *      tags: // value for 'tags'
 *   },
 * });
 */
export function useUpdateQuestionMutationMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateQuestionMutationMutation, UpdateQuestionMutationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateQuestionMutationMutation, UpdateQuestionMutationMutationVariables>(UpdateQuestionMutationDocument, options);
      }
export type UpdateQuestionMutationMutationHookResult = ReturnType<typeof useUpdateQuestionMutationMutation>;
export type UpdateQuestionMutationMutationResult = ApolloReactCommon.MutationResult<UpdateQuestionMutationMutation>;
export type UpdateQuestionMutationMutationOptions = ApolloReactCommon.BaseMutationOptions<UpdateQuestionMutationMutation, UpdateQuestionMutationMutationVariables>;
export const ClassDetailDocument = gql`
    query ClassDetail($id: ID!) {
  class(id: $id) {
    id
    name
    description
    subject
    grade
    studentCount
    assignedExamCount
    upcomingExamCount
    completedExamCount
    averageScore
    teacher {
      id
      fullName
    }
    studentInsights {
      status
      lastActiveAt
      averageScore
      suspiciousEventCount
      integrityRisk
      lastIntegrityEventAt
      integritySignals {
        type
        severity
        count
      }
      integrityEvents {
        id
        type
        severity
        details
        createdAt
      }
      student {
        id
        fullName
        email
      }
    }
    examInsights {
      submittedCount
      totalStudents
      progressPercent
      averageScore
      questionCount
      exam {
        id
        title
        durationMinutes
        status
        createdAt
        scheduledFor
        startedAt
        endsAt
      }
    }
  }
}
    `;

/**
 * __useClassDetailQuery__
 *
 * To run a query within a React component, call `useClassDetailQuery` and pass it any options that fit your needs.
 * When your component renders, `useClassDetailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useClassDetailQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useClassDetailQuery(baseOptions: ApolloReactHooks.QueryHookOptions<ClassDetailQuery, ClassDetailQueryVariables> & ({ variables: ClassDetailQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<ClassDetailQuery, ClassDetailQueryVariables>(ClassDetailDocument, options);
      }
export function useClassDetailLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ClassDetailQuery, ClassDetailQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ClassDetailQuery, ClassDetailQueryVariables>(ClassDetailDocument, options);
        }
// @ts-ignore
export function useClassDetailSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<ClassDetailQuery, ClassDetailQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ClassDetailQuery, ClassDetailQueryVariables>;
export function useClassDetailSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ClassDetailQuery, ClassDetailQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ClassDetailQuery | undefined, ClassDetailQueryVariables>;
export function useClassDetailSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ClassDetailQuery, ClassDetailQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<ClassDetailQuery, ClassDetailQueryVariables>(ClassDetailDocument, options);
        }
export type ClassDetailQueryHookResult = ReturnType<typeof useClassDetailQuery>;
export type ClassDetailLazyQueryHookResult = ReturnType<typeof useClassDetailLazyQuery>;
export type ClassDetailSuspenseQueryHookResult = ReturnType<typeof useClassDetailSuspenseQuery>;
export type ClassDetailQueryResult = ApolloReactCommon.QueryResult<ClassDetailQuery, ClassDetailQueryVariables>;
export const ClassesListDocument = gql`
    query ClassesList {
  classes {
    id
    name
    subject
    grade
    studentCount
    assignedExamCount
    upcomingExamCount
    completedExamCount
    averageScore
  }
}
    `;

/**
 * __useClassesListQuery__
 *
 * To run a query within a React component, call `useClassesListQuery` and pass it any options that fit your needs.
 * When your component renders, `useClassesListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useClassesListQuery({
 *   variables: {
 *   },
 * });
 */
export function useClassesListQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<ClassesListQuery, ClassesListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<ClassesListQuery, ClassesListQueryVariables>(ClassesListDocument, options);
      }
export function useClassesListLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ClassesListQuery, ClassesListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ClassesListQuery, ClassesListQueryVariables>(ClassesListDocument, options);
        }
// @ts-ignore
export function useClassesListSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<ClassesListQuery, ClassesListQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ClassesListQuery, ClassesListQueryVariables>;
export function useClassesListSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ClassesListQuery, ClassesListQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ClassesListQuery | undefined, ClassesListQueryVariables>;
export function useClassesListSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ClassesListQuery, ClassesListQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<ClassesListQuery, ClassesListQueryVariables>(ClassesListDocument, options);
        }
export type ClassesListQueryHookResult = ReturnType<typeof useClassesListQuery>;
export type ClassesListLazyQueryHookResult = ReturnType<typeof useClassesListLazyQuery>;
export type ClassesListSuspenseQueryHookResult = ReturnType<typeof useClassesListSuspenseQuery>;
export type ClassesListQueryResult = ApolloReactCommon.QueryResult<ClassesListQuery, ClassesListQueryVariables>;
export const CommunityDetailDocument = gql`
    query CommunityDetail($id: ID!) {
  community(id: $id) {
    id
    name
    description
    subject
    grade
    visibility
    viewerRole
    memberCount
    sharedBankCount
    sharedExamCount
    topContributors {
      role
      sharedBankCount
      sharedExamCount
      commentCount
      score
      user {
        id
        fullName
      }
    }
    members {
      id
      role
      joinedAt
      user {
        id
        fullName
      }
    }
    sharedBanks {
      id
      status
      copyCount
      ratingCount
      averageRating
      viewerRating
      createdAt
      sharedBy {
        id
        fullName
      }
      comments {
        id
        entityType
        entityId
        body
        createdAt
        author {
          id
          fullName
        }
      }
      bank {
        id
        title
        description
        grade
        subject
        topic
        visibility
        questionCount
        createdAt
        owner {
          id
          fullName
        }
      }
    }
    sharedExams {
      id
      examId
      title
      description
      subject
      grade
      className
      status
      durationMinutes
      questionCount
      attemptCount
      averageScorePercent
      ratingCount
      averageRating
      viewerRating
      createdAt
      sharedBy {
        id
        fullName
      }
      comments {
        id
        entityType
        entityId
        body
        createdAt
        author {
          id
          fullName
        }
      }
    }
  }
}
    `;

/**
 * __useCommunityDetailQuery__
 *
 * To run a query within a React component, call `useCommunityDetailQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityDetailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityDetailQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useCommunityDetailQuery(baseOptions: ApolloReactHooks.QueryHookOptions<CommunityDetailQuery, CommunityDetailQueryVariables> & ({ variables: CommunityDetailQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CommunityDetailQuery, CommunityDetailQueryVariables>(CommunityDetailDocument, options);
      }
export function useCommunityDetailLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CommunityDetailQuery, CommunityDetailQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CommunityDetailQuery, CommunityDetailQueryVariables>(CommunityDetailDocument, options);
        }
// @ts-ignore
export function useCommunityDetailSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<CommunityDetailQuery, CommunityDetailQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CommunityDetailQuery, CommunityDetailQueryVariables>;
export function useCommunityDetailSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CommunityDetailQuery, CommunityDetailQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CommunityDetailQuery | undefined, CommunityDetailQueryVariables>;
export function useCommunityDetailSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CommunityDetailQuery, CommunityDetailQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<CommunityDetailQuery, CommunityDetailQueryVariables>(CommunityDetailDocument, options);
        }
export type CommunityDetailQueryHookResult = ReturnType<typeof useCommunityDetailQuery>;
export type CommunityDetailLazyQueryHookResult = ReturnType<typeof useCommunityDetailLazyQuery>;
export type CommunityDetailSuspenseQueryHookResult = ReturnType<typeof useCommunityDetailSuspenseQuery>;
export type CommunityDetailQueryResult = ApolloReactCommon.QueryResult<CommunityDetailQuery, CommunityDetailQueryVariables>;
export const CommunityExamPreviewDocument = gql`
    query CommunityExamPreview($examId: ID!, $communityId: ID) {
  communityExamPreview(examId: $examId, communityId: $communityId) {
    examId
    communityId
    communityName
    title
    description
    subject
    grade
    className
    status
    durationMinutes
    questionCount
    totalPoints
    passingCriteriaType
    passingThreshold
    createdAt
    sharedAt
    sharedBy {
      id
      fullName
    }
    summary {
      studentCount
      submittedCount
      averagePercent
      passRate
      highestPercent
      lowestPercent
      completionRate
    }
    questions {
      id
      order
      prompt
      type
      options
      correctAnswer
      points
      topic
      tags
    }
    scoreDistribution {
      label
      value
      meta
      note
    }
    topicPerformance {
      label
      value
      meta
      note
    }
    questionPerformance {
      label
      value
      meta
      note
    }
    insights {
      title
      description
      tone
    }
    overallConclusion
  }
}
    `;

/**
 * __useCommunityExamPreviewQuery__
 *
 * To run a query within a React component, call `useCommunityExamPreviewQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityExamPreviewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityExamPreviewQuery({
 *   variables: {
 *      examId: // value for 'examId'
 *      communityId: // value for 'communityId'
 *   },
 * });
 */
export function useCommunityExamPreviewQuery(baseOptions: ApolloReactHooks.QueryHookOptions<CommunityExamPreviewQuery, CommunityExamPreviewQueryVariables> & ({ variables: CommunityExamPreviewQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CommunityExamPreviewQuery, CommunityExamPreviewQueryVariables>(CommunityExamPreviewDocument, options);
      }
export function useCommunityExamPreviewLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CommunityExamPreviewQuery, CommunityExamPreviewQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CommunityExamPreviewQuery, CommunityExamPreviewQueryVariables>(CommunityExamPreviewDocument, options);
        }
// @ts-ignore
export function useCommunityExamPreviewSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<CommunityExamPreviewQuery, CommunityExamPreviewQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CommunityExamPreviewQuery, CommunityExamPreviewQueryVariables>;
export function useCommunityExamPreviewSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CommunityExamPreviewQuery, CommunityExamPreviewQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CommunityExamPreviewQuery | undefined, CommunityExamPreviewQueryVariables>;
export function useCommunityExamPreviewSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CommunityExamPreviewQuery, CommunityExamPreviewQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<CommunityExamPreviewQuery, CommunityExamPreviewQueryVariables>(CommunityExamPreviewDocument, options);
        }
export type CommunityExamPreviewQueryHookResult = ReturnType<typeof useCommunityExamPreviewQuery>;
export type CommunityExamPreviewLazyQueryHookResult = ReturnType<typeof useCommunityExamPreviewLazyQuery>;
export type CommunityExamPreviewSuspenseQueryHookResult = ReturnType<typeof useCommunityExamPreviewSuspenseQuery>;
export type CommunityExamPreviewQueryResult = ApolloReactCommon.QueryResult<CommunityExamPreviewQuery, CommunityExamPreviewQueryVariables>;
export const CommunityOverviewDocument = gql`
    query CommunityOverview {
  me {
    id
    fullName
    classes {
      id
      subject
      grade
    }
  }
  communityHome {
    stats {
      totalCommunities
      totalSharedBanks
      totalCopies
      activeTeachers
    }
    weeklyActivity {
      label
      value
    }
    trendingBanks {
      sharedBankId
      copyCount
      communityId
      communityName
      bank {
        id
        title
        description
        grade
        subject
        topic
        visibility
        questionCount
        createdAt
        owner {
          id
          fullName
        }
      }
    }
    topExams {
      examId
      title
      subject
      grade
      attemptCount
      averageScorePercent
      communityId
      communityName
      createdBy {
        id
        fullName
      }
    }
    mostMissedQuestions {
      questionId
      prompt
      subject
      grade
      topic
      bankTitle
      communityId
      communityName
      attemptCount
      missRate
    }
  }
  communities {
    id
    name
    description
    subject
    grade
    visibility
    viewerRole
    memberCount
    sharedBankCount
    createdAt
  }
  questionBanks {
    id
    title
    description
    grade
    subject
    topic
    topics
    visibility
    questionCount
    createdAt
    owner {
      id
      fullName
    }
  }
}
    `;

/**
 * __useCommunityOverviewQuery__
 *
 * To run a query within a React component, call `useCommunityOverviewQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityOverviewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityOverviewQuery({
 *   variables: {
 *   },
 * });
 */
export function useCommunityOverviewQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<CommunityOverviewQuery, CommunityOverviewQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CommunityOverviewQuery, CommunityOverviewQueryVariables>(CommunityOverviewDocument, options);
      }
export function useCommunityOverviewLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CommunityOverviewQuery, CommunityOverviewQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CommunityOverviewQuery, CommunityOverviewQueryVariables>(CommunityOverviewDocument, options);
        }
// @ts-ignore
export function useCommunityOverviewSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<CommunityOverviewQuery, CommunityOverviewQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CommunityOverviewQuery, CommunityOverviewQueryVariables>;
export function useCommunityOverviewSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CommunityOverviewQuery, CommunityOverviewQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CommunityOverviewQuery | undefined, CommunityOverviewQueryVariables>;
export function useCommunityOverviewSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CommunityOverviewQuery, CommunityOverviewQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<CommunityOverviewQuery, CommunityOverviewQueryVariables>(CommunityOverviewDocument, options);
        }
export type CommunityOverviewQueryHookResult = ReturnType<typeof useCommunityOverviewQuery>;
export type CommunityOverviewLazyQueryHookResult = ReturnType<typeof useCommunityOverviewLazyQuery>;
export type CommunityOverviewSuspenseQueryHookResult = ReturnType<typeof useCommunityOverviewSuspenseQuery>;
export type CommunityOverviewQueryResult = ApolloReactCommon.QueryResult<CommunityOverviewQuery, CommunityOverviewQueryVariables>;
export const CreateExamOptionsDocument = gql`
    query CreateExamOptions {
  me {
    id
  }
  questionAccessRequests {
    id
    status
    requester {
      id
    }
    question {
      id
    }
  }
  classes {
    id
    name
    subject
    grade
  }
  questionBanks {
    id
    title
    subject
    grade
    topic
  }
  questions {
    id
    title
    prompt
    type
    difficulty
    shareScope
    requiresAccessRequest
    createdAt
    options
    correctAnswer
    tags
    createdBy {
      id
      fullName
    }
    bank {
      id
      title
      subject
      grade
      topic
      owner {
        id
      }
    }
  }
}
    `;

/**
 * __useCreateExamOptionsQuery__
 *
 * To run a query within a React component, call `useCreateExamOptionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCreateExamOptionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCreateExamOptionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useCreateExamOptionsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<CreateExamOptionsQuery, CreateExamOptionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CreateExamOptionsQuery, CreateExamOptionsQueryVariables>(CreateExamOptionsDocument, options);
      }
export function useCreateExamOptionsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CreateExamOptionsQuery, CreateExamOptionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CreateExamOptionsQuery, CreateExamOptionsQueryVariables>(CreateExamOptionsDocument, options);
        }
// @ts-ignore
export function useCreateExamOptionsSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<CreateExamOptionsQuery, CreateExamOptionsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CreateExamOptionsQuery, CreateExamOptionsQueryVariables>;
export function useCreateExamOptionsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CreateExamOptionsQuery, CreateExamOptionsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CreateExamOptionsQuery | undefined, CreateExamOptionsQueryVariables>;
export function useCreateExamOptionsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CreateExamOptionsQuery, CreateExamOptionsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<CreateExamOptionsQuery, CreateExamOptionsQueryVariables>(CreateExamOptionsDocument, options);
        }
export type CreateExamOptionsQueryHookResult = ReturnType<typeof useCreateExamOptionsQuery>;
export type CreateExamOptionsLazyQueryHookResult = ReturnType<typeof useCreateExamOptionsLazyQuery>;
export type CreateExamOptionsSuspenseQueryHookResult = ReturnType<typeof useCreateExamOptionsSuspenseQuery>;
export type CreateExamOptionsQueryResult = ApolloReactCommon.QueryResult<CreateExamOptionsQuery, CreateExamOptionsQueryVariables>;
export const DashboardOverviewDocument = gql`
    query DashboardOverview {
  dashboardOverview {
    teacherName
    summary {
      pendingReviewCount
      draftExamCount
      ongoingExamCount
      scheduledExamCount
    }
    upcomingExams {
      id
      title
      scheduledFor
      questionCount
      status
    }
    recentResults {
      id
      title
      passCount
      failCount
      progressPercent
      averageScorePercent
    }
  }
}
    `;

/**
 * __useDashboardOverviewQuery__
 *
 * To run a query within a React component, call `useDashboardOverviewQuery` and pass it any options that fit your needs.
 * When your component renders, `useDashboardOverviewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDashboardOverviewQuery({
 *   variables: {
 *   },
 * });
 */
export function useDashboardOverviewQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<DashboardOverviewQuery, DashboardOverviewQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<DashboardOverviewQuery, DashboardOverviewQueryVariables>(DashboardOverviewDocument, options);
      }
export function useDashboardOverviewLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<DashboardOverviewQuery, DashboardOverviewQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<DashboardOverviewQuery, DashboardOverviewQueryVariables>(DashboardOverviewDocument, options);
        }
// @ts-ignore
export function useDashboardOverviewSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<DashboardOverviewQuery, DashboardOverviewQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<DashboardOverviewQuery, DashboardOverviewQueryVariables>;
export function useDashboardOverviewSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<DashboardOverviewQuery, DashboardOverviewQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<DashboardOverviewQuery | undefined, DashboardOverviewQueryVariables>;
export function useDashboardOverviewSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<DashboardOverviewQuery, DashboardOverviewQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<DashboardOverviewQuery, DashboardOverviewQueryVariables>(DashboardOverviewDocument, options);
        }
export type DashboardOverviewQueryHookResult = ReturnType<typeof useDashboardOverviewQuery>;
export type DashboardOverviewLazyQueryHookResult = ReturnType<typeof useDashboardOverviewLazyQuery>;
export type DashboardOverviewSuspenseQueryHookResult = ReturnType<typeof useDashboardOverviewSuspenseQuery>;
export type DashboardOverviewQueryResult = ApolloReactCommon.QueryResult<DashboardOverviewQuery, DashboardOverviewQueryVariables>;
export const EditExamDraftDocument = gql`
    query EditExamDraft($id: ID!) {
  exam(id: $id) {
    id
    title
    description
    mode
    status
    durationMinutes
    scheduledFor
    shuffleQuestions
    shuffleAnswers
    generationMode
    generationRules {
      label
      bankIds
      difficulty
      count
      points
    }
    passingCriteriaType
    passingThreshold
    class {
      id
      name
    }
    questions {
      id
      order
      points
      question {
        id
        bank {
          id
        }
      }
    }
  }
}
    `;

/**
 * __useEditExamDraftQuery__
 *
 * To run a query within a React component, call `useEditExamDraftQuery` and pass it any options that fit your needs.
 * When your component renders, `useEditExamDraftQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEditExamDraftQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useEditExamDraftQuery(baseOptions: ApolloReactHooks.QueryHookOptions<EditExamDraftQuery, EditExamDraftQueryVariables> & ({ variables: EditExamDraftQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<EditExamDraftQuery, EditExamDraftQueryVariables>(EditExamDraftDocument, options);
      }
export function useEditExamDraftLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<EditExamDraftQuery, EditExamDraftQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<EditExamDraftQuery, EditExamDraftQueryVariables>(EditExamDraftDocument, options);
        }
// @ts-ignore
export function useEditExamDraftSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<EditExamDraftQuery, EditExamDraftQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<EditExamDraftQuery, EditExamDraftQueryVariables>;
export function useEditExamDraftSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<EditExamDraftQuery, EditExamDraftQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<EditExamDraftQuery | undefined, EditExamDraftQueryVariables>;
export function useEditExamDraftSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<EditExamDraftQuery, EditExamDraftQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<EditExamDraftQuery, EditExamDraftQueryVariables>(EditExamDraftDocument, options);
        }
export type EditExamDraftQueryHookResult = ReturnType<typeof useEditExamDraftQuery>;
export type EditExamDraftLazyQueryHookResult = ReturnType<typeof useEditExamDraftLazyQuery>;
export type EditExamDraftSuspenseQueryHookResult = ReturnType<typeof useEditExamDraftSuspenseQuery>;
export type EditExamDraftQueryResult = ApolloReactCommon.QueryResult<EditExamDraftQuery, EditExamDraftQueryVariables>;
export const HealthQueryDocument = gql`
    query HealthQuery {
  health {
    ok
    service
    runtime
  }
}
    `;

/**
 * __useHealthQueryQuery__
 *
 * To run a query within a React component, call `useHealthQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useHealthQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHealthQueryQuery({
 *   variables: {
 *   },
 * });
 */
export function useHealthQueryQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<HealthQueryQuery, HealthQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<HealthQueryQuery, HealthQueryQueryVariables>(HealthQueryDocument, options);
      }
export function useHealthQueryLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<HealthQueryQuery, HealthQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<HealthQueryQuery, HealthQueryQueryVariables>(HealthQueryDocument, options);
        }
// @ts-ignore
export function useHealthQuerySuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<HealthQueryQuery, HealthQueryQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<HealthQueryQuery, HealthQueryQueryVariables>;
export function useHealthQuerySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<HealthQueryQuery, HealthQueryQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<HealthQueryQuery | undefined, HealthQueryQueryVariables>;
export function useHealthQuerySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<HealthQueryQuery, HealthQueryQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<HealthQueryQuery, HealthQueryQueryVariables>(HealthQueryDocument, options);
        }
export type HealthQueryQueryHookResult = ReturnType<typeof useHealthQueryQuery>;
export type HealthQueryLazyQueryHookResult = ReturnType<typeof useHealthQueryLazyQuery>;
export type HealthQuerySuspenseQueryHookResult = ReturnType<typeof useHealthQuerySuspenseQuery>;
export type HealthQueryQueryResult = ApolloReactCommon.QueryResult<HealthQueryQuery, HealthQueryQueryVariables>;
export const MyExamDetailQueryDocument = gql`
    query MyExamDetailQuery($id: ID!) {
  exam(id: $id) {
    id
    mode
    isTemplate
    sourceExamId
    title
    status
    durationMinutes
    passingCriteriaType
    passingThreshold
    createdAt
    startedAt
    endsAt
    createdBy {
      id
    }
    class {
      id
      name
      subject
      grade
      studentCount
    }
    questions {
      id
      points
      order
      question {
        id
        title
        prompt
        tags
        type
        options
        correctAnswer
        bank {
          id
          topic
        }
      }
    }
    attempts {
      id
      status
      autoScore
      manualScore
      totalScore
      startedAt
      submittedAt
      student {
        id
        fullName
      }
      answers {
        id
        value
        autoScore
        manualScore
        feedback
        createdAt
        question {
          id
          title
          prompt
          tags
          type
        }
      }
    }
  }
}
    `;

/**
 * __useMyExamDetailQueryQuery__
 *
 * To run a query within a React component, call `useMyExamDetailQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyExamDetailQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyExamDetailQueryQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useMyExamDetailQueryQuery(baseOptions: ApolloReactHooks.QueryHookOptions<MyExamDetailQueryQuery, MyExamDetailQueryQueryVariables> & ({ variables: MyExamDetailQueryQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<MyExamDetailQueryQuery, MyExamDetailQueryQueryVariables>(MyExamDetailQueryDocument, options);
      }
export function useMyExamDetailQueryLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<MyExamDetailQueryQuery, MyExamDetailQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<MyExamDetailQueryQuery, MyExamDetailQueryQueryVariables>(MyExamDetailQueryDocument, options);
        }
// @ts-ignore
export function useMyExamDetailQuerySuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<MyExamDetailQueryQuery, MyExamDetailQueryQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MyExamDetailQueryQuery, MyExamDetailQueryQueryVariables>;
export function useMyExamDetailQuerySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MyExamDetailQueryQuery, MyExamDetailQueryQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MyExamDetailQueryQuery | undefined, MyExamDetailQueryQueryVariables>;
export function useMyExamDetailQuerySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MyExamDetailQueryQuery, MyExamDetailQueryQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<MyExamDetailQueryQuery, MyExamDetailQueryQueryVariables>(MyExamDetailQueryDocument, options);
        }
export type MyExamDetailQueryQueryHookResult = ReturnType<typeof useMyExamDetailQueryQuery>;
export type MyExamDetailQueryLazyQueryHookResult = ReturnType<typeof useMyExamDetailQueryLazyQuery>;
export type MyExamDetailQuerySuspenseQueryHookResult = ReturnType<typeof useMyExamDetailQuerySuspenseQuery>;
export type MyExamDetailQueryQueryResult = ApolloReactCommon.QueryResult<MyExamDetailQueryQuery, MyExamDetailQueryQueryVariables>;
export const MyExamsSectionQueryDocument = gql`
    query MyExamsSectionQuery {
  me {
    id
    classes {
      id
    }
  }
  exams {
    id
    mode
    isTemplate
    sourceExamId
    title
    status
    durationMinutes
    passingCriteriaType
    passingThreshold
    createdAt
    scheduledFor
    startedAt
    endsAt
    createdBy {
      id
    }
    class {
      id
      name
      subject
      grade
      studentCount
    }
    questions {
      id
      points
      order
    }
    attempts {
      id
      status
      totalScore
    }
  }
}
    `;

/**
 * __useMyExamsSectionQueryQuery__
 *
 * To run a query within a React component, call `useMyExamsSectionQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyExamsSectionQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyExamsSectionQueryQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyExamsSectionQueryQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<MyExamsSectionQueryQuery, MyExamsSectionQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<MyExamsSectionQueryQuery, MyExamsSectionQueryQueryVariables>(MyExamsSectionQueryDocument, options);
      }
export function useMyExamsSectionQueryLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<MyExamsSectionQueryQuery, MyExamsSectionQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<MyExamsSectionQueryQuery, MyExamsSectionQueryQueryVariables>(MyExamsSectionQueryDocument, options);
        }
// @ts-ignore
export function useMyExamsSectionQuerySuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<MyExamsSectionQueryQuery, MyExamsSectionQueryQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MyExamsSectionQueryQuery, MyExamsSectionQueryQueryVariables>;
export function useMyExamsSectionQuerySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MyExamsSectionQueryQuery, MyExamsSectionQueryQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MyExamsSectionQueryQuery | undefined, MyExamsSectionQueryQueryVariables>;
export function useMyExamsSectionQuerySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MyExamsSectionQueryQuery, MyExamsSectionQueryQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<MyExamsSectionQueryQuery, MyExamsSectionQueryQueryVariables>(MyExamsSectionQueryDocument, options);
        }
export type MyExamsSectionQueryQueryHookResult = ReturnType<typeof useMyExamsSectionQueryQuery>;
export type MyExamsSectionQueryLazyQueryHookResult = ReturnType<typeof useMyExamsSectionQueryLazyQuery>;
export type MyExamsSectionQuerySuspenseQueryHookResult = ReturnType<typeof useMyExamsSectionQuerySuspenseQuery>;
export type MyExamsSectionQueryQueryResult = ApolloReactCommon.QueryResult<MyExamsSectionQueryQuery, MyExamsSectionQueryQueryVariables>;
export const MyExamsQueryDocument = gql`
    query MyExamsQuery {
  me {
    id
    classes {
      id
    }
  }
  exams {
    id
    mode
    isTemplate
    sourceExamId
    title
    status
    durationMinutes
    passingCriteriaType
    passingThreshold
    createdAt
    startedAt
    endsAt
    createdBy {
      id
    }
    class {
      id
      name
      subject
      grade
      students {
        id
        fullName
      }
    }
    questions {
      id
      points
      order
      question {
        id
        title
        prompt
        tags
        type
        options
        correctAnswer
        bank {
          id
          topic
        }
      }
    }
    attempts {
      id
      status
      autoScore
      manualScore
      totalScore
      startedAt
      submittedAt
      student {
        id
        fullName
      }
      answers {
        id
        value
        autoScore
        manualScore
        feedback
        createdAt
        question {
          id
          title
          prompt
          tags
          type
        }
      }
    }
  }
}
    `;

/**
 * __useMyExamsQueryQuery__
 *
 * To run a query within a React component, call `useMyExamsQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyExamsQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyExamsQueryQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyExamsQueryQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<MyExamsQueryQuery, MyExamsQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<MyExamsQueryQuery, MyExamsQueryQueryVariables>(MyExamsQueryDocument, options);
      }
export function useMyExamsQueryLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<MyExamsQueryQuery, MyExamsQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<MyExamsQueryQuery, MyExamsQueryQueryVariables>(MyExamsQueryDocument, options);
        }
// @ts-ignore
export function useMyExamsQuerySuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<MyExamsQueryQuery, MyExamsQueryQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MyExamsQueryQuery, MyExamsQueryQueryVariables>;
export function useMyExamsQuerySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MyExamsQueryQuery, MyExamsQueryQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MyExamsQueryQuery | undefined, MyExamsQueryQueryVariables>;
export function useMyExamsQuerySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MyExamsQueryQuery, MyExamsQueryQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<MyExamsQueryQuery, MyExamsQueryQueryVariables>(MyExamsQueryDocument, options);
        }
export type MyExamsQueryQueryHookResult = ReturnType<typeof useMyExamsQueryQuery>;
export type MyExamsQueryLazyQueryHookResult = ReturnType<typeof useMyExamsQueryLazyQuery>;
export type MyExamsQuerySuspenseQueryHookResult = ReturnType<typeof useMyExamsQuerySuspenseQuery>;
export type MyExamsQueryQueryResult = ApolloReactCommon.QueryResult<MyExamsQueryQuery, MyExamsQueryQueryVariables>;
export const QuestionBankDetailQueryDocument = gql`
    query QuestionBankDetailQuery($id: ID!) {
  me {
    id
  }
  questionAccessRequests {
    id
    status
    createdAt
    reviewedAt
    requester {
      id
      fullName
    }
    owner {
      id
      fullName
    }
    question {
      id
      title
      prompt
      bank {
        id
        title
      }
    }
  }
  questionBanks {
    id
    title
    grade
    subject
    topic
    owner {
      id
    }
  }
  questionBank(id: $id) {
    id
    title
    description
    grade
    subject
    topic
    topics
    visibility
    questionCount
    owner {
      id
      fullName
    }
    questions {
      id
      title
      prompt
      type
      difficulty
      shareScope
      requiresAccessRequest
      options
      correctAnswer
      tags
      createdBy {
        id
        fullName
      }
    }
  }
}
    `;

/**
 * __useQuestionBankDetailQueryQuery__
 *
 * To run a query within a React component, call `useQuestionBankDetailQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useQuestionBankDetailQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useQuestionBankDetailQueryQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useQuestionBankDetailQueryQuery(baseOptions: ApolloReactHooks.QueryHookOptions<QuestionBankDetailQueryQuery, QuestionBankDetailQueryQueryVariables> & ({ variables: QuestionBankDetailQueryQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<QuestionBankDetailQueryQuery, QuestionBankDetailQueryQueryVariables>(QuestionBankDetailQueryDocument, options);
      }
export function useQuestionBankDetailQueryLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<QuestionBankDetailQueryQuery, QuestionBankDetailQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<QuestionBankDetailQueryQuery, QuestionBankDetailQueryQueryVariables>(QuestionBankDetailQueryDocument, options);
        }
// @ts-ignore
export function useQuestionBankDetailQuerySuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<QuestionBankDetailQueryQuery, QuestionBankDetailQueryQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<QuestionBankDetailQueryQuery, QuestionBankDetailQueryQueryVariables>;
export function useQuestionBankDetailQuerySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<QuestionBankDetailQueryQuery, QuestionBankDetailQueryQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<QuestionBankDetailQueryQuery | undefined, QuestionBankDetailQueryQueryVariables>;
export function useQuestionBankDetailQuerySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<QuestionBankDetailQueryQuery, QuestionBankDetailQueryQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<QuestionBankDetailQueryQuery, QuestionBankDetailQueryQueryVariables>(QuestionBankDetailQueryDocument, options);
        }
export type QuestionBankDetailQueryQueryHookResult = ReturnType<typeof useQuestionBankDetailQueryQuery>;
export type QuestionBankDetailQueryLazyQueryHookResult = ReturnType<typeof useQuestionBankDetailQueryLazyQuery>;
export type QuestionBankDetailQuerySuspenseQueryHookResult = ReturnType<typeof useQuestionBankDetailQuerySuspenseQuery>;
export type QuestionBankDetailQueryQueryResult = ApolloReactCommon.QueryResult<QuestionBankDetailQueryQuery, QuestionBankDetailQueryQueryVariables>;
export const QuestionBanksQueryDocument = gql`
    query QuestionBanksQuery {
  me {
    id
  }
  questionBanks {
    id
    title
    description
    grade
    subject
    topic
    topics
    visibility
    questionCount
    createdAt
    owner {
      id
      fullName
    }
  }
}
    `;

/**
 * __useQuestionBanksQueryQuery__
 *
 * To run a query within a React component, call `useQuestionBanksQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useQuestionBanksQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useQuestionBanksQueryQuery({
 *   variables: {
 *   },
 * });
 */
export function useQuestionBanksQueryQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<QuestionBanksQueryQuery, QuestionBanksQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<QuestionBanksQueryQuery, QuestionBanksQueryQueryVariables>(QuestionBanksQueryDocument, options);
      }
export function useQuestionBanksQueryLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<QuestionBanksQueryQuery, QuestionBanksQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<QuestionBanksQueryQuery, QuestionBanksQueryQueryVariables>(QuestionBanksQueryDocument, options);
        }
// @ts-ignore
export function useQuestionBanksQuerySuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<QuestionBanksQueryQuery, QuestionBanksQueryQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<QuestionBanksQueryQuery, QuestionBanksQueryQueryVariables>;
export function useQuestionBanksQuerySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<QuestionBanksQueryQuery, QuestionBanksQueryQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<QuestionBanksQueryQuery | undefined, QuestionBanksQueryQueryVariables>;
export function useQuestionBanksQuerySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<QuestionBanksQueryQuery, QuestionBanksQueryQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<QuestionBanksQueryQuery, QuestionBanksQueryQueryVariables>(QuestionBanksQueryDocument, options);
        }
export type QuestionBanksQueryQueryHookResult = ReturnType<typeof useQuestionBanksQueryQuery>;
export type QuestionBanksQueryLazyQueryHookResult = ReturnType<typeof useQuestionBanksQueryLazyQuery>;
export type QuestionBanksQuerySuspenseQueryHookResult = ReturnType<typeof useQuestionBanksQuerySuspenseQuery>;
export type QuestionBanksQueryQueryResult = ApolloReactCommon.QueryResult<QuestionBanksQueryQuery, QuestionBanksQueryQueryVariables>;
export const StudentExamRoomDocument = gql`
    query StudentExamRoom($id: ID!) {
  me {
    id
    fullName
  }
  exam(id: $id) {
    id
    title
    description
    mode
    status
    durationMinutes
    startedAt
    endsAt
    scheduledFor
    shuffleQuestions
    shuffleAnswers
    passingCriteriaType
    passingThreshold
    createdAt
    class {
      id
      name
      subject
      grade
      teacher {
        id
        fullName
      }
    }
    questions {
      id
      order
      points
      question {
        id
        title
        prompt
        tags
        type
        difficulty
        options
        correctAnswer
        bank {
          id
          topic
        }
      }
    }
  }
  attempts {
    id
    status
    totalScore
    generationSeed
    startedAt
    submittedAt
    exam {
      id
    }
    answers {
      id
      value
      autoScore
      manualScore
      feedback
      question {
        id
        title
        prompt
        type
        correctAnswer
        tags
        bank {
          id
          topic
        }
      }
    }
  }
}
    `;

/**
 * __useStudentExamRoomQuery__
 *
 * To run a query within a React component, call `useStudentExamRoomQuery` and pass it any options that fit your needs.
 * When your component renders, `useStudentExamRoomQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useStudentExamRoomQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useStudentExamRoomQuery(baseOptions: ApolloReactHooks.QueryHookOptions<StudentExamRoomQuery, StudentExamRoomQueryVariables> & ({ variables: StudentExamRoomQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<StudentExamRoomQuery, StudentExamRoomQueryVariables>(StudentExamRoomDocument, options);
      }
export function useStudentExamRoomLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<StudentExamRoomQuery, StudentExamRoomQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<StudentExamRoomQuery, StudentExamRoomQueryVariables>(StudentExamRoomDocument, options);
        }
// @ts-ignore
export function useStudentExamRoomSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<StudentExamRoomQuery, StudentExamRoomQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<StudentExamRoomQuery, StudentExamRoomQueryVariables>;
export function useStudentExamRoomSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<StudentExamRoomQuery, StudentExamRoomQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<StudentExamRoomQuery | undefined, StudentExamRoomQueryVariables>;
export function useStudentExamRoomSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<StudentExamRoomQuery, StudentExamRoomQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<StudentExamRoomQuery, StudentExamRoomQueryVariables>(StudentExamRoomDocument, options);
        }
export type StudentExamRoomQueryHookResult = ReturnType<typeof useStudentExamRoomQuery>;
export type StudentExamRoomLazyQueryHookResult = ReturnType<typeof useStudentExamRoomLazyQuery>;
export type StudentExamRoomSuspenseQueryHookResult = ReturnType<typeof useStudentExamRoomSuspenseQuery>;
export type StudentExamRoomQueryResult = ApolloReactCommon.QueryResult<StudentExamRoomQuery, StudentExamRoomQueryVariables>;
export const StudentHomeDocument = gql`
    query StudentHome {
  me {
    id
    fullName
    classes {
      id
      name
      subject
      grade
      teacher {
        id
        fullName
      }
    }
  }
  exams {
    id
    title
    mode
    status
    durationMinutes
    startedAt
    endsAt
    scheduledFor
    createdAt
    class {
      id
      name
      subject
      grade
      teacher {
        id
        fullName
      }
    }
    questions {
      id
      points
    }
  }
  attempts {
    id
    status
    totalScore
    startedAt
    submittedAt
    exam {
      id
      title
      mode
      status
      durationMinutes
      startedAt
      endsAt
      scheduledFor
      createdAt
      class {
        id
        name
        subject
        grade
        teacher {
          id
          fullName
        }
      }
      questions {
        id
        points
      }
    }
  }
}
    `;

/**
 * __useStudentHomeQuery__
 *
 * To run a query within a React component, call `useStudentHomeQuery` and pass it any options that fit your needs.
 * When your component renders, `useStudentHomeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useStudentHomeQuery({
 *   variables: {
 *   },
 * });
 */
export function useStudentHomeQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<StudentHomeQuery, StudentHomeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<StudentHomeQuery, StudentHomeQueryVariables>(StudentHomeDocument, options);
      }
export function useStudentHomeLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<StudentHomeQuery, StudentHomeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<StudentHomeQuery, StudentHomeQueryVariables>(StudentHomeDocument, options);
        }
// @ts-ignore
export function useStudentHomeSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<StudentHomeQuery, StudentHomeQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<StudentHomeQuery, StudentHomeQueryVariables>;
export function useStudentHomeSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<StudentHomeQuery, StudentHomeQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<StudentHomeQuery | undefined, StudentHomeQueryVariables>;
export function useStudentHomeSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<StudentHomeQuery, StudentHomeQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<StudentHomeQuery, StudentHomeQueryVariables>(StudentHomeDocument, options);
        }
export type StudentHomeQueryHookResult = ReturnType<typeof useStudentHomeQuery>;
export type StudentHomeLazyQueryHookResult = ReturnType<typeof useStudentHomeLazyQuery>;
export type StudentHomeSuspenseQueryHookResult = ReturnType<typeof useStudentHomeSuspenseQuery>;
export type StudentHomeQueryResult = ApolloReactCommon.QueryResult<StudentHomeQuery, StudentHomeQueryVariables>;