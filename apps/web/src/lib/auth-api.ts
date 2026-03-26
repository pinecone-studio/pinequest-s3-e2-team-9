import { getApiBaseUrl } from "./graphql-endpoint";

export type AppRole = "ADMIN" | "TEACHER" | "STUDENT";

export type AuthApiUser = {
  id: string;
  fullName: string;
  email: string;
  role: AppRole;
};

export type AuthApiSession = {
  user: AuthApiUser;
  redirectPath: string;
};

export class AuthApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

const allowedRolePrefixes: Record<AppRole, string[]> = {
  ADMIN: ["/admin"],
  STUDENT: ["/student"],
  TEACHER: ["/dashboard", "/classes", "/create-exam", "/my-exams", "/question-bank"],
};

const getPathname = (path: string): string => {
  try {
    return new URL(path, "https://pinequest.local").pathname;
  } catch {
    return path;
  }
};

const matchesPrefix = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

const parseResponse = async (response: Response): Promise<AuthApiSession> => {
  const payload = (await response.json().catch(() => null)) as
    | { error?: string }
    | AuthApiSession
    | null;
  const errorPayload = payload as { error?: string } | null;

  if (!response.ok) {
    throw new AuthApiError(
      response.status,
      typeof errorPayload?.error === "string"
        ? errorPayload.error
        : "Authentication request failed.",
    );
  }

  return payload as AuthApiSession;
};

const requestAuthJson = async (
  path: string,
  init?: RequestInit,
): Promise<AuthApiSession> => {
  try {
    return await parseResponse(
      await fetch(`${getApiBaseUrl()}${path}`, {
        cache: "no-store",
        ...init,
      }),
    );
  } catch (error) {
    if (error instanceof AuthApiError) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new AuthApiError(
        503,
        "Authentication service is unreachable. Check the API deployment or endpoint configuration.",
      );
    }

    throw error;
  }
};

export const getDefaultRedirectPathForRole = (role: AppRole): string => {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "STUDENT":
      return "/student";
    case "TEACHER":
    default:
      return "/";
  }
};

export const canRoleAccessPath = (role: AppRole, path: string): boolean => {
  const pathname = getPathname(path);

  if (role === "TEACHER" && pathname === "/") {
    return true;
  }

  return allowedRolePrefixes[role].some((prefix) =>
    matchesPrefix(pathname, prefix),
  );
};

export const resolveRoleRedirectPath = (
  role: AppRole,
  requestedPath?: string | null,
): string => {
  if (!requestedPath) {
    return getDefaultRedirectPathForRole(role);
  }

  return canRoleAccessPath(role, requestedPath)
    ? requestedPath
    : getDefaultRedirectPathForRole(role);
};

export const fetchLoginEligibility = async (
  email: string,
): Promise<AuthApiSession> =>
  requestAuthJson("/auth/login-eligibility", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

export const fetchSession = async (
  getToken: () => Promise<string | null>,
): Promise<AuthApiSession> => {
  const token = await getToken();
  if (!token) {
    throw new AuthApiError(401, "Authentication required.");
  }

  return requestAuthJson("/auth/session", {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
};
