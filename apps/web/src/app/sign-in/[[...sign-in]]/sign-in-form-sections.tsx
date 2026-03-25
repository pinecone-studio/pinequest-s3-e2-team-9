type SharedStepProps = {
  isSubmitting: boolean;
  messages: string[];
};

type EmailStepProps = SharedStepProps & {
  emailAddress: string;
  onEmailAddressChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

type VerificationStepProps = SharedStepProps & {
  code: string;
  emailAddress: string;
  onCodeChange: (value: string) => void;
  onResendCode: () => void;
  onStartOver: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function EmailIdentifierStep({
  emailAddress,
  isSubmitting,
  messages,
  onEmailAddressChange,
  onSubmit,
}: EmailStepProps) {
  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="rounded-[28px] border border-[#DCE6F2] bg-white/85 p-4">
        <label
          className="mb-3 block text-[12px] font-semibold uppercase tracking-[0.16em] text-[#526581]"
          htmlFor="emailAddress"
        >
          Email address
        </label>
        <input
          autoComplete="email"
          className="h-14 w-full rounded-2xl border border-[#C7D7EB] bg-white px-4 text-[16px] text-[#101828] outline-none transition placeholder:text-[#8A9BB2] focus:border-[#0B5FFF] focus:ring-4 focus:ring-[#BFDBFE]"
          id="emailAddress"
          name="emailAddress"
          onChange={(event) => {
            onEmailAddressChange(event.target.value);
          }}
          onInput={(event) => {
            onEmailAddressChange(event.currentTarget.value);
          }}
          placeholder="teacher@school.edu"
          type="email"
          value={emailAddress}
        />
      </div>

      {messages.length > 0 ? (
        <div className="rounded-[22px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] leading-6 text-[#B42318]">
          {messages.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      ) : null}

      <button
        className="h-14 w-full rounded-2xl bg-[linear-gradient(135deg,#0B5FFF_0%,#2563EB_55%,#6EA8FF_100%)] px-5 text-[16px] font-semibold text-white shadow-[0_18px_38px_rgba(11,95,255,0.28)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
        type="submit"
      >
        {isSubmitting ? "Илгээж байна..." : "Код авах"}
      </button>
    </form>
  );
}

export function VerificationStep({
  code,
  emailAddress,
  isSubmitting,
  messages,
  onCodeChange,
  onResendCode,
  onStartOver,
  onSubmit,
}: VerificationStepProps) {
  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="rounded-[24px] border border-[#DCE6F2] bg-white/85 p-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#526581]">
          Verification email
        </p>
        <div className="mt-2 flex items-center justify-between gap-4 rounded-2xl bg-[#F8FBFF] px-4 py-3">
          <div>
            <p className="text-[15px] font-semibold text-[#101828]">{emailAddress}</p>
            <p className="text-[13px] text-[#667085]">
              Имэйл рүү ирсэн 6 оронтой кодыг оруулна уу.
            </p>
          </div>
          <button
            className="shrink-0 text-[13px] font-semibold text-[#0B5FFF] hover:text-[#0841B8]"
            onClick={onStartOver}
            type="button"
          >
            Имэйл солих
          </button>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#DCE6F2] bg-white/85 p-4">
        <label
          className="mb-3 block text-[12px] font-semibold uppercase tracking-[0.16em] text-[#526581]"
          htmlFor="otpCode"
        >
          One-time code
        </label>
        <input
          autoComplete="one-time-code"
          className="h-14 w-full rounded-2xl border border-[#C7D7EB] bg-white px-4 text-[18px] tracking-[0.28em] text-[#101828] outline-none transition placeholder:tracking-normal placeholder:text-[#8A9BB2] focus:border-[#0B5FFF] focus:ring-4 focus:ring-[#BFDBFE]"
          id="otpCode"
          inputMode="numeric"
          maxLength={6}
          name="otpCode"
          onChange={(event) => {
            onCodeChange(event.target.value.replace(/\D/g, ""));
          }}
          onInput={(event) => {
            onCodeChange(event.currentTarget.value.replace(/\D/g, ""));
          }}
          placeholder="123456"
          type="text"
          value={code}
        />
      </div>

      {messages.length > 0 ? (
        <div className="rounded-[22px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] leading-6 text-[#B42318]">
          {messages.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      ) : null}

      <button
        className="h-14 w-full rounded-2xl bg-[#0F172A] px-5 text-[16px] font-semibold text-white shadow-[0_18px_36px_rgba(15,23,42,0.22)] transition hover:bg-[#1D2939] disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isSubmitting || code.trim().length < 6}
        type="submit"
      >
        {isSubmitting ? "Шалгаж байна..." : "Нэвтрэх"}
      </button>

      <div className="flex flex-col gap-3 text-[14px] sm:flex-row sm:items-center sm:justify-between">
        <button
          className="font-semibold text-[#0B5FFF] hover:text-[#0841B8]"
          onClick={onResendCode}
          type="button"
        >
          Код дахин илгээх
        </button>
        <button
          className="font-medium text-[#667085] hover:text-[#344054]"
          onClick={onStartOver}
          type="button"
        >
          Эхнээс нь эхлэх
        </button>
      </div>
    </form>
  );
}
