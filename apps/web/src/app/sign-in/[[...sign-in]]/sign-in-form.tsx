"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { CodeStep, EmailStep } from "./sign-in-steps";

const getErrorMessage = (error: { longMessage?: string; message?: string } | null) => {
  return error?.longMessage || error?.message || "Sign in failed. Please try again.";
};

export function SignInForm() {
  const router = useRouter();
  const { signIn } = useSignIn();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"identifier" | "code">("identifier");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const finalizeSignIn = async () => {
    if (!signIn || signIn.status !== "complete") {
      setError("Sign in could not be completed.");
      return;
    }

    const finalized = await signIn.finalize({
      navigate: ({ decorateUrl }) => {
        router.replace(decorateUrl("/dashboard"));
      },
    });

    if (finalized.error) {
      setError(getErrorMessage(finalized.error));
    }
  };

  const handleContinue = async () => {
    const value = email.trim();

    if (!value) {
      setError("Email address is required.");
      return;
    }

    if (!signIn) {
      setError("Authentication is still loading. Please try again.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signIn.emailCode.sendCode({ emailAddress: value });

      if (result.error) {
        setError(getErrorMessage(result.error));
        return;
      }

      setEmail(value);
      setCode("");
      setStep("code");
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!signIn) {
      setError("Authentication is still loading. Please try again.");
      return;
    }

    const normalizedCode = code.trim();

    if (!/^\d{6}$/.test(normalizedCode)) {
      setError("Enter the 6-digit code.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signIn.emailCode.verifyCode({
        code: normalizedCode,
      });

      if (result.error) {
        setError(getErrorMessage(result.error));
        return;
      }

      await finalizeSignIn();
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!signIn) {
      setError("Authentication is still loading. Please try again.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signIn.emailCode.sendCode({ emailAddress: email });

      if (result.error) {
        setError(getErrorMessage(result.error));
      }
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page login-page">
      <div className="login-layout">
        <section className="login-brand">
          <p className="login-eyebrow">Pinequest Team 9</p>
          <h1 className="login-brand-title">Teacher dashboard access</h1>
          <p className="login-brand-copy">
            Sign in with your school account to continue into the protected Team
            9 workspace. Account creation is disabled on this screen.
          </p>
          <div className="login-pill-row">
            <span className="pill">Clerk login</span>
            <span className="pill">No sign-up</span>
            <span className="pill">Protected dashboard</span>
          </div>
        </section>

        {step === "identifier" ? (
          <EmailStep
            email={email}
            error={error}
            isSubmitting={isSubmitting}
            onChangeEmail={setEmail}
            onContinue={handleContinue}
          />
        ) : (
          <CodeStep
            code={code}
            email={email}
            error={error}
            isSubmitting={isSubmitting}
            onChangeCode={(value) => {
              const numeric = value.replace(/\D/g, "").slice(0, 6);
              setCode(numeric);
            }}
            onResendCode={handleResendCode}
            onSubmit={handleCodeSubmit}
            onUseAnotherEmail={async () => {
              await signIn?.reset();
              setCode("");
              setError(null);
              setStep("identifier");
            }}
          />
        )}
      </div>
    </main>
  );
}
