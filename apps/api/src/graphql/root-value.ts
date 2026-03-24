import {
  currentUserId,
  makeId,
  state,
  type AnswerRecord,
  type AttemptRecord,
  type ClassRecord,
  type ExamQuestionRecord,
  type ExamRecord,
  type ExamStatus,
  type QuestionBankRecord,
  type QuestionRecord,
  type UserRecord,
} from "./mock-data";

const now = () => new Date().toISOString();

const findUser = (id: string): UserRecord => {
  const user = state.users.find((item) => item.id === id);
  if (!user) {
    throw new Error(`User ${id} not found`);
  }
  return user;
};

const findClass = (id: string): ClassRecord => {
  const classroom = state.classes.find((item) => item.id === id);
  if (!classroom) {
    throw new Error(`Class ${id} not found`);
  }
  return classroom;
};

const findQuestionBank = (id: string): QuestionBankRecord => {
  const bank = state.questionBanks.find((item) => item.id === id);
  if (!bank) {
    throw new Error(`Question bank ${id} not found`);
  }
  return bank;
};

const findQuestion = (id: string): QuestionRecord => {
  const question = state.questions.find((item) => item.id === id);
  if (!question) {
    throw new Error(`Question ${id} not found`);
  }
  return question;
};

const findExam = (id: string): ExamRecord => {
  const exam = state.exams.find((item) => item.id === id);
  if (!exam) {
    throw new Error(`Exam ${id} not found`);
  }
  return exam;
};

const findAttempt = (id: string): AttemptRecord => {
  const attempt = state.attempts.find((item) => item.id === id);
  if (!attempt) {
    throw new Error(`Attempt ${id} not found`);
  }
  return attempt;
};

const normalize = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

const scoreAnswer = (
  question: QuestionRecord,
  value: string,
  examQuestion: ExamQuestionRecord | undefined,
): number | undefined => {
  if (!examQuestion) {
    return undefined;
  }

  if (question.type === "ESSAY") {
    return undefined;
  }

  if (!question.correctAnswer) {
    return 0;
  }

  return normalize(question.correctAnswer) === normalize(value)
    ? examQuestion.points
    : 0;
};

const toUser = (user: UserRecord) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  classes: () =>
    state.classes
      .filter(
        (classroom) =>
          classroom.teacherId === user.id ||
          state.enrollments.some(
            (enrollment) =>
              enrollment.classId === classroom.id && enrollment.studentId === user.id,
          ),
      )
      .map(toClass),
});

const toClass = (classroom: ClassRecord) => ({
  id: classroom.id,
  name: classroom.name,
  description: classroom.description ?? null,
  createdAt: classroom.createdAt,
  teacher: () => toUser(findUser(classroom.teacherId)),
  students: () =>
    state.enrollments
      .filter((enrollment) => enrollment.classId === classroom.id)
      .map((enrollment) => toUser(findUser(enrollment.studentId))),
  exams: () =>
    state.exams
      .filter((exam) => exam.classId === classroom.id)
      .map(toExam),
});

const toQuestionBank = (bank: QuestionBankRecord) => ({
  id: bank.id,
  title: bank.title,
  description: bank.description ?? null,
  createdAt: bank.createdAt,
  owner: () => toUser(findUser(bank.ownerId)),
  questions: () =>
    state.questions
      .filter((question) => question.bankId === bank.id)
      .map(toQuestion),
});

const toQuestion = (question: QuestionRecord) => ({
  id: question.id,
  type: question.type,
  title: question.title,
  prompt: question.prompt,
  options: question.options,
  correctAnswer: question.correctAnswer ?? null,
  difficulty: question.difficulty,
  tags: question.tags,
  createdAt: question.createdAt,
  bank: () => toQuestionBank(findQuestionBank(question.bankId)),
  createdBy: () => toUser(findUser(question.createdById)),
});

const toExamQuestion = (examQuestion: ExamQuestionRecord) => ({
  id: examQuestion.id,
  points: examQuestion.points,
  order: examQuestion.order,
  question: () => toQuestion(findQuestion(examQuestion.questionId)),
});

const toAnswer = (answer: AnswerRecord) => ({
  id: answer.id,
  value: answer.value,
  autoScore: answer.autoScore ?? null,
  manualScore: answer.manualScore ?? null,
  feedback: answer.feedback ?? null,
  createdAt: answer.createdAt,
  question: () => toQuestion(findQuestion(answer.questionId)),
});

