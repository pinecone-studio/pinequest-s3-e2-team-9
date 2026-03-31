import { isImageAnswerValue } from "./image-answer";

export type OpenTaskAnswer = {
  image: string;
  text: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const parseOpenTaskAnswer = (value: string): OpenTaskAnswer => {
  const normalized = value.trim();

  if (!normalized) {
    return { image: "", text: "" };
  }

  try {
    const parsed = JSON.parse(normalized) as unknown;

    if (isRecord(parsed)) {
      return {
        image: typeof parsed.image === "string" ? parsed.image : "",
        text: typeof parsed.text === "string" ? parsed.text : "",
      };
    }
  } catch {
    return isImageAnswerValue(normalized)
      ? { image: normalized, text: "" }
      : { image: "", text: value };
  }

  return { image: "", text: value };
};

export const serializeOpenTaskAnswer = ({
  image,
  text,
}: OpenTaskAnswer): string => {
  const normalizedImage = image.trim();
  const normalizedText = text.trim();

  if (!normalizedImage) {
    return text;
  }

  return JSON.stringify({
    image: normalizedImage,
    text: normalizedText ? text : "",
  });
};
