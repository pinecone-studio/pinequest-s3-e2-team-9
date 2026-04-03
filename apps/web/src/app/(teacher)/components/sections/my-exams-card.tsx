/* eslint-disable max-lines */
import Image from "next/image";
import Link from "next/link";
import {
  ClockIcon,
  DetailsIcon,
  PreviewPencilIcon,
} from "../icons";
import { StickyNoteIcon } from "../icons-addition";
import type { MyExamsSectionMode } from "./my-exams-section-config";
import type { MyExamListView } from "./my-exams-types";

type MyExamCardProps = {
  exam: MyExamListView;
  mode: MyExamsSectionMode;
  onView: () => void;
  onResults: () => void;
};

function getHeaderToneClass(statusLabel: string) {
  if (statusLabel === "Явагдаж буй") {
    return "border-[#EAB53266]";
  }
  if (statusLabel === "Дууссан") {
    return "border-[#31AA4066]";
  }
  return "border-[#C4B5FD]";
}

function ExamCardIllustration() {
  return (
    <div className="relative h-16 w-16 overflow-hidden rounded-[4px] bg-[#FFD780]">
      <Image
        alt="Шалгалтын зураг"
        className="object-cover"
        fill
        sizes="64px"
        src="/exam-card-physics.jpeg"
      />
    </div>
  );
}

