"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAssignExamToClassMutation, useMyExamsQueryQuery } from "@/graphql/generated";

type ClassAssignExamDialogProps = {
  classId: string;
  className: string;
  open: boolean;
  onClose: () => void;
  onAssigned: (examId: string) => Promise<void> | void;
};

export function ClassAssignExamDialog({ classId, className, open, onClose, onAssigned }: ClassAssignExamDialogProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showExisting, setShowExisting] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data, loading } = useMyExamsQueryQuery({
    fetchPolicy: "cache-and-network",
    skip: !open,
    ssr: false,
  });
  const [assignExamToClass, { loading: assigning }] = useAssignExamToClassMutation();

  useEffect(() => {
    if (!open) {
      setSearch("");
      setShowExisting(false);
      setSelectedExamId("");
      setErrorMessage(null);
    }
  }, [open]);

  const exams = useMemo(() => {
    const actorId = data?.me?.id ?? "";
    const items = actorId
      ? (data?.exams ?? []).filter((exam) => exam.createdBy.id === actorId && exam.class.id !== classId)
      : [];
    const keyword = search.trim().toLowerCase();
    return items.filter((exam) => !keyword || `${exam.title} ${exam.class.name}`.toLowerCase().includes(keyword));
  }, [classId, data?.exams, data?.me?.id, search]);
  if (!open) return null;

  const handleCreateNew = () => {
    const returnTo = encodeURIComponent(`/classes/${classId}`);
    router.push(`/create-exam?classId=${classId}&returnTo=${returnTo}`);
  };

  const handleAssign = async () => {
    if (!selectedExamId) {
      setErrorMessage("Шалгалтаа сонгоно уу.");
      return;
    }
    try {
      const result = await assignExamToClass({ variables: { examId: selectedExamId, classId } });
      const assignedExam = result.data?.assignExamToClass;
      if (!assignedExam) {
        throw new Error("Шалгалт оноосон хариу ирсэнгүй.");
      }
      await onAssigned(assignedExam.id);
      onClose();
    } catch (error) {
      console.error("Failed to assign exam to class", error);
      setErrorMessage("Шалгалт онооход алдаа гарлаа.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6" onClick={onClose}>
      <div
        className="w-full max-w-[680px] rounded-xl border border-[#DFE1E5] bg-white p-6 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-semibold text-[#0F1216]">Шалгалт оноох</h2>
            <p className="mt-1 text-[14px] text-[#52555B]">{className} ангид шалгалт нэмнэ</p>
          </div>
          <button type="button" className="cursor-pointer text-[14px] text-[#52555B]" onClick={onClose}>
            Хаах
          </button>
        </div>

        {!showExisting ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="cursor-pointer rounded-xl border border-[#DFE1E5] bg-[#FAFAFA] p-5 text-left"
              onClick={() => setShowExisting(true)}
            >
              <p className="text-[16px] font-semibold text-[#0F1216]">Миний шалгалтуудаас сонгох</p>
              <p className="mt-2 text-[14px] text-[#52555B]">Өмнө нь үүсгэсэн шалгалтаас сонгоод энэ ангид онооно.</p>
            </button>
            <button
              type="button"
              className="cursor-pointer rounded-xl border border-[#B2CCFF] bg-[#EEF4FF] p-5 text-left"
              onClick={handleCreateNew}
            >
              <p className="text-[16px] font-semibold text-[#0F1216]">Шинэ шалгалт үүсгэх</p>
              <p className="mt-2 text-[14px] text-[#52555B]">Энэ ангид зориулж шинэ шалгалтаа үүсгээд шууд онооно.</p>
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Шалгалт хайх..."
                className="h-10 flex-1 rounded-md border border-[#DFE1E5] px-3 text-[14px] text-[#0F1216]"
              />
              <button
                type="button"
                className="cursor-pointer rounded-md px-3 py-2 text-[14px] text-[#52555B]"
                onClick={() => setShowExisting(false)}
              >
                Буцах
              </button>
            </div>
            <div className="max-h-[360px] space-y-3 overflow-y-auto">
              {loading ? <p className="text-[14px] text-[#52555B]">Шалгалтуудыг ачаалж байна...</p> : null}
              {!loading && !exams.length ? (
                <p className="rounded-lg border border-[#DFE1E5] px-4 py-5 text-[14px] text-[#52555B]">Сонгож оноох шалгалт олдсонгүй.</p>
              ) : null}
              {exams.map((exam) => (
                <button
                  key={exam.id}
                  type="button"
                  className={`w-full cursor-pointer rounded-lg border px-4 py-4 text-left ${
                    selectedExamId === exam.id
                      ? "border-[#5B7CFF] bg-[#EEF4FF]"
                      : "border-[#DFE1E5] bg-white"
                  }`}
                  onClick={() => {
                    setSelectedExamId(exam.id);
                    setErrorMessage(null);
                  }}
                >
                  <p className="text-[15px] font-medium text-[#0F1216]">{exam.title}</p>
                  <p className="mt-1 text-[13px] text-[#52555B]">{exam.class.name} · {exam.questions.length} асуулт · {exam.durationMinutes} минут</p>
                </button>
              ))}
            </div>
            {errorMessage ? <p className="text-[13px] text-[#B42318]">{errorMessage}</p> : null}
            <button
              type="button"
              className="w-full cursor-pointer rounded-md bg-[#00267F] px-4 py-2 text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!selectedExamId || assigning}
              onClick={() => void handleAssign()}
            >
              {assigning ? "Оноож байна..." : "Сонгосон шалгалтыг оноох"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
