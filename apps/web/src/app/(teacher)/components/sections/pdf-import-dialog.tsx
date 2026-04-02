"use client";

import { CloseIcon } from "../icons";
import { PdfImportDialogFooter } from "./pdf-import-dialog-footer";
import { PdfImportDialogPreviewPane } from "./pdf-import-dialog-preview-pane";
import { PdfImportDialogReviewPane } from "./pdf-import-dialog-review-pane";
import { isImageImportFile } from "./pdf-import-extraction-service-helpers";
import { usePdfImportDialog } from "./use-pdf-import-dialog";

export function PdfImportDialog({
  open,
  selectedFile,
  onClose,
}: {
  open: boolean;
  selectedFile: File | null;
  onClose: () => void;
}) {
  const {
    classOptions,
    errorMessage,
    examEditHref,
    handleApprove,
    handleImport,
    infoMessage,
    isApproving,
    isCreating,
    jobView,
    mergeQuestionWithNext,
    moveQuestion,
    previewUrl,
    rejectQuestion,
    reviewQuestions,
    reviewSummary,
    selectedClassId,
    setSelectedClassId,
    splitQuestion,
    updateQuestion,
  } = usePdfImportDialog(selectedFile, open);

  if (!open || !selectedFile) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-5"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="flex h-[min(94vh,860px)] w-full max-w-[1180px] flex-col overflow-hidden rounded-[24px] border border-[#DFE1E5] bg-[#FAFAFA] shadow-[0px_20px_40px_rgba(15,18,22,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#EAECF0] px-6 py-5">
          <div>
            <h2 className="text-[20px] font-semibold text-[#0F1216]">Файлаас асуулт импортлох</h2>
            <p className="mt-1 text-[14px] text-[#52555B]">
              PDF эсвэл зургаа preview-лээд, гарч ирсэн draft асуултуудыг баталгаажуулна.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-[#52555B] transition hover:bg-white"
            onClick={onClose}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="grid flex-1 gap-0 overflow-hidden xl:grid-cols-[1.05fr_0.95fr]">
          <PdfImportDialogPreviewPane
            fileName={selectedFile.name}
            fileSize={selectedFile.size}
            previewUrl={previewUrl}
            isImage={isImageImportFile(selectedFile)}
          />
          <PdfImportDialogReviewPane
            examEditHref={examEditHref}
            errorMessage={errorMessage}
            infoMessage={infoMessage}
            jobView={jobView}
            onQuestionMergeWithNext={mergeQuestionWithNext}
            onQuestionMove={moveQuestion}
            onQuestionReject={rejectQuestion}
            onQuestionSplit={splitQuestion}
            onQuestionUpdate={updateQuestion}
            reviewQuestions={reviewQuestions}
            reviewSummary={reviewSummary}
          />
        </div>
        <PdfImportDialogFooter
          examEditHref={examEditHref}
          jobView={jobView}
          isCreating={isCreating}
          isApproving={isApproving}
          classOptions={classOptions}
          reviewQuestionCount={reviewQuestions.length}
          selectedClassId={selectedClassId}
          onClose={onClose}
          onClassChange={setSelectedClassId}
          onImport={() => void handleImport()}
          onApprove={() => void handleApprove()}
        />
      </div>
    </div>
  );
}
