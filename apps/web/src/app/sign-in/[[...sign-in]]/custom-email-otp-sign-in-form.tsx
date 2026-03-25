"use client";

import { useAuth, useSignIn } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SignInStepHeader, StatusBanner } from "./sign-in-form-chrome";
import {
  EmailIdentifierStep,
  VerificationStep,
} from "./sign-in-form-sections";
import { collectErrorMessages, getSafeRedirectPath } from "./sign-in-utils";

const collectSubmissionErrorMessages = (error: unknown) => {
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

export function CustomEmailOtpSignInForm() {
  const { userId, isLoaded: isAuthLoaded } = useAuth();
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<"identifier" | "verification">("identifier");
  const [emailAddress, setEmailAddress] = useState("");
  const [code, setCode] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
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
    if (!error) {
      return;
    }
    setStatusMessage(null);
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
      const { error: createError } = await signIn.create({
        identifier: normalizedEmail,
      });
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
    [emailAddress, finishSignIn, signIn],
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
      const { error } = await signIn.emailCode.verifyCode({
        code: submittedCode,
      });
      if (error) {
        setVerificationSubmissionErrors(collectSubmissionErrorMessages(error));
        return;
      }
      if (signIn.status === "complete") {
        await finishSignIn();
        return;
      }
      setStatusMessage("Кодыг шалгаж байна...");
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

  const isSubmitting = fetchStatus === "fetching";
  const isVerificationStep =
    step === "verification" || signIn.status === "needs_first_factor";

  return (
    <div className="space-y-6">
      <SignInStepHeader isVerificationStep={isVerificationStep} />
      <StatusBanner statusMessage={statusMessage} />
      {!isVerificationStep ? (
        <EmailIdentifierStep
          emailAddress={emailAddress}
          isSubmitting={isSubmitting}
          messages={identifierErrors}
          onEmailAddressChange={setEmailAddress}
          onSubmit={handleSubmitEmail}
        />
      ) : (
        <VerificationStep
          code={code}
          emailAddress={emailAddress}
          isSubmitting={isSubmitting}
          messages={verificationErrors}
          onCodeChange={setCode}
          onResendCode={() => {
            void handleResendCode();
          }}
          onStartOver={() => {
            void handleStartOver();
          }}
          onSubmit={handleVerifyCode}
        />
      )}
    </div>
  );
}
