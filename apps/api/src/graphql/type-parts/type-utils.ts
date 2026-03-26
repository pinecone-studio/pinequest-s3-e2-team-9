export const now = () => new Date().toISOString();

export const makeId = (prefix: string) =>
  `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;

export const toJsonArray = (values: string[] | undefined) =>
  JSON.stringify(values ?? []);

export const parseJsonArray = (value: string | null | undefined): string[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
};

export const normalize = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, " ");
