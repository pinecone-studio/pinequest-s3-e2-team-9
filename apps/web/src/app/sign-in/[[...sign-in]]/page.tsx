import { AuthShell } from "@/app/components/auth-shell";
import { CustomEmailOtpSignInForm } from "./custom-email-otp-sign-in-form";

export const runtime = "edge";

export default function SignInPage() {
  return (
    <AuthShell
      badge="Pinequest Team 9"
      title="Шалгалт+ руу нэвтрэх"
      description="Dashboard, шалгалтын удирдлага, асуултын сан зэрэг багшийн хэрэгслүүд рүү орохын тулд өөрийн account-аар нэвтэрнэ үү."
      panelEyebrow="Secure sign in"
      panelTitle="Нэвтрэх"
      panelDescription="Имэйлээ оруулаад нэг удаагийн кодоор account-аа баталгаажуулж protected workspace руу орно."
    >
      <CustomEmailOtpSignInForm />
    </AuthShell>
  );
}
