import { Suspense } from "react";
import { AuthShell } from "@/app/components/auth-shell";
import { CustomEmailOtpSignInForm } from "@/app/sign-in/[[...sign-in]]/custom-email-otp-sign-in-form";

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
      <Suspense fallback={null}>
        <CustomEmailOtpSignInForm />
      </Suspense>
    </AuthShell>
  );
}
