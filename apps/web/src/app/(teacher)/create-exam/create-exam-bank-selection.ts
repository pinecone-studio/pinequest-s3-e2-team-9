import type {
  CreateExamQuestionBankOption,
  CreateExamQuestionOption,
} from "./create-exam-types";

export type BankSelectionValues = {
  grade: string;
  subject: string;
  topic: string;
};

export const EMPTY_BANK_SELECTION: BankSelectionValues = {
  grade: "",
  subject: "",
  topic: "",
};

const getUniqueValues = (values: string[]) => [...new Set(values)];

export const getBankSelectionFromId = (
  bankOptions: CreateExamQuestionBankOption[],
  bankId: string,
): BankSelectionValues => {
  const bank = bankOptions.find((item) => item.id === bankId);

  if (!bank) {
    return EMPTY_BANK_SELECTION;
  }

  return {
    grade: String(bank.grade),
    subject: bank.subject,
    topic: bank.topic,
  };
};

export const getBankGradeOptions = (bankOptions: CreateExamQuestionBankOption[]) =>
  getUniqueValues(bankOptions.map((item) => String(item.grade))).sort(
    (left, right) => Number(left) - Number(right),
  );

export const getBankSubjectOptions = (
  bankOptions: CreateExamQuestionBankOption[],
  grade: string,
) =>
  getUniqueValues(
    bankOptions
      .filter((item) => !grade || String(item.grade) === grade)
      .map((item) => item.subject),
  );

export const getBankTopicOptions = (
  bankOptions: CreateExamQuestionBankOption[],
  grade: string,
  subject: string,
) =>
  getUniqueValues(
    bankOptions
      .filter(
        (item) =>
          (!grade || String(item.grade) === grade) &&
          (!subject || item.subject === subject),
      )
      .map((item) => item.topic),
  );

export const findBankIdBySelection = (
  bankOptions: CreateExamQuestionBankOption[],
  selection: BankSelectionValues,
) =>
  bankOptions.find(
    (item) =>
      String(item.grade) === selection.grade &&
      item.subject === selection.subject &&
      item.topic === selection.topic,
  )?.id ?? "";

export const matchesQuestionBankSelection = (
  question: CreateExamQuestionOption,
  selection: BankSelectionValues,
) =>
  (!selection.grade || String(question.bankGrade) === selection.grade) &&
  (!selection.subject || question.bankSubject === selection.subject) &&
  (!selection.topic || question.bankTopic === selection.topic);
