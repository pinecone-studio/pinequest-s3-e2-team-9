/* eslint-disable @next/next/no-img-element */
/* eslint-disable max-lines */
"use client";

import { useState } from "react";
import { useProtectedImageSource } from "@/lib/image-answer";
import { CloseIcon } from "../icons";
import {
  formatQuestionAnswer,
  formatTolerance,
  type QuestionBankQuestionRow,
} from "../question-bank-utils";

export function QuestionBankQuestionPreviewDialog({
  row,
  editable = true,
  ownedBankOptions = [],
  requestStatus,
  isRequesting = false,
  isForking = false,
  onRequestAccess,
  onForkQuestion,
  onClose,
}: {
  row: QuestionBankQuestionRow | null;
  editable?: boolean;
  ownedBankOptions?: Array<{ id: string; label: string }>;
  requestStatus?: "PENDING" | "APPROVED" | "REJECTED";
  isRequesting?: boolean;
  isForking?: boolean;
  onRequestAccess?: (questionId: string) => Promise<void> | void;
  onForkQuestion?: (questionId: string, targetBankId: string) => Promise<void> | void;
  onClose: () => void;
}) {
  if (!row) {
    return null;
  }

  return (
    <QuestionBankQuestionPreviewContent
      key={row.id}
      row={row}
      editable={editable}
      ownedBankOptions={ownedBankOptions}
      requestStatus={requestStatus}
      isRequesting={isRequesting}
      isForking={isForking}
      onRequestAccess={onRequestAccess}
      onForkQuestion={onForkQuestion}
      onClose={onClose}
    />
  );
}

