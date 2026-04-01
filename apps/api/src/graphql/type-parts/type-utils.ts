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

export const splitAcceptedAnswers = (value: string | null | undefined): string[] =>
  (value ?? "")
    .split(/[\n;；]+/u)
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeMathSymbols = (value: string) =>
  value
    .replace(/[−–—]/gu, "-")
    .replace(/²/gu, "^2")
    .replace(/³/gu, "^3")
    .replace(/，/gu, ",");

const normalizeEquationSide = (value: string) => {
  const normalized = normalizeMathSymbols(normalize(value));
  const match = normalized.match(/^[a-zа-я]\s*=\s*(.+)$/iu);
  return match?.[1]?.trim() ?? normalized;
};

const normalizeCompact = (value: string) =>
  normalizeEquationSide(value).replace(/\s+/gu, "");

export const normalizeShortAnswer = (value: string): string =>
  normalizeCompact(value);

const parseNumberLike = (value: string): number | null => {
  const normalizedValue =
    value.includes(",") && !value.includes(".")
      ? value.replace(/,/gu, ".")
      : value;

  const percentMatch = normalizedValue.match(/^([+-]?\d+(?:\.\d+)?)%$/u);
  if (percentMatch) {
    const parsed = Number(percentMatch[1]);
    return Number.isFinite(parsed) ? parsed / 100 : null;
  }

  const fractionMatch = normalizedValue.match(
    /^([+-]?\d+(?:\.\d+)?)\/([+-]?\d+(?:\.\d+)?)$/u,
  );
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
      return null;
    }

    return numerator / denominator;
  }

  const parsed = Number(normalizedValue);
  return Number.isFinite(parsed) ? parsed : null;
};

export const parseNumericAnswer = (value: string): number | null => {
  const normalized = normalizeCompact(value);
  if (!normalized) {
    return null;
  }

  const directMatch = parseNumberLike(normalized);
  if (directMatch !== null) {
    return directMatch;
  }

  const tokenMatch = normalized.match(
    /^([+-]?\d+(?:[.,]\d+)?(?:\/[+-]?\d+(?:[.,]\d+)?)?%?)(.*)$/u,
  );
  if (!tokenMatch) {
    return null;
  }

  const [, token, residue = ""] = tokenMatch;
  if (!token) {
    return null;
  }

  if (/\d/u.test(residue)) {
    return null;
  }

  return parseNumberLike(token);
};