const toAttempt = (attempt: AttemptRecord) => ({
  id: attempt.id,
  status: attempt.status,
  autoScore: attempt.autoScore,
  manualScore: attempt.manualScore,
  totalScore: attempt.totalScore,
  startedAt: attempt.startedAt,
  submittedAt: attempt.submittedAt ?? null,
  exam: () => toExam(findExam(attempt.examId)),
  student: () => toUser(findUser(attempt.studentId)),
  answers: () =>
    state.answers
      .filter((answer) => answer.attemptId === attempt.id)
      .map(toAnswer),
});

const toExam = (exam: ExamRecord) => ({
  id: exam.id,
  title: exam.title,
  description: exam.description ?? null,
  mode: exam.mode,
  status: exam.status,
  durationMinutes: exam.durationMinutes,
  createdAt: exam.createdAt,
  class: () => toClass(findClass(exam.classId)),
  questions: () =>
    state.examQuestions
      .filter((item) => item.examId === exam.id)
      .sort((left, right) => left.order - right.order)
      .map(toExamQuestion),
  createdBy: () => toUser(findUser(exam.createdById)),
  attempts: () =>
    state.attempts
      .filter((attempt) => attempt.examId === exam.id)
      .map(toAttempt),
});

type HelloArgs = {
  name?: string;
};

type CreateClassArgs = {
  name: string;
  description?: string;
};

type CreateQuestionBankArgs = {
  title: string;
  description?: string;
};

type CreateQuestionArgs = {
  bankId: string;
  type: QuestionRecord["type"];
  title: string;
  prompt: string;
  options?: string[];
  correctAnswer?: string;
  difficulty?: QuestionRecord["difficulty"];
  tags?: string[];
};

type CreateExamArgs = {
  classId: string;
  title: string;
  description?: string;
  mode?: ExamRecord["mode"];
  durationMinutes: number;
};

type AddQuestionToExamArgs = {
  examId: string;
  questionId: string;
  points: number;
};

type PublishExamArgs = {
  examId: string;
};

type StartAttemptArgs = {
  examId: string;
  studentId: string;
};

type SaveAnswerArgs = {
  attemptId: string;
  questionId: string;
  value: string;
};

type SubmitAttemptArgs = {
  attemptId: string;
};

type AttemptArgs = {
  id: string;
};

type ResourceArgs = {
  id: string;
};

type QuestionsArgs = {
  bankId?: string;
};

const currentUser = () => findUser(currentUserId);

const updateAttemptScores = (attemptId: string): AttemptRecord => {
  const attempt = findAttempt(attemptId);
  const autoScore = state.answers
    .filter((answer) => answer.attemptId === attemptId)
    .reduce((total, answer) => total + (answer.autoScore ?? 0), 0);
  const manualScore = state.answers
    .filter((answer) => answer.attemptId === attemptId)
    .reduce((total, answer) => total + (answer.manualScore ?? 0), 0);

  attempt.autoScore = autoScore;
  attempt.manualScore = manualScore;
  attempt.totalScore = autoScore + manualScore;

  return attempt;
};

