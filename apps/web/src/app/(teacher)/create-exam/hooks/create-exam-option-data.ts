import { ExamMode } from "@/graphql/generated";
import { getCurriculumTopicGroupName } from "@/app/(teacher)/components/question-bank-curriculum";
import type { CreateExamOptionsQuery } from "@/graphql/generated";
import type { CreateExamRuleSourceOption } from "../create-exam-types";

export const getQuestionBankOptions = (
  data: CreateExamOptionsQuery | undefined,
  initialBankId: string,
) => {
  const options = (data?.questionBanks ?? []).map((bank) => ({
    id: bank.id,
    title: bank.title,
    subject: bank.subject,
    grade: bank.grade,
    topic: bank.topic,
  }));

  if (!initialBankId.trim()) {
    return options;
  }

  const selectedBank = options.find((bank) => bank.id === initialBankId);
  return selectedBank ? [selectedBank] : options;
};

export const getQuestionOptions = (
  data: CreateExamOptionsQuery | undefined,
  initialBankId: string,
) => {
  const options = (data?.questions ?? []).map((question) => ({
    id: question.id,
    title: question.title,
    prompt: question.prompt,
    type: question.type,
    difficulty: question.difficulty,
    options: question.options,
    correctAnswer: question.correctAnswer,
    tags: question.tags,
    bankId: question.bank.id,
    bankTitle: question.bank.title,
    bankSubject: question.bank.subject,
    bankGrade: question.bank.grade,
    bankTopic: question.bank.topic,
  }));

  if (!initialBankId.trim()) {
    return options;
  }

  const filtered = options.filter((question) => question.bankId === initialBankId);
  return filtered.length ? filtered : options;
};

export const formatQuestionBankLabel = (
  bank: Pick<
    CreateExamOptionsQuery["questionBanks"][number],
    "grade" | "subject" | "topic" | "title"
  >,
) => `${bank.grade}-р анги · ${bank.subject} · ${bank.topic || bank.title}`;

export const getRuleSourceOptions = (
  questionBanks: Array<{
    id: string;
    title: string;
    subject: string;
    grade: number;
    topic: string;
  }>,
  questions: Array<{
    difficulty: string;
    bankId: string;
    type: string;
  }>,
  initialBankId: string,
  mode: ExamMode,
): CreateExamRuleSourceOption[] => {
  const grouped = new Map<string, CreateExamRuleSourceOption>();

  for (const bank of questionBanks) {
    const topicGroup = getCurriculumTopicGroupName(
      bank.grade,
      bank.subject,
      bank.topic || bank.title,
    );
    const key = `${bank.grade}:${bank.subject}:${topicGroup}`;
    const current = grouped.get(key) ?? {
      id: key,
      label: `${bank.grade}-р анги · ${bank.subject} · ${topicGroup}`,
      grade: bank.grade,
      subject: bank.subject,
      topicGroup,
      bankIds: [],
      totalQuestions: 0,
      easyQuestions: 0,
      mediumQuestions: 0,
      hardQuestions: 0,
    };
    current.bankIds = [...new Set([...current.bankIds, bank.id])];
    grouped.set(key, current);
  }

  for (const option of grouped.values()) {
    const matchedQuestions = questions.filter(
      (question) =>
        option.bankIds.includes(question.bankId) &&
        (mode !== ExamMode.Practice ||
          (question.type !== "ESSAY" && question.type !== "IMAGE_UPLOAD")),
    );
    option.totalQuestions = matchedQuestions.length;
    option.easyQuestions = matchedQuestions.filter(
      (question) => question.difficulty === "EASY",
    ).length;
    option.mediumQuestions = matchedQuestions.filter(
      (question) => question.difficulty === "MEDIUM",
    ).length;
    option.hardQuestions = matchedQuestions.filter(
      (question) => question.difficulty === "HARD",
    ).length;
  }

  const options = [...grouped.values()].sort((left, right) =>
    left.label.localeCompare(right.label, "mn"),
  );

  if (!initialBankId.trim()) {
    return options;
  }

  const selected = options.find((option) => option.bankIds.includes(initialBankId));
  return selected ? [selected, ...options.filter((option) => option.id !== selected.id)] : options;
};
