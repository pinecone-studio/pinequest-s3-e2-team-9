import type { CreateExamOptionsQuery } from "@/graphql/generated";

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
