const isRootRelativePath = (value: string) =>
  value.startsWith("/") && !value.startsWith("//");

export const getSafeRedirectPath = (rawRedirectUrl: string | null) => {
  if (!rawRedirectUrl) {
    return "/";
  }

  if (isRootRelativePath(rawRedirectUrl)) {
    return rawRedirectUrl;
  }

  if (typeof window === "undefined") {
    return "/";
  }

  try {
    const url = new URL(rawRedirectUrl);

    if (url.origin !== window.location.origin) {
      return "/";
    }

    return `${url.pathname}${url.search}${url.hash}` || "/";
  } catch {
    return "/";
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
