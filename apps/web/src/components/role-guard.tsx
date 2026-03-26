"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PropsWithChildren } from "react";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  AuthApiError,
  fetchSession,
  resolveRoleRedirectPath,
  type AppRole,
} from "@/lib/auth-api";

type RoleGuardProps = PropsWithChildren<{
  allowedRoles: AppRole[];
}>;

export function RoleGuard(props: RoleGuardProps) {
  return (
    <Suspense fallback={null}>
      <RoleGuardContent {...props} />
    </Suspense>
  );
}

function RoleGuardContent({ allowedRoles, children }: RoleGuardProps) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const clerk = useClerk();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestedPath = useMemo(() => {
    const query = searchParams.toString();
    return `${pathname || "/"}${query ? `?${query}` : ""}`;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    let cancelled = false;

    if (!isSignedIn) {
      router.replace(`/sign-in?redirect_url=${encodeURIComponent(requestedPath)}`);
      return;
    }

    void (async () => {
      try {
        const session = await fetchSession(getToken);
        if (cancelled) {
          return;
        }

        if (allowedRoles.includes(session.user.role)) {
          setIsAuthorized(true);
          setErrorMessage(null);
          return;
        }

        setIsAuthorized(false);
        router.replace(resolveRoleRedirectPath(session.user.role, requestedPath));
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (
          error instanceof AuthApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          await clerk.signOut({ redirectUrl: "/sign-in" });
          return;
        }

        setIsAuthorized(false);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Хандах эрх шалгах үед алдаа гарлаа.",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [allowedRoles, clerk, getToken, isLoaded, isSignedIn, requestedPath, router]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  if (errorMessage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAFF] px-6 text-center">
        <p className="max-w-md text-[15px] leading-7 text-[#475467]">
          {errorMessage}
        </p>
      </main>
    );
  }

  return null;
}
