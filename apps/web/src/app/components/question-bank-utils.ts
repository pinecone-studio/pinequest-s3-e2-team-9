export type QuestionBankItem = {
  id: string;
  title: string;
  description: string;
  subject: string;
  questions: string;
  date: string;
};

export const formatQuestionBankDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};
