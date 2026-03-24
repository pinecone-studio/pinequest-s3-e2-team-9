import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
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
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  exams: Array<Exam>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  students: Array<User>;
  teacher: User;
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
  createClass: Class;
  createExam: Exam;
  createQuestion: Question;
  createQuestionBank: QuestionBank;
  publishExam: Exam;
  saveAnswer: Attempt;
  startAttempt: Attempt;
  submitAttempt: Attempt;
};


export type MutationAddQuestionToExamArgs = {
  examId: Scalars['ID']['input'];
  points: Scalars['Int']['input'];
  questionId: Scalars['ID']['input'];
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

export type Query = {
  __typename?: 'Query';
  attempt?: Maybe<Attempt>;
  attempts: Array<Attempt>;
  class?: Maybe<Class>;
  classes: Array<Class>;
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
  questions: Array<Question>;
  title: Scalars['String']['output'];
};

export enum QuestionType {
  Essay = 'ESSAY',
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

export type HealthQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type HealthQueryQuery = { __typename?: 'Query', health: { __typename?: 'Health', ok: boolean, service: string, runtime: string } };


export const HealthQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"HealthQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"health"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ok"}},{"kind":"Field","name":{"kind":"Name","value":"service"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}}]}}]}}]} as unknown as DocumentNode<HealthQueryQuery, HealthQueryQueryVariables>;