function QuestionBankQuestionPreviewContent({
  row,
  editable,
  ownedBankOptions,
  requestStatus,
  isRequesting,
  isForking,
  onRequestAccess,
  onForkQuestion,
  onClose,
}: {
  row: QuestionBankQuestionRow;
  editable: boolean;
  ownedBankOptions: Array<{ id: string; label: string }>;
  requestStatus?: "PENDING" | "APPROVED" | "REJECTED";
  isRequesting: boolean;
  isForking: boolean;
  onRequestAccess?: (questionId: string) => Promise<void> | void;
  onForkQuestion?: (questionId: string, targetBankId: string) => Promise<void> | void;
  onClose: () => void;
}) {
  const [targetBankId, setTargetBankId] = useState(ownedBankOptions[0]?.id ?? "");
  const tolerance = formatTolerance(row.tags);
  const answer = formatQuestionAnswer(row);
  const needsAccessRequest = !editable && row.requiresAccessRequest && requestStatus !== "APPROVED";
  const canFork = !editable && !needsAccessRequest && ownedBankOptions.length > 0;
  const {
    error: promptImageError,
    isLoading: isPromptImageLoading,
    src: promptImageSrc,
  } = useProtectedImageSource(row.promptImageValue ?? "");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[720px] rounded-xl border border-[#DFE1E5] bg-[#FAFAFA] p-6 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[20px] font-semibold text-[#0F1216]">{row.text}</h3>
            <p className="mt-1 text-[14px] text-[#52555B]">
              {row.type} · {row.difficulty}
            </p>
            {!editable ? (
              <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
                <span className="rounded-full border border-[#DFE1E5] bg-white px-2 py-1 text-[#344054]">
                  {row.createdByName}-ийн асуулт
                </span>
                <span
                  className={[
                    "rounded-full border px-2 py-1",
                    row.shareScope === "PUBLIC"
                      ? "border-[#D6BBFB] bg-[#F4EBFF] text-[#6434F8]"
                      : row.shareScope === "COMMUNITY"
                        ? "border-[#D6BBFB] bg-[#F4EBFF] text-[#7A2EAB]"
                        : "border-[#FECACA] bg-[#FEF2F2] text-[#B42318]",
                  ].join(" ")}
                >
                  {row.shareScope === "PUBLIC"
                    ? "Нээлттэй"
                    : row.shareScope === "COMMUNITY"
                      ? "Community хүрээ"
                      : "Хувийн"}
                </span>
                {row.requiresAccessRequest ? (
                  <span className="rounded-full border border-[#FECACA] bg-[#FEF2F2] px-2 py-1 text-[#B42318]">
                    Зөвшөөрөл шаардлагатай
                  </span>
                ) : null}
                {requestStatus ? (
                  <span className="rounded-full border border-[#D0D5DD] bg-[#F8FAFC] px-2 py-1 text-[#344054]">
                    {requestStatus === "PENDING"
                      ? "Хүсэлт хүлээгдэж байна"
                      : requestStatus === "APPROVED"
                        ? "Хүсэлт зөвшөөрөгдсөн"
                        : "Хүсэлт татгалзсан"}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-[#52555B] hover:bg-white"
            onClick={onClose}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 text-[14px] text-[#0F1216]">
          <section className="rounded-lg border border-[#DFE1E5] bg-white p-4">
            <p className="mb-2 text-[12px] font-medium text-[#52555B]">Асуулт</p>
            <p>{row.prompt || row.text}</p>
            {promptImageSrc ? (
              <div className="mt-4 overflow-hidden rounded-md border border-[#DFE1E5] bg-[#F8FAFC] p-2">
                <img
                  alt="Асуултын хавсаргасан зураг"
                  className="max-h-[320px] w-full rounded object-contain"
                  src={promptImageSrc}
                />
              </div>
            ) : null}
            {isPromptImageLoading ? (
              <p className="mt-3 text-[12px] text-[#667085]">Зургийг ачаалж байна...</p>
            ) : null}
            {promptImageError ? (
              <p className="mt-3 text-[12px] font-medium text-[#B42318]">
                {promptImageError}
              </p>
            ) : null}
          </section>
          {row.rawType === "MCQ" ? (
            <section className="rounded-lg border border-[#DFE1E5] bg-white p-4">
              <p className="mb-2 text-[12px] font-medium text-[#52555B]">Сонголтууд</p>
              <div className="space-y-2">
                {row.options.map((option, index) => (
                  <div
                    key={`${row.id}-${option}-${index}`}
                    className={`rounded-md border px-3 py-2 ${
                      option === row.correctAnswer
                        ? "border-[#31AA4033] bg-[#31AA401A] text-[#0F1216]"
                        : "border-[#DFE1E5]"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          <section className="rounded-lg border border-[#DFE1E5] bg-white p-4">
            <p className="mb-2 text-[12px] font-medium text-[#52555B]">Хариулт</p>
            <p>{answer}</p>
            {tolerance ? (
              <p className="mt-2 text-[12px] text-[#52555B]">Хүлцэл: {tolerance}</p>
            ) : null}
          </section>
          {!editable ? (
            <section className="rounded-lg border border-[#DFE1E5] bg-white p-4">
              <p className="mb-2 text-[12px] font-medium text-[#52555B]">Ашиглах эрх</p>
              {needsAccessRequest ? (
                <div className="space-y-3">
                  <p className="text-[13px] text-[#52555B]">
                    Энэ асуултыг шалгалтад ашиглахын өмнө эзэмшигч багшаас зөвшөөрөл авна.
                  </p>
                  <button
                    type="button"
                    className="inline-flex h-9 items-center justify-center rounded-md bg-[#6434F8] px-4 text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:bg-[#98A2B3]"
                    disabled={isRequesting || requestStatus === "PENDING"}
                    onClick={() => void onRequestAccess?.(row.id)}
                  >
                    {requestStatus === "PENDING"
                      ? "Хүсэлт илгээсэн"
                      : isRequesting
                        ? "Илгээж байна..."
                        : "Хүсэлт илгээх"}
                  </button>
                </div>
              ) : canFork ? (
                <div className="space-y-3">
                  <p className="text-[13px] text-[#52555B]">
                    {requestStatus === "APPROVED"
                      ? "Энэ асуултыг шууд шалгалтад ашиглаж болно. Хэрэв өөрчилж засварлах бол өөрийн санд хувилбар гаргаж авна."
                      : "Энэ асуултыг өөрийн санд хувилбарлаж аваад засварлан ашиглаж болно."}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <select
                      value={targetBankId}
                      onChange={(event) => setTargetBankId(event.target.value)}
                      className="min-w-0 flex-1 rounded-md border border-[#D0D5DD] px-3 py-2 text-[14px] text-[#0F1216]"
                    >
                      {ownedBankOptions.map((bank) => (
                        <option key={bank.id} value={bank.id}>
                          {bank.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="inline-flex h-10 items-center justify-center rounded-md border border-[#6434F8] px-4 text-[14px] font-medium text-[#6434F8] disabled:cursor-not-allowed disabled:border-[#D0D5DD] disabled:text-[#98A2B3]"
                      disabled={!targetBankId || isForking}
                      onClick={() => void onForkQuestion?.(row.id, targetBankId)}
                    >
                      {isForking ? "Хувилбарлаж байна..." : "Миний санд хувилбар гаргах"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[13px] text-[#52555B]">
                  Энэ асуултыг харах боломжтой. Хэрэв хувилбарлаж хадгалах бол эхлээд өөрийн
                  асуултын сан үүсгэнэ үү.
                </p>
              )}
            </section>
          ) : null}
          <div className="flex justify-end border-t border-[#DFE1E5] pt-4">
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-md px-4 text-[14px] font-medium text-[#0F1216]"
              onClick={onClose}
            >
              Буцах
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
