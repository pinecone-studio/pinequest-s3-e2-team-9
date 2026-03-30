"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
  ApproveExamImportJobMutationDocument,
  CreateExamImportJobMutationDocument,
  QuestionBanksQueryDocument,
  type ApproveExamImportJobMutationMutation,
  type ApproveExamImportJobMutationMutationVariables,
  type CreateExamImportJobMutationMutation,
  type CreateExamImportJobMutationMutationVariables,
} from "@/graphql/generated";
import { CloseIcon } from "../icons";
import { PdfImportDialogFooter } from "./pdf-import-dialog-footer";
import { PdfImportDialogPreviewPane } from "./pdf-import-dialog-preview-pane";
import { PdfImportDialogReviewPane } from "./pdf-import-dialog-review-pane";
import { buildImportJobView, type ImportJobView } from "./pdf-import-dialog-utils";

export function PdfImportDialog({
  open,
  selectedFile,
  onClose,
}: {
  open: boolean;
  selectedFile: File | null;
  onClose: () => void;
}) {
  const [jobView, setJobView] = useState<ImportJobView | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [createImportJob, { loading: isCreating }] = useMutation<
    CreateExamImportJobMutationMutation,
    CreateExamImportJobMutationMutationVariables
  >(
    CreateExamImportJobMutationDocument,
  );
  const [approveImportJob, { loading: isApproving }] = useMutation<
    ApproveExamImportJobMutationMutation,
    ApproveExamImportJobMutationMutationVariables
  >(
    ApproveExamImportJobMutationDocument,
  );

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      setJobView(null);
      setErrorMessage(null);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(nextPreviewUrl);
    setJobView(null);
    setErrorMessage(null);

    return () => {
      URL.revokeObjectURL(nextPreviewUrl);
    };
  }, [selectedFile]);

  const reviewSummary = useMemo(() => {
    if (!jobView) {
      return null;
    }

    return `${jobView.totalQuestions} асуулт, ${jobView.reviewCount} шалгах шаардлагатай`;
  }, [jobView]);

  if (!open || !selectedFile) {
    return null;
  }

  const handleImport = async () => {
    try {
      setErrorMessage(null);
      const result = await createImportJob({
        variables: {
          fileName: selectedFile.name,
          fileSizeBytes: selectedFile.size,
        },
      });
      const nextJob = result.data?.createExamImportJob;
      if (!nextJob) {
        throw new Error("PDF import job үүсгэсэн мэдээлэл ирсэнгүй.");
      }
      setJobView(buildImportJobView(nextJob));
    } catch (error) {
      console.error("Failed to create PDF import job", error);
      setErrorMessage("PDF импорт бэлтгэх үед алдаа гарлаа.");
    }
  };

  const handleApprove = async () => {
    if (!jobView) {
      return;
    }

    try {
      setErrorMessage(null);
      const result = await approveImportJob({
        variables: { id: jobView.id },
        refetchQueries: [{ query: QuestionBanksQueryDocument }],
        awaitRefetchQueries: true,
      });
      const nextJob = result.data?.approveExamImportJob;
      if (!nextJob) {
        throw new Error("PDF import approval мэдээлэл ирсэнгүй.");
      }
      setJobView(buildImportJobView(nextJob));
    } catch (error) {
      console.error("Failed to approve PDF import job", error);
      setErrorMessage("PDF импортын асуултуудыг хадгалах үед алдаа гарлаа.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-5"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-[1180px] flex-col overflow-hidden rounded-[24px] border border-[#DFE1E5] bg-[#FAFAFA] shadow-[0px_20px_40px_rgba(15,18,22,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#EAECF0] px-6 py-5">
          <div>
            <h2 className="text-[20px] font-semibold text-[#0F1216]">PDF-ээс асуулт импортлох</h2>
            <p className="mt-1 text-[14px] text-[#52555B]">
              PDF-ээ preview-лээд, гарч ирсэн draft асуултуудыг баталгаажуулна.
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
          />
          <PdfImportDialogReviewPane
            errorMessage={errorMessage}
            jobView={jobView}
            reviewSummary={reviewSummary}
          />
        </div>
        <PdfImportDialogFooter
          jobView={jobView}
          isCreating={isCreating}
          isApproving={isApproving}
          onClose={onClose}
          onImport={() => void handleImport()}
          onApprove={() => void handleApprove()}
        />
      </div>
    </div>
  );
}
