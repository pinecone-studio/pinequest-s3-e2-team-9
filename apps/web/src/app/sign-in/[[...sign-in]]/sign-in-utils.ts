export const getSafeRedirectPath = (rawRedirectUrl: string | null) => {
  if (!rawRedirectUrl) {
    return "/";
  }

  try {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const url = new URL(rawRedirectUrl, origin);

    if (typeof window !== "undefined" && url.origin !== window.location.origin) {
      return "/";
    }

    return `${url.pathname}${url.search}${url.hash}` || "/";
  } catch {
    return rawRedirectUrl.startsWith("/") ? rawRedirectUrl : "/";
  }
};

export const collectErrorMessages = ({
  fieldMessages,
  globalErrors,
}: {
  fieldMessages: Array<string | null | undefined>;
  globalErrors: Array<{ longMessage?: string; message: string }> | null | undefined;
}) => {
  const messages = [
    ...fieldMessages,
    ...(globalErrors?.map((error) => error.longMessage ?? error.message) ?? []),
  ].filter((message): message is string => Boolean(message));

  return [...new Set(messages)];
};

export const collectSubmissionErrorMessages = (error: unknown) => {
  if (!error || typeof error !== "object" || !("errors" in error)) {
    return [];
  }

  const entries = (error as {
    errors?: Array<{
      longMessage?: string;
      message?: string;
    }>;
  }).errors;

  const messages =
    entries
      ?.map((entry) => entry.longMessage ?? entry.message)
      .filter((message): message is string => Boolean(message)) ?? [];

  return [...new Set(messages)];
};
