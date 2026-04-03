type QuestionDisplaySource = {
  prompt?: string | null;
  title?: string | null;
};

const normalizeText = (value?: string | null) => value?.trim() ?? "";

export const getQuestionDisplayCopy = (question: QuestionDisplaySource) => {
  const prompt = normalizeText(question.prompt);
  const title = normalizeText(question.title);

  if (prompt && title && prompt !== title) {
    return {
      primary: prompt,
      secondary: title,
    };
  }

  return {
    primary: prompt || title,
    secondary: "",
  };
};
