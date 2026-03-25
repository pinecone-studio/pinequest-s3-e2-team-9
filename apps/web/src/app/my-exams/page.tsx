import { MyExamsSection } from "../components/sections/my-exams-section";
import { Sidebar } from "../components/sidebar";

export default function MyExamsPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <div className="flex min-h-screen flex-col overflow-hidden lg:h-screen lg:flex-row">
        <Sidebar />
        <section className="flex-1 overflow-y-auto">
          <div className="w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-[32px] lg:py-[32px]">
            <MyExamsSection />
          </div>
        </section>
      </div>
    </main>
  );
}
