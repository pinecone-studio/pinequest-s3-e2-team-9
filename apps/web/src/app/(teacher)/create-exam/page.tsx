import { Sidebar } from "../components/sidebar";
import { CreateExamContent } from "./create-exam-content";
import { RoleGuard } from "@/components/role-guard";

type CreateExamPageProps = {
  searchParams: Promise<{
    classId?: string;
    returnTo?: string;
  }>;
};

export default async function CreateExamPage({
  searchParams,
}: CreateExamPageProps) {
  const params = await searchParams;

  return (
    <RoleGuard allowedRoles={["TEACHER"]}>
      <main className="min-h-screen bg-[#FAFAFA]">
        <div className="flex min-h-screen flex-col overflow-hidden lg:h-screen lg:flex-row">
          <Sidebar />
          <section className="flex-1 overflow-y-auto">
            <CreateExamContent
              initialClassId={params.classId}
              returnTo={params.returnTo}
            />
          </section>
        </div>
      </main>
    </RoleGuard>
  );
}
