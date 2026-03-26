import { createClerkClient, verifyToken } from "@clerk/backend";
import { first, invariant, type D1DatabaseLike } from "./lib/d1";
import type { Role, UserRow } from "./graphql/types";

export class ApiAuthError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiAuthError";
    this.status = status;
  }
}

export type ApiEnvWithClerk = {
  CLERK_SECRET_KEY?: string;
};

export type AuthenticatedActor = {
  clerkUserId: string;
  sessionId: string | null;
  user: UserRow;
};

export type RequestContext = {
  actor: AuthenticatedActor | null;
  authError: ApiAuthError | null;
};

const ALL_ROLES: Role[] = ["ADMIN", "TEACHER", "STUDENT"];

type ClerkEmailAddress = {
  id?: string | null;
  emailAddress?: string | null;
};

type ClerkUserLike = {
  primaryEmailAddress?: ClerkEmailAddress | null;
  primaryEmailAddressId?: string | null;
  emailAddresses?: ClerkEmailAddress[];
};

type ClerkClientLike = ReturnType<typeof createClerkClient>;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const getBearerToken = (authorizationHeader: string | null): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, value] = authorizationHeader.split(" ", 2);
  if (scheme?.toLowerCase() !== "bearer" || !value?.trim()) {
    return null;
  }

  return value.trim();
};

const getSecretKey = (env: ApiEnvWithClerk): string => {
  const secretKey = env.CLERK_SECRET_KEY?.trim();
  invariant(secretKey, "CLERK_SECRET_KEY is not configured on the API.");
  return secretKey;
};

const getClerkClient = (env: ApiEnvWithClerk): ClerkClientLike =>
  createClerkClient({
    secretKey: getSecretKey(env),
  });

const resolvePrimaryEmail = (clerkUser: ClerkUserLike): string | null => {
  const primaryEmail =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses?.find(
      (emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ??
    clerkUser.emailAddresses?.[0]?.emailAddress ??
    null;

  return primaryEmail ? normalizeEmail(primaryEmail) : null;
};

export const findUserByEmail = async (
  db: D1DatabaseLike,
  email: string,
): Promise<UserRow | null> =>
  first<UserRow>(
    db,
    "SELECT id, full_name, email, role, created_at FROM users WHERE lower(email) = ?",
    [normalizeEmail(email)],
  );

export const defaultRedirectPathForRole = (role: Role): string => {
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

export const toAuthUser = (user: UserRow) => ({
  id: user.id,
  fullName: user.full_name,
  email: user.email,
  role: user.role,
});

export const toAuthResponse = (user: UserRow) => ({
  user: toAuthUser(user),
  redirectPath: defaultRedirectPathForRole(user.role),
});

const splitFullName = (fullName: string): {
  firstName?: string;
  lastName?: string;
} => {
  const normalized = fullName.trim();
  if (!normalized) {
    return {};
  }

  const parts = normalized.split(/\s+/);
  if (parts.length === 1) {
    return {
      firstName: normalized,
    };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
};

const findClerkUserByEmail = async (
  clerkClient: ClerkClientLike,
  email: string,
): Promise<ClerkUserLike | null> => {
  const response = await clerkClient.users.getUserList({
    emailAddress: [normalizeEmail(email)],
    limit: 1,
  });

  return (response.data[0] as ClerkUserLike | undefined) ?? null;
};

export const ensureClerkUserForAppUser = async (
  user: UserRow,
  env: ApiEnvWithClerk,
): Promise<void> => {
  const clerkClient = getClerkClient(env);
  const existingUser = await findClerkUserByEmail(clerkClient, user.email);

  if (existingUser) {
    return;
  }

  const { firstName, lastName } = splitFullName(user.full_name);

  try {
    await clerkClient.users.createUser({
      emailAddress: [normalizeEmail(user.email)],
      firstName,
      lastName,
      skipPasswordRequirement: true,
      skipLegalChecks: true,
      createdAt: new Date(user.created_at),
    });
  } catch {
    const provisionedUser = await findClerkUserByEmail(clerkClient, user.email);
    if (provisionedUser) {
      return;
    }

    throw new ApiAuthError(
      502,
      "Unable to provision the Clerk user for this email address.",
    );
  }
};

export const authenticateActor = async (
  request: Request,
  db: D1DatabaseLike,
  env: ApiEnvWithClerk,
): Promise<AuthenticatedActor | null> => {
  const token = getBearerToken(request.headers.get("authorization"));
  if (!token) {
    return null;
  }

  const secretKey = getSecretKey(env);

  let sessionClaims: Awaited<ReturnType<typeof verifyToken>>;
  try {
    sessionClaims = await verifyToken(token, { secretKey });
  } catch {
    throw new ApiAuthError(401, "Invalid or expired session token.");
  }

  const clerkUserId =
    typeof sessionClaims?.sub === "string" ? sessionClaims.sub.trim() : "";
  invariant(clerkUserId, "Session token is missing a Clerk user id.");

  const clerkClient = getClerkClient(env);

  let clerkUser: ClerkUserLike;
  try {
    clerkUser = (await clerkClient.users.getUser(clerkUserId)) as ClerkUserLike;
  } catch {
    throw new ApiAuthError(401, "Unable to resolve the signed-in Clerk user.");
  }

  const email = resolvePrimaryEmail(clerkUser);
  if (!email) {
    throw new ApiAuthError(
      403,
      "The signed-in account does not have a usable email address.",
    );
  }

  const actor = await findUserByEmail(db, email);
  if (!actor) {
    throw new ApiAuthError(
      403,
      "This email address does not have access to PineQuest.",
    );
  }

  return {
    clerkUserId,
    sessionId: typeof sessionClaims?.sid === "string" ? sessionClaims.sid : null,
    user: actor,
  };
};

export const createRequestContext = async (
  request: Request,
  db: D1DatabaseLike,
  env: ApiEnvWithClerk,
): Promise<RequestContext> => {
  try {
    return {
      actor: await authenticateActor(request, db, env),
      authError: null,
    };
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return {
        actor: null,
        authError: error,
      };
    }

    throw error;
  }
};

export const requireActor = async (
  context: RequestContext,
  roles: Role[] = ALL_ROLES,
): Promise<UserRow> => {
  if (context.authError) {
    throw context.authError;
  }

  invariant(context.actor, "Authentication required.");
  invariant(
    roles.includes(context.actor.user.role),
    `Requires ${roles.join("/")} role.`,
  );

  return context.actor.user;
};
