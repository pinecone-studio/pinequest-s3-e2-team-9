"use client";
/* eslint-disable max-lines */

import { useAuth, useClerk, useSignIn } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AuthApiError,
  fetchLoginEligibility,
  fetchSession,
  resolveRoleRedirectPath,
} from "@/lib/auth-api";
import {
  collectErrorMessages,
  collectSubmissionErrorMessages,
  getSafeRedirectPath,
  submissionErrorHasCode,
} from "./sign-in-utils";

export function useEmailOtpSignIn() {
  const clerk = useClerk();
  const { userId, isLoaded: isAuthLoaded, getToken } = useAuth();
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<"identifier" | "verification">("identifier");
  const [emailAddress, setEmailAddress] = useState("");
  const [code, setCode] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [authorizedRedirectPath, setAuthorizedRedirectPath] = useState("/");
  const [identifierSubmissionErrors, setIdentifierSubmissionErrors] = useState<string[]>(
    [],
  );
  const [verificationSubmissionErrors, setVerificationSubmissionErrors] = useState<
    string[]
  >([]);

  const redirectTarget = useMemo(
    () => getSafeRedirectPath(searchParams.get("redirect_url")),
    [searchParams],
  );

  useEffect(() => {
    if (!isAuthLoaded || !userId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const session = await fetchSession(getToken);
        if (cancelled) {
          return;
        }

        router.replace(resolveRoleRedirectPath(session.user.role, redirectTarget));
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

        setStatusMessage(
          error instanceof Error
            ? error.message
            : "Сессийг шалгаж чадсангүй. Дахин оролдоно уу.",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clerk, getToken, isAuthLoaded, redirectTarget, router, userId]);

  const finishSignIn = useCallback(
    async (fallbackRedirectPath: string) => {
      const { error } = await signIn.finalize({
        navigate: ({ decorateUrl, session }) => {
          const target = session?.currentTask ? "/" : fallbackRedirectPath;
          const destination = decorateUrl(target);

          if (destination.startsWith("http")) {
            window.location.href = destination;
            return;
          }

          router.push(destination);
        },
      });

      if (error) {
        setStatusMessage(null);
        setVerificationSubmissionErrors(collectSubmissionErrorMessages(error));
      }
    },
    [router, signIn],
  );

  const identifierErrors = [
    ...collectErrorMessages({
      fieldMessages: [errors.fields.identifier?.message],
      globalErrors: errors.global ?? [],
    }),
    ...identifierSubmissionErrors,
  ];

  const verificationErrors = [
    ...collectErrorMessages({
      fieldMessages: [errors.fields.code?.message],
      globalErrors: errors.global ?? [],
    }),
    ...verificationSubmissionErrors,
  ];

  const startEmailCodeSignIn = useCallback(
    async (normalizedEmail: string) => {
      const { error: createError } = await signIn.create({
        identifier: normalizedEmail,
      });

      if (createError) {
        return createError;
      }

      const { error: sendError } = await signIn.emailCode.sendCode({
        emailAddress: normalizedEmail,
      });

      return sendError ?? null;
    },
    [signIn],
  );

  const handleSubmitEmail = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const normalizedEmail = String(
        new FormData(event.currentTarget).get("emailAddress") ?? "",
      )
        .trim()
        .toLowerCase();

      if (!normalizedEmail) {
        return;
      }

      setStatusMessage(null);
      setIdentifierSubmissionErrors([]);
      setVerificationSubmissionErrors([]);

      try {
        const access = await fetchLoginEligibility(normalizedEmail);
        const nextRedirectPath = resolveRoleRedirectPath(
          access.user.role,
          redirectTarget,
        );

        setAuthorizedRedirectPath(nextRedirectPath);

        let signInError = await startEmailCodeSignIn(normalizedEmail);

        if (signInError && submissionErrorHasCode(signInError, "form_identifier_not_found")) {
          await fetchLoginEligibility(normalizedEmail);
          signInError = await startEmailCodeSignIn(normalizedEmail);
        }

        if (signInError) {
          setIdentifierSubmissionErrors(
            collectSubmissionErrorMessages(signInError),
          );
          return;
        }

        if (signIn.status === "complete") {
          await finishSignIn(nextRedirectPath);
          return;
        }

        setEmailAddress(normalizedEmail);
        setCode("");
        setStep("verification");
        setStatusMessage(`${normalizedEmail} хаяг руу 6 оронтой код илгээлээ.`);
      } catch (error) {
        setIdentifierSubmissionErrors([
          error instanceof Error
            ? error.message
            : "Нэвтрэх эрх шалгаж чадсангүй.",
        ]);
      }
    },
    [finishSignIn, redirectTarget, signIn.status, startEmailCodeSignIn],
  );

  const handleVerifyCode = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const submittedCode = String(new FormData(event.currentTarget).get("otpCode") ?? "")
        .replace(/\D/g, "")
        .trim();

      if (!submittedCode) {
        return;
      }

      setStatusMessage(null);
      setVerificationSubmissionErrors([]);

      const { error } = await signIn.emailCode.verifyCode({ code: submittedCode });
      if (error) {
        setVerificationSubmissionErrors(collectSubmissionErrorMessages(error));
        return;
      }

      setStatusMessage("Нэвтрүүлж байна...");
      await finishSignIn(authorizedRedirectPath);
    },
    [authorizedRedirectPath, finishSignIn, signIn],
  );

  const handleResendCode = useCallback(async () => {
    setStatusMessage(null);
    setVerificationSubmissionErrors([]);

    const { error } = await signIn.emailCode.sendCode({
      emailAddress,
    });
    if (error) {
      setVerificationSubmissionErrors(collectSubmissionErrorMessages(error));
      return;
    }

    setStatusMessage(`${emailAddress} хаяг руу шинэ код дахин илгээлээ.`);
  }, [emailAddress, signIn]);

  const handleStartOver = useCallback(async () => {
    await signIn.reset();
    setStep("identifier");
    setCode("");
    setStatusMessage(null);
    setAuthorizedRedirectPath("/");
    setIdentifierSubmissionErrors([]);
    setVerificationSubmissionErrors([]);
  }, [signIn]);

  return {
    code,
    emailAddress,
    handleResendCode,
    handleStartOver,
    handleSubmitEmail,
    handleVerifyCode,
    identifierErrors,
    isSubmitting: fetchStatus === "fetching",
    isVerificationStep: step === "verification",
    setCode,
    setEmailAddress,
    statusMessage,
    verificationErrors,
  };
}
