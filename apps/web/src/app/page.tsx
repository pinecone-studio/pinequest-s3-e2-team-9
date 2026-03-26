import { AppShell } from "./components/app-shell";
import { DashboardContent } from "./components/dashboard-content";

export default function Home() {
  return (
    <AppShell contentClassName="lg:px-[60px] lg:py-[54px]">
      <DashboardContent />
    </AppShell>
  );
}
