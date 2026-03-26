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
  autoScore?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['String']['output'];
  feedback?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  manualScore?: Maybe<Scalars['Int']['output']>;
  question: Question;
  value: Scalars['String']['output'];
};

export type Attempt = {
  __typename?: 'Attempt';
  answers: Array<Answer>;
  autoScore: Scalars['Int']['output'];
  exam: Exam;
  id: Scalars['ID']['output'];
  manualScore: Scalars['Int']['output'];
  startedAt: Scalars['String']['output'];
  status: AttemptStatus;
  student: User;
  submittedAt?: Maybe<Scalars['String']['output']>;
  totalScore: Scalars['Int']['output'];
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
  lastActiveAt?: Maybe<Scalars['String']['output']>;
  status: ClassStudentStatus;
  student: User;
};

export enum ClassStudentStatus {
  Completed = 'COMPLETED',
  InProgress = 'IN_PROGRESS',
  NotStarted = 'NOT_STARTED'
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
  id: Scalars['ID']['output'];
  mode: ExamMode;
  questions: Array<ExamQuestion>;
  scheduledFor?: Maybe<Scalars['String']['output']>;
  status: ExamStatus;
  title: Scalars['String']['output'];
};

export enum ExamMode {
  OpenWindow = 'OPEN_WINDOW',
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

export type Mutation = {
  __typename?: 'Mutation';
  addQuestionToExam: Exam;
  closeExam: Exam;
  createClass: Class;
  createExam: Exam;
  createQuestion: Question;
  createQuestionBank: QuestionBank;
  deleteQuestion: Scalars['Boolean']['output'];
  publishExam: Exam;
  saveAnswer: Attempt;
  startAttempt: Attempt;
  submitAttempt: Attempt;
  updateQuestion: Question;
};


export type MutationAddQuestionToExamArgs = {
  examId: Scalars['ID']['input'];
  points: Scalars['Int']['input'];
  questionId: Scalars['ID']['input'];
};


export type MutationCloseExamArgs = {
  examId: Scalars['ID']['input'];
};


export type MutationCreateClassArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationCreateExamArgs = {
  classId: Scalars['ID']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  durationMinutes: Scalars['Int']['input'];
  mode?: InputMaybe<ExamMode>;
  scheduledFor?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};


export type MutationCreateQuestionArgs = {
  bankId: Scalars['ID']['input'];
  correctAnswer?: InputMaybe<Scalars['String']['input']>;
  difficulty?: InputMaybe<Difficulty>;
  options?: InputMaybe<Array<Scalars['String']['input']>>;
  prompt: Scalars['String']['input'];
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title: Scalars['String']['input'];
  type: QuestionType;
};


export type MutationCreateQuestionBankArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};


export type MutationDeleteQuestionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationPublishExamArgs = {
  examId: Scalars['ID']['input'];
};


export type MutationSaveAnswerArgs = {
  attemptId: Scalars['ID']['input'];
  questionId: Scalars['ID']['input'];
  value: Scalars['String']['input'];
};


export type MutationStartAttemptArgs = {
  examId: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
};


export type MutationSubmitAttemptArgs = {
  attemptId: Scalars['ID']['input'];
};


export type MutationUpdateQuestionArgs = {
  correctAnswer?: InputMaybe<Scalars['String']['input']>;
  difficulty?: InputMaybe<Difficulty>;
  id: Scalars['ID']['input'];
  options?: InputMaybe<Array<Scalars['String']['input']>>;
  prompt: Scalars['String']['input'];
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title: Scalars['String']['input'];
  type: QuestionType;
};