function downloadExamSummary(exam: MyExamListView) {
  const lines = [
    `Гарчиг: ${exam.title}`,
    `Хичээл: ${exam.subjectName}`,
    `Анги: ${exam.classGrade}-р анги`,
    `Бүлэг: ${exam.className}`,
    `Хугацаа: ${exam.durationLabel}`,
    `Асуултын тоо: ${exam.questionCount}`,
    `Нийт оноо: ${exam.totalPointsLabel}`,
    `Үүсгэсэн огноо: ${exam.createdDateLabel}`,
    `Төлөв: ${exam.status.label}`,
  ].join("\n");

  const blob = new Blob([`\uFEFF${lines}`], {
    type: "text/plain;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${exam.title.replace(/[\\/:*?\"<>|]/g, "-")}-summary.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function MyExamCard({ exam, mode, onView, onResults }: MyExamCardProps) {
  const durationLabel = exam.durationLabel.replace("минут", "мин");
  const showResults = mode === "evaluation" && exam.actions.results;
  const canEdit = mode === "library" && exam.actions.edit;
  const returnTo = mode === "evaluation" ? "/evaluation" : "/my-exams";
  const editHref = `/create-exam?${new URLSearchParams({
    examId: exam.id,
    returnTo,
  }).toString()}`;
  const primaryClassName =
    "inline-flex h-8 items-center justify-center gap-1 rounded-[4px] bg-[#6434F8] px-4 text-[10px] font-semibold text-white transition hover:bg-[#5628E8]";
  const secondaryClassName =
    "inline-flex h-8 items-center justify-center gap-1 rounded-[4px] bg-[#F3E8FF] px-4 text-[10px] font-medium text-[#6434F8] transition hover:bg-[#E9D5FF]";
  const statusTone = exam.status.tone;
  const headerToneClass = getHeaderToneClass(exam.status.label);
  const startedLabel =
    exam.startedAtLabel ??
    (exam.status.label === "Ноорог" ? "Хараахан эхлээгүй" : "Эхлэх хугацаагүй");
  const endsLabel =
    exam.endsAtLabel ??
    (exam.status.label === "Ноорог" ? "Дуусах хугацаа товлоогүй" : "Дуусах хугацаагүй");

  if (mode === "library") {
    return (
      <article className="box-border flex h-[215px] w-[268px] max-w-full flex-none flex-col items-start gap-[10px] rounded-[5.74216px] border border-[#E4E4E4] bg-white p-3 shadow-[0px_3.22191px_4.83286px_rgba(0,0,0,0.09)]">
        <div className="flex h-[191px] w-[244px] flex-col items-start gap-4 self-stretch">
          <div className={`relative flex h-24 w-[244px] items-center gap-[11px] overflow-hidden rounded-[4px] border bg-[#F3E8FF] px-3 ${headerToneClass}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle,#D8B4FE_1px,transparent_1.2px)] [background-size:10px_10px] opacity-35" />
            <div className="relative z-10 shrink-0">
              <ExamCardIllustration />
            </div>
            <div className="relative z-10 flex min-w-0 flex-1 flex-col items-start justify-center gap-2">
              <p className="line-clamp-1 font-[var(--font-inter)] text-[19px] font-bold leading-[24px] text-[#6434F8]">
                10-р анги
              </p>
            </div>
          </div>

          <div className="flex w-[244px] flex-col items-start gap-[10px] self-stretch">
            <h3 className="line-clamp-2 w-full font-[var(--font-inter)] text-[14px] font-bold leading-[17px] text-[#211C37]">
              {exam.title}
            </h3>

            <div className="flex h-3 w-[244px] items-start gap-[14px] self-stretch">
              <div className="flex h-3 items-center gap-1 text-[#1C1D1D]">
                <ClockIcon className="h-3 w-3" />
                <span className="font-[var(--font-sora)] text-[10px] font-normal leading-[13px]">
                  {durationLabel}
                </span>
              </div>

              <div className="flex h-3 items-center gap-1 text-[#1C1D1D]">
                <StickyNoteIcon className="h-3 w-3" />
                <span className="font-[var(--font-sora)] text-[10px] font-normal leading-[13px]">
                  {exam.questionCount} Асуулт
                </span>
              </div>
            </div>
          </div>

          <div className="flex h-6 w-[244px] items-center gap-3 self-stretch">
            {canEdit ? (
              <Link
                className="inline-flex h-6 w-[70px] items-center justify-center gap-1 rounded-[4px] bg-[#6434F8] px-3 font-[var(--font-inter)] text-[10px] font-semibold leading-3 text-white transition hover:bg-[#5628E8]"
                href={editHref}
              >
                <PreviewPencilIcon className="h-3 w-3" />
                Засах
              </Link>
            ) : (
              <button
                className="inline-flex h-6 min-w-[70px] items-center justify-center gap-1 rounded-[4px] bg-[#6434F8] px-3 font-[var(--font-inter)] text-[10px] font-semibold leading-3 text-white transition hover:bg-[#5628E8]"
                onClick={onView}
                type="button"
              >
                <DetailsIcon className="h-3 w-3" />
                Харах
              </button>
            )}

            <button
              className="inline-flex h-6 w-[93px] items-center justify-center gap-1 rounded-[4px] bg-[#F3E8FF] px-3 font-[var(--font-inter)] text-[10px] font-medium leading-3 text-[#6434F8] transition hover:bg-[#E9D5FF]"
              onClick={() => downloadExamSummary(exam)}
              type="button"
            >
              <DownloadIcon className="h-3 w-3" />
              Татаж авах
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex min-h-[300px] w-[268px] max-w-full flex-none flex-col gap-4 rounded-[6px] border border-[#E4E4E4] bg-white p-3 shadow-[0px_3.22px_4.83px_rgba(0,0,0,0.09)]">
      <div className={`relative flex h-24 items-center gap-3 overflow-hidden rounded-[4px] border bg-[#F3E8FF] px-4 ${headerToneClass}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle,#D8B4FE_1px,transparent_1.2px)] [background-size:12px_12px] opacity-45" />
        <div className="relative shrink-0">
          <ExamCardIllustration />
        </div>
        <div className="relative min-w-0">
          <p className="truncate text-[14px] font-bold leading-[1.2] text-[#6434F8]">
            10-р анги
          </p>
        </div>
        <span
          className={`absolute right-[10px] top-[8px] rounded-[999px] border px-2 py-1 text-[10px] font-semibold leading-3 ${statusTone}`}
        >
          {exam.status.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-[10px]">
        <div className="space-y-[10px]">
          <h3 className="line-clamp-2 text-[14px] font-bold leading-[17px] text-[#211C37]">
            {exam.title}
          </h3>
          {mode === "evaluation" ? (
            <div className="space-y-2 rounded-[4px] border border-[#ECECEC] bg-[#FAFAFA] px-3 py-2 text-[10px] text-[#344054]">
              <p>
                <span className="font-semibold text-[#101828]">Эхэлсэн:</span> {startedLabel}
              </p>
              <p>
                <span className="font-semibold text-[#101828]">Дууссан:</span> {endsLabel}
              </p>
            </div>
          ) : null}
          <div className="flex items-center gap-[14px] text-[10px] text-[#1C1D1D]">
            <span className="inline-flex items-center gap-1">
              <ClockIcon className="h-3 w-3" />
              {durationLabel}
            </span>
            <span className="inline-flex items-center gap-1">
              <StickyNoteIcon className="h-3 w-3" />
              {exam.questionCount} асуулт
            </span>
            {exam.footer ? (
              <span className="inline-flex items-center gap-1 text-[#52555B]">
                {exam.footer.submitted} хүүхэд өгсөн
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-3">
          {canEdit ? (
            <Link className={primaryClassName} href={editHref}>
              <PreviewPencilIcon className="h-3 w-3" />
              Засах
            </Link>
          ) : (
            <button
              className={primaryClassName}
              onClick={onView}
              type="button"
            >
              <DetailsIcon className="h-3 w-3" />
              Харах
            </button>
          )}

          {showResults ? (
            <button
              className={secondaryClassName}
              onClick={onResults}
              type="button"
            >
              <DetailsIcon className="h-3 w-3" />
              Үр дүн
            </button>
          ) : (
            <button
              className={secondaryClassName}
              onClick={onView}
              type="button"
            >
              <DetailsIcon className="h-3 w-3" />
              Дэлгэрэнгүй
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.5 4.5V2.25A1.25 1.25 0 0 0 8.25 1h-4.5A1.25 1.25 0 0 0 2.5 2.25V4.5m0 2.5v1.75c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75V7M6 4v3.25m0 0 1.5-1.5M6 7.25l-1.5-1.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.1"
      />
    </svg>
  );
}
