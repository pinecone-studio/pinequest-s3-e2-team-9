type StepHeaderProps = {
  isVerificationStep: boolean;
};

type StatusBannerProps = {
  statusMessage: string | null;
};

export function SignInStepHeader({ isVerificationStep }: StepHeaderProps) {
  return (
    <div className="flex items-center justify-between rounded-[24px] border border-[#DCE6F2] bg-white/80 px-4 py-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7B8BA6]">
          {isVerificationStep ? "Step 2 of 2" : "Step 1 of 2"}
        </p>
        <p className="mt-1 text-[15px] font-semibold text-[#101828]">
          {isVerificationStep
            ? "Имэйлээр ирсэн кодоо баталгаажуулна уу"
            : "Имэйл хаягаа оруулна уу"}
        </p>
      </div>
      <div className="rounded-full bg-[#EEF4FF] px-3 py-1 text-[12px] font-semibold text-[#0B5FFF]">
        {isVerificationStep ? "OTP" : "Email"}
      </div>
    </div>
  );
}

export function StatusBanner({ statusMessage }: StatusBannerProps) {
  if (!statusMessage) {
    return null;
  }

  return (
    <div className="rounded-[22px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-[14px] leading-6 text-[#0B4ABF]">
      {statusMessage}
    </div>
  );
}
