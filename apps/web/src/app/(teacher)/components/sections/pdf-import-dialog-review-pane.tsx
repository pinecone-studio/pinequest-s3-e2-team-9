import Link from "next/link";
import { PdfImportDialogQuestionCard } from "./pdf-import-dialog-question-card";
import type { ImportJobView } from "./pdf-import-dialog-utils";

export function PdfImportDialogReviewPane({
  errorMessage,
  jobView,
  reviewSummary,
}: {
  errorMessage: string | null;
  jobView: ImportJobView | null;
  reviewSummary: string | null;
}) {
  return (
    <div className="flex min-h-0 flex-col">
      <div className="border-b border-[#EAECF0] px-6 py-4">
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#6B7280]">Review</p>
        <h3 className="mt-1 text-[18px] font-semibold text-[#0F1216]">
          {jobView ? jobView.title : "Draft асуулт бэлтгэх"}
        </h3>
        <p className="mt-1 text-[14px] text-[#667085]">
          {reviewSummary ??
            "Импорт эхлүүлсний дараа backend дээр draft асуултууд үүсэж энд харагдана."}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {errorMessage ? (
          <div className="mb-4 rounded-2xl border border-[#FDA29B] bg-[#FEF3F2] px-4 py-3 text-[14px] text-[#B42318]">
            {errorMessage}
          </div>
        ) : null}

        {!jobView ? (
          <div className="rounded-[20px] border border-dashed border-[#B9CCFF] bg-[#EEF4FF] p-5">
            <p className="text-[15px] font-medium text-[#1D2939]">Сонгосон файл бэлэн байна</p>
            <p className="mt-2 text-[14px] leading-6 text-[#475467]">
              Дараагийн алхмаар import job үүсгээд, гарч ирсэн асуултын draft-уудыг багш шалгаж батална.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobView.questionBank ? (
              <div className="rounded-[20px] border border-[#ABEFC6] bg-[#ECFDF3] px-4 py-3 text-[14px] text-[#067647]">
                Асуултууд амжилттай хадгалагдлаа.{" "}
                <Link
                  href={`/question-bank/${jobView.questionBank.id}`}
                  className="font-semibold underline"
                >
                  {jobView.questionBank.title}
                </Link>
              </div>
            ) : null}

            {jobView.questions.map((question) => (
              <PdfImportDialogQuestionCard key={question.id} question={question} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
