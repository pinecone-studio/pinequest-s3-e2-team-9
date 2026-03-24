import type { FormEvent } from "react";

type EmailStepProps = {
  email: string;
  error: string | null;
  isSubmitting: boolean;
  onChangeEmail: (value: string) => void;
  onContinue: () => void;
};

type CodeStepProps = {
  code: string;
  email: string;
  error: string | null;
  isSubmitting: boolean;
  onChangeCode: (value: string) => void;
  onResendCode: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUseAnotherEmail: () => void;
};

export function EmailStep({
  email,
  error,
  isSubmitting,
  onChangeEmail,
  onContinue,
}: EmailStepProps) {
  return (
    <section className="login-card">
      <header className="login-card-header">
        <p className="auth-kicker">Login</p>
        <h2 className="login-card-title">Sign in to Pinequest Team 9</h2>
        <p className="login-card-copy">
          Welcome back. Enter your school email and we&apos;ll send a 6-digit
          verification code.
        </p>
      </header>

      {error ? <p className="login-error">{error}</p> : null}

      <label className="login-field">
        <span className="login-label">Email address</span>
        <input
          autoComplete="email"
          className="login-input"
          onChange={(event) => onChangeEmail(event.target.value)}
          placeholder="teacher@pinequest.mn"
          type="email"
          value={email}
        />
      </label>

      <button
        className="login-button"
        disabled={isSubmitting}
        onClick={onContinue}
        type="button"
      >
        {isSubmitting ? "Sending code..." : "Send code"}
      </button>
    </section>
  );
}

export function CodeStep({
  code,
  email,
  error,
  isSubmitting,
  onChangeCode,
  onResendCode,
  onSubmit,
  onUseAnotherEmail,
}: CodeStepProps) {
  return (
    <form className="login-card" onSubmit={onSubmit}>
      <header className="login-card-header">
        <p className="auth-kicker">6-digit code</p>
        <h2 className="login-card-title">Check your inbox</h2>
        <p className="login-card-copy">
          Enter the verification code sent to {email}.
        </p>
      </header>

      {error ? <p className="login-error">{error}</p> : null}

      <label className="login-field">
        <span className="login-label">Verification code</span>
        <input
          autoComplete="one-time-code"
          className="login-input login-input--otp"
          inputMode="numeric"
          maxLength={6}
          onChange={(event) => onChangeCode(event.target.value)}
          placeholder="000000"
          type="text"
          value={code}
        />
      </label>

      <button className="login-button" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Verifying..." : "Verify code"}
      </button>

      <div className="login-inline-actions">
        <button
          className="login-text-button"
          disabled={isSubmitting}
          onClick={onResendCode}
          type="button"
        >
          Resend code
        </button>

        <button className="login-text-button" onClick={onUseAnotherEmail} type="button">
          Use another email
        </button>
      </div>
    </form>
  );
}
