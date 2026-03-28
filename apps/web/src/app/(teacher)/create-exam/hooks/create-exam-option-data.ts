import type { CreateExamOptionsQuery } from "@/graphql/generated";

export const getQuestionBankOptions = (
  data: CreateExamOptionsQuery | undefined,
  initialBankId: string,
) => {
  const options = (data?.questionBanks ?? []).map((bank) => ({
    id: bank.id,
    title: bank.title,
    subject: bank.subject,
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
  }));

  if (!initialBankId.trim()) {
    return options;
  }

  const filtered = options.filter((question) => question.bankId === initialBankId);
  return filtered.length ? filtered : options;
};
