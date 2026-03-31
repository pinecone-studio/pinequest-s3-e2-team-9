import type { AttemptIntegrityEventType } from "@/graphql/generated";
import { formatDurationMs, formatIntegritySignal } from "../classes-format";

const detailLabelByKey: Record<string, string> = {
  deltaChars: "Нэмэгдсэн тэмдэгт",
  idleMs: "Идэвхгүй хугацаа",
  message: "Тайлбар",
  questionId: "Асуултын ID",
  targetTagName: "Оролтын төрөл",
  visibilityState: "Хуудасны төлөв",
};

export const getIntegrityEventTone = (severity: string) => {
  if (severity === "HIGH") {
    return "danger" as const;
  }

  return severity === "MEDIUM" ? "warning" as const : "muted" as const;
};

const toDisplayValue = (key: string, value: unknown) => {
  if (typeof value === "number") {
    return key === "idleMs" ? formatDurationMs(value) : String(value);
  }

  if (typeof value === "boolean") {
    return value ? "Тийм" : "Үгүй";
  }

  if (typeof value === "string") {
    if (key === "targetTagName") {
      return value.toLowerCase();
    }

    return value;
  }

  if (value === null) {
    return "null";
  }

  return typeof value === "undefined" ? null : JSON.stringify(value);
};

export const getIntegrityDetailLines = (
  type: AttemptIntegrityEventType,
  detailsText: string,
) => {
  const fallback = [`Төрөл: ${formatIntegritySignal(type)}`];

  try {
    const parsed = JSON.parse(detailsText) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return typeof parsed === "string" && parsed.trim() ? [parsed] : fallback;
    }

    const entries = Object.entries(parsed).flatMap(([key, value]) => {
      const rendered = toDisplayValue(key, value);
      if (!rendered) {
        return [];
      }

      return [`${detailLabelByKey[key] ?? key}: ${rendered}`];
    });

    return entries.length > 0 ? entries : fallback;
  } catch {
    return detailsText.trim() ? [detailsText.trim()] : fallback;
  }
};
