"use client";

export const QUESTION_PROMPT_IMAGE_TAG_PREFIX = "prompt_image:";

export const getQuestionPromptImageValue = (tags: string[]) =>
  tags.find((tag) => tag.startsWith(QUESTION_PROMPT_IMAGE_TAG_PREFIX))?.slice(
    QUESTION_PROMPT_IMAGE_TAG_PREFIX.length,
  ) ?? null;

export const stripQuestionPromptImageTag = (tags: string[]) =>
  tags.filter((tag) => !tag.startsWith(QUESTION_PROMPT_IMAGE_TAG_PREFIX));

export const withQuestionPromptImageTag = (tags: string[], value: string) => {
  const normalized = value.trim();

  if (!normalized) {
    return stripQuestionPromptImageTag(tags);
  }

  return [
    ...stripQuestionPromptImageTag(tags),
    `${QUESTION_PROMPT_IMAGE_TAG_PREFIX}${normalized}`,
  ];
};
