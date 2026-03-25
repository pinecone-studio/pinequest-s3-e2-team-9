"use client";

import { SignInStepHeader, StatusBanner } from "./sign-in-form-chrome";
import {
  EmailIdentifierStep,
  VerificationStep,
} from "./sign-in-form-sections";
import { useEmailOtpSignIn } from "./use-email-otp-sign-in";

export function CustomEmailOtpSignInForm() {
  const {
    code,
    emailAddress,
    handleResendCode,
    handleStartOver,
    handleSubmitEmail,
    handleVerifyCode,
    identifierErrors,
    isSubmitting,
    isVerificationStep,
    setCode,
    setEmailAddress,
    statusMessage,
    verificationErrors,
  } = useEmailOtpSignIn();

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