export const rootValue = {
  health: () => ({
    ok: true,
    service: "api",
    runtime: "cloudflare-workers",
  }),
  hello: ({ name }: HelloArgs) => ({
    message: `Hello${name ? `, ${name}` : ""} from the PineQuest GraphQL API`,
  }),
  me: () => toUser(currentUser()),
  users: () => state.users.map(toUser),
  classes: () => state.classes.map(toClass),
  class: ({ id }: ResourceArgs) => {
    const classroom = state.classes.find((item) => item.id === id);
    return classroom ? toClass(classroom) : null;
  },
  questionBanks: () => state.questionBanks.map(toQuestionBank),
  questionBank: ({ id }: ResourceArgs) => {
    const bank = state.questionBanks.find((item) => item.id === id);
    return bank ? toQuestionBank(bank) : null;
  },
  questions: ({ bankId }: QuestionsArgs) =>
    state.questions
      .filter((question) => (bankId ? question.bankId === bankId : true))
      .map(toQuestion),
  exams: () => state.exams.map(toExam),
  exam: ({ id }: ResourceArgs) => {
    const exam = state.exams.find((item) => item.id === id);
    return exam ? toExam(exam) : null;
  },
  attempts: () => state.attempts.map(toAttempt),
  attempt: ({ id }: AttemptArgs) => {
    const attempt = state.attempts.find((item) => item.id === id);
    return attempt ? toAttempt(attempt) : null;
  },
  createClass: ({ name, description }: CreateClassArgs) => {
    const classroom: ClassRecord = {
      id: makeId("class"),
      name,
      description,
      teacherId: currentUserId,
      createdAt: now(),
    };

    state.classes.push(classroom);
    return toClass(classroom);
  },
  createQuestionBank: ({ title, description }: CreateQuestionBankArgs) => {
    const bank: QuestionBankRecord = {
      id: makeId("bank"),
      title,
      description,
      ownerId: currentUserId,
      createdAt: now(),
    };

    state.questionBanks.push(bank);
    return toQuestionBank(bank);
  },
  createQuestion: ({
    bankId,
    type,
    title,
    prompt,
    options,
    correctAnswer,
    difficulty,
    tags,
  }: CreateQuestionArgs) => {
    findQuestionBank(bankId);

    const question: QuestionRecord = {
      id: makeId("question"),
      bankId,
      type,
      title,
      prompt,
      options: options ?? [],
      correctAnswer,
      difficulty: difficulty ?? "MEDIUM",
      tags: tags ?? [],
      createdById: currentUserId,
      createdAt: now(),
    };

    state.questions.push(question);
    return toQuestion(question);
  },
  createExam: ({
    classId,
    title,
    description,
    mode,
    durationMinutes,
  }: CreateExamArgs) => {
    findClass(classId);

    const exam: ExamRecord = {
      id: makeId("exam"),
      classId,
      title,
      description,
      mode: mode ?? "SCHEDULED",
      status: "DRAFT",
      durationMinutes,
      createdById: currentUserId,
      createdAt: now(),
    };

    state.exams.push(exam);
    return toExam(exam);
  },
  addQuestionToExam: ({ examId, questionId, points }: AddQuestionToExamArgs) => {
    findExam(examId);
    findQuestion(questionId);

    const existing = state.examQuestions.find(
      (item) => item.examId === examId && item.questionId === questionId,
    );

    if (existing) {
      existing.points = points;
      return toExam(findExam(examId));
    }

    const order =
      state.examQuestions.filter((item) => item.examId === examId).length + 1;

    state.examQuestions.push({
      id: makeId("exam_question"),
      examId,
      questionId,
      points,
      order,
    });

    return toExam(findExam(examId));
  },
  publishExam: ({ examId }: PublishExamArgs) => {
    const exam = findExam(examId);
    exam.status = "PUBLISHED" satisfies ExamStatus;
    return toExam(exam);
  },
  startAttempt: ({ examId, studentId }: StartAttemptArgs) => {
    const exam = findExam(examId);
    findUser(studentId);

    if (exam.status !== "PUBLISHED") {
      throw new Error("Only published exams can be started");
    }

    const attempt: AttemptRecord = {
      id: makeId("attempt"),
      examId,
      studentId,
      status: "IN_PROGRESS",
      autoScore: 0,
      manualScore: 0,
      totalScore: 0,
      startedAt: now(),
    };

    state.attempts.push(attempt);
    return toAttempt(attempt);
  },
  saveAnswer: ({ attemptId, questionId, value }: SaveAnswerArgs) => {
    const attempt = findAttempt(attemptId);
    findQuestion(questionId);

    if (attempt.status !== "IN_PROGRESS") {
      throw new Error("Only in-progress attempts can be updated");
    }

    const examQuestion = state.examQuestions.find(
      (item) => item.examId === attempt.examId && item.questionId === questionId,
    );
    const question = findQuestion(questionId);
    const autoScore = scoreAnswer(question, value, examQuestion);

    const existing = state.answers.find(
      (answer) => answer.attemptId === attemptId && answer.questionId === questionId,
    );

    if (existing) {
      existing.value = value;
      existing.autoScore = autoScore;
    } else {
      state.answers.push({
        id: makeId("answer"),
        attemptId,
        questionId,
        value,
        autoScore,
        createdAt: now(),
      });
    }

    updateAttemptScores(attemptId);
    return toAttempt(findAttempt(attemptId));
  },
  submitAttempt: ({ attemptId }: SubmitAttemptArgs) => {
    const attempt = updateAttemptScores(attemptId);
    attempt.status = "SUBMITTED";
    attempt.submittedAt = now();
    return toAttempt(attempt);
  },
};
