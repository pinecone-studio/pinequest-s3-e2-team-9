"use client";

import { useAuth, useSignIn } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { collectErrorMessages, collectSubmissionErrorMessages, getSafeRedirectPath } from "./sign-in-utils";

export function useEmailOtpSignIn() {
  const { userId, isLoaded: isAuthLoaded } = useAuth();
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<"identifier" | "verification">("identifier");
  const [emailAddress, setEmailAddress] = useState("");
  const [code, setCode] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [identifierSubmissionErrors, setIdentifierSubmissionErrors] = useState<string[]>([]);
  const [verificationSubmissionErrors, setVerificationSubmissionErrors] = useState<string[]>(
    [],
  );

  const redirectTarget = useMemo(
    () => getSafeRedirectPath(searchParams.get("redirect_url")),
    [searchParams],
  );

  useEffect(() => {
    if (isAuthLoaded && userId) {
      router.replace(redirectTarget);
    }
  }, [isAuthLoaded, redirectTarget, router, userId]);

  const finishSignIn = useCallback(async () => {
    const { error } = await signIn.finalize({
      navigate: ({ decorateUrl, session }) => {
        const target = session?.currentTask ? "/" : redirectTarget;
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
    }
  }, [redirectTarget, router, signIn]);

  const identifierErrors = [
    ...collectErrorMessages({
      fieldMessages: [errors.fields.identifier?.message],
      globalErrors: errors.global,
    }),
    ...identifierSubmissionErrors,
  ];

  const verificationErrors = [
    ...collectErrorMessages({
      fieldMessages: [errors.fields.code?.message],
      globalErrors: errors.global,
    }),
    ...verificationSubmissionErrors,
  ];

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

      const { error: createError } = await signIn.create({ identifier: normalizedEmail });
      if (createError) {
        setIdentifierSubmissionErrors(collectSubmissionErrorMessages(createError));
        return;
      }

      const { error: sendError } = await signIn.emailCode.sendCode({
        emailAddress: normalizedEmail,
      });
      if (sendError) {
        setIdentifierSubmissionErrors(collectSubmissionErrorMessages(sendError));
        return;
      }

      if (signIn.status === "complete") {
        await finishSignIn();
        return;
      }

      setEmailAddress(normalizedEmail);
      setCode("");
      setStep("verification");
      setStatusMessage(`${normalizedEmail} хаяг руу 6 оронтой код илгээлээ.`);
    },
    [finishSignIn, signIn],
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
      await finishSignIn();
    },
    [finishSignIn, signIn],
  );

  const handleResendCode = useCallback(async () => {
    setStatusMessage(null);
    setVerificationSubmissionErrors([]);
    const { error } = await signIn.emailCode.sendCode();
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
    isVerificationStep:
      step === "verification" || signIn.status === "needs_first_factor",
    setCode,
    setEmailAddress,
    statusMessage,
    verificationErrors,
  };
}
