import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/app/components/auth-shell";

const clerkAuthAppearance = {
  theme: "simple",
  variables: {
    colorPrimary: "#0B5FFF",
    colorText: "#101828",
    colorTextSecondary: "#526581",
    colorBackground: "#F8FBFF",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#101828",
    colorDanger: "#B42318",
    borderRadius: "1rem",
    fontFamily: "inherit",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "border-0 bg-transparent p-0 shadow-none",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton:
      "h-12 rounded-2xl border border-[#D6E4F5] bg-white text-[#101828] shadow-none transition hover:bg-[#EFF6FF]",
    socialButtonsBlockButtonText: "text-[14px] font-semibold",
    dividerRow: "my-6",
    dividerLine: "bg-[#D6E4F5]",
    dividerText:
      "bg-transparent px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7B8BA6]",
    formFieldLabel:
      "mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#526581]",
    formFieldInput:
      "h-12 rounded-2xl border border-[#C7D7EB] bg-white px-4 text-[15px] text-[#101828] shadow-none transition placeholder:text-[#8A9BB2] focus:border-[#0B5FFF] focus:ring-4 focus:ring-[#BFDBFE]",
    formButtonPrimary:
      "mt-2 h-12 rounded-2xl border-0 bg-[linear-gradient(135deg,#0B5FFF_0%,#2563EB_55%,#6EA8FF_100%)] text-[15px] font-semibold shadow-[0_18px_38px_rgba(11,95,255,0.28)] transition hover:brightness-105",
    footer: "mt-6",
    footerAction: "mt-6",
    footerActionText: "text-[14px] text-[#526581]",
    footerActionLink: "font-semibold text-[#0B5FFF] hover:text-[#0841B8]",
    identityPreviewText: "text-[#101828]",
    identityPreviewEditButton: "font-semibold text-[#0B5FFF] hover:text-[#0841B8]",
    formResendCodeLink: "font-semibold text-[#0B5FFF] hover:text-[#0841B8]",
    otpCodeFieldInput:
      "h-12 w-12 rounded-2xl border border-[#C7D7EB] bg-white text-[#101828] shadow-none focus:border-[#0B5FFF] focus:ring-4 focus:ring-[#BFDBFE]",
    alertText: "text-[14px]",
    formFieldSuccessText: "text-[13px] text-[#0F766E]",
    formFieldErrorText: "text-[13px] text-[#B42318]",
    formFieldHintText: "text-[13px] text-[#7B8BA6]",
  },
};

export default function SignUpPage() {
  return (
    <AuthShell
      badge="Teacher Access"
      title="Шинэ багшийн бүртгэл үүсгэх"
      description="Clerk-ийн хамгаалалттай бүртгэл үүсгээд Pinequest-ийн dashboard болон шалгалтын урсгалуудыг ашиглаж эхлээрэй."
      panelEyebrow="Create account"
      panelTitle="Бүртгүүлэх"
      panelDescription="Шинэ account нээгээд local sign-up flow-оор шууд Pinequest-ийн дотоод хэсэгт бэлэн болно."
    >
      <SignUp appearance={clerkAuthAppearance} routing="hash" signInUrl="/sign-in" />
    </AuthShell>
  );
}