export type Query = {
  __typename?: 'Query';
  attempt?: Maybe<Attempt>;
  attempts: Array<Attempt>;
  class?: Maybe<Class>;
  classes: Array<Class>;
  dashboardOverview: DashboardOverview;
  exam?: Maybe<Exam>;
  exams: Array<Exam>;
  health: Health;
  hello: Hello;
  me?: Maybe<User>;
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


export type QueryExamArgs = {
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
  correctAnswer?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  createdBy: User;
  difficulty: Difficulty;
  id: Scalars['ID']['output'];
  options: Array<Scalars['String']['output']>;
  prompt: Scalars['String']['output'];
  tags: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  type: QuestionType;
};

export type QuestionBank = {
  __typename?: 'QuestionBank';
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  owner: User;
  questionCount: Scalars['Int']['output'];
  questions: Array<Question>;
  subject: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

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

export type User = {
  __typename?: 'User';
  classes: Array<Class>;
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  role: Role;
};

export type AddQuestionToExamMutationVariables = Exact<{
  examId: Scalars['ID']['input'];
  questionId: Scalars['ID']['input'];
  points: Scalars['Int']['input'];
}>;


export type AddQuestionToExamMutation = { __typename?: 'Mutation', addQuestionToExam: { __typename?: 'Exam', id: string, questions: Array<{ __typename?: 'ExamQuestion', id: string, points: number, order: number, question: { __typename?: 'Question', id: string } }> } };

export type CloseExamMutationVariables = Exact<{
  examId: Scalars['ID']['input'];
}>;


export type CloseExamMutation = { __typename?: 'Mutation', closeExam: { __typename?: 'Exam', id: string, status: ExamStatus } };

export type CreateExamMutationVariables = Exact<{
  classId: Scalars['ID']['input'];
  title: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  mode: ExamMode;
  durationMinutes: Scalars['Int']['input'];
  scheduledFor?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateExamMutation = { __typename?: 'Mutation', createExam: { __typename?: 'Exam', id: string, title: string, status: ExamStatus, mode: ExamMode, durationMinutes: number, scheduledFor?: string | null, createdAt: string, class: { __typename?: 'Class', id: string, name: string } } };

export type CreateQuestionMutationMutationVariables = Exact<{
  bankId: Scalars['ID']['input'];
  type: QuestionType;
  title: Scalars['String']['input'];
  prompt: Scalars['String']['input'];
  options?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  correctAnswer?: InputMaybe<Scalars['String']['input']>;
  difficulty: Difficulty;
  tags?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type CreateQuestionMutationMutation = { __typename?: 'Mutation', createQuestion: { __typename?: 'Question', id: string } };

export type DeleteQuestionMutationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteQuestionMutationMutation = { __typename?: 'Mutation', deleteQuestion: boolean };

export type UpdateQuestionMutationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  type: QuestionType;
  title: Scalars['String']['input'];
  prompt: Scalars['String']['input'];
  options?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  correctAnswer?: InputMaybe<Scalars['String']['input']>;
  difficulty: Difficulty;
  tags?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type UpdateQuestionMutationMutation = { __typename?: 'Mutation', updateQuestion: { __typename?: 'Question', id: string } };

export type ClassDetailQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ClassDetailQuery = { __typename?: 'Query', class?: { __typename?: 'Class', id: string, name: string, description?: string | null, subject: string, grade: number, studentCount: number, assignedExamCount: number, upcomingExamCount: number, completedExamCount: number, averageScore?: number | null, teacher: { __typename?: 'User', id: string, fullName: string }, studentInsights: Array<{ __typename?: 'ClassStudentInsight', status: ClassStudentStatus, lastActiveAt?: string | null, averageScore?: number | null, student: { __typename?: 'User', id: string, fullName: string, email: string } }>, examInsights: Array<{ __typename?: 'ClassExamInsight', submittedCount: number, totalStudents: number, progressPercent: number, averageScore?: number | null, questionCount: number, exam: { __typename?: 'Exam', id: string, title: string, durationMinutes: number, status: ExamStatus } }> } | null };

export type ClassesListQueryVariables = Exact<{ [key: string]: never; }>;


export type ClassesListQuery = { __typename?: 'Query', classes: Array<{ __typename?: 'Class', id: string, name: string, subject: string, grade: number, studentCount: number, upcomingExamCount: number, completedExamCount: number }> };

export type CreateExamOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type CreateExamOptionsQuery = { __typename?: 'Query', classes: Array<{ __typename?: 'Class', id: string, name: string }>, questionBanks: Array<{ __typename?: 'QuestionBank', id: string, title: string, subject: string }>, questions: Array<{ __typename?: 'Question', id: string, title: string, prompt: string, type: QuestionType, difficulty: Difficulty, bank: { __typename?: 'QuestionBank', id: string, title: string, subject: string } }> };

export type DashboardOverviewQueryVariables = Exact<{ [key: string]: never; }>;


export type DashboardOverviewQuery = { __typename?: 'Query', dashboardOverview: { __typename?: 'DashboardOverview', teacherName: string, summary: { __typename?: 'DashboardMetricSummary', pendingReviewCount: number, draftExamCount: number, ongoingExamCount: number, scheduledExamCount: number }, upcomingExams: Array<{ __typename?: 'DashboardUpcomingExam', id: string, title: string, scheduledFor: string, questionCount: number, status: ExamStatus }>, recentResults: Array<{ __typename?: 'DashboardRecentResult', id: string, title: string, passCount: number, failCount: number, progressPercent: number, averageScorePercent: number }> } };

export type HealthQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type HealthQueryQuery = { __typename?: 'Query', health: { __typename?: 'Health', ok: boolean, service: string, runtime: string } };

export type MyExamsQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type MyExamsQueryQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null, exams: Array<{ __typename?: 'Exam', id: string, title: string, status: ExamStatus, durationMinutes: number, createdAt: string, createdBy: { __typename?: 'User', id: string }, class: { __typename?: 'Class', id: string, name: string, students: Array<{ __typename?: 'User', id: string, fullName: string }> }, questions: Array<{ __typename?: 'ExamQuestion', id: string, points: number, order: number, question: { __typename?: 'Question', id: string, title: string, prompt: string, type: QuestionType, options: Array<string> } }>, attempts: Array<{ __typename?: 'Attempt', id: string, status: AttemptStatus, totalScore: number, startedAt: string, submittedAt?: string | null, student: { __typename?: 'User', id: string, fullName: string } }> }> };

export type QuestionBankDetailQueryQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type QuestionBankDetailQueryQuery = { __typename?: 'Query', questionBank?: { __typename?: 'QuestionBank', id: string, title: string, description?: string | null, subject: string, questionCount: number, questions: Array<{ __typename?: 'Question', id: string, title: string, prompt: string, type: QuestionType, difficulty: Difficulty, options: Array<string>, correctAnswer?: string | null, tags: Array<string> }> } | null };

export type QuestionBanksQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type QuestionBanksQueryQuery = { __typename?: 'Query', questionBanks: Array<{ __typename?: 'QuestionBank', id: string, title: string, description?: string | null, subject: string, questionCount: number, createdAt: string }> };


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
export const CreateExamDocument = gql`
    mutation CreateExam($classId: ID!, $title: String!, $description: String, $mode: ExamMode!, $durationMinutes: Int!, $scheduledFor: String) {
  createExam(
    classId: $classId
    title: $title
    description: $description
    mode: $mode
    durationMinutes: $durationMinutes
    scheduledFor: $scheduledFor
  ) {
    id
    title
    status
    mode
    durationMinutes
    scheduledFor
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
export const CreateQuestionMutationDocument = gql`
    mutation CreateQuestionMutation($bankId: ID!, $type: QuestionType!, $title: String!, $prompt: String!, $options: [String!], $correctAnswer: String, $difficulty: Difficulty!, $tags: [String!]) {
  createQuestion(
    bankId: $bankId
    type: $type
    title: $title
    prompt: $prompt
    options: $options
    correctAnswer: $correctAnswer
    difficulty: $difficulty
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
export const UpdateQuestionMutationDocument = gql`
    mutation UpdateQuestionMutation($id: ID!, $type: QuestionType!, $title: String!, $prompt: String!, $options: [String!], $correctAnswer: String, $difficulty: Difficulty!, $tags: [String!]) {
  updateQuestion(
    id: $id
    type: $type
    title: $title
    prompt: $prompt
    options: $options
    correctAnswer: $correctAnswer
    difficulty: $difficulty
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
    upcomingExamCount
    completedExamCount
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
export const CreateExamOptionsDocument = gql`
    query CreateExamOptions {
  classes {
    id
    name
  }
  questionBanks {
    id
    title
    subject
  }
  questions {
    id
    title
    prompt
    type
    difficulty
    bank {
      id
      title
      subject
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
export const MyExamsQueryDocument = gql`
    query MyExamsQuery {
  me {
    id
  }
  exams {
    id
    title
    status
    durationMinutes
    createdAt
    createdBy {
      id
    }
    class {
      id
      name
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
        type
        options
      }
    }
    attempts {
      id
      status
      totalScore
      startedAt
      submittedAt
      student {
        id
        fullName
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
  questionBank(id: $id) {
    id
    title
    description
    subject
    questionCount
    questions {
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
  questionBanks {
    id
    title
    description
    subject
    questionCount
    createdAt
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