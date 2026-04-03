/* eslint-disable max-lines */
"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
  CreateQuestionVariantsMutationDocument,
  DeleteQuestionMutationDocument,
  GroupQuestionsAsVariantsMutationDocument,
  QuestionBankDetailQueryDocument,
} from "@/graphql/generated";
import type { QuestionBankQuestionRow } from "../question-bank-utils";
import { DotsIcon } from "../icons";
import { QuestionBankAddQuestionDialog } from "./question-bank-add-question-dialog";
import { QuestionBankQuestionPreviewDialog } from "./question-bank-question-preview-dialog";

type QuestionAccessStatus = "PENDING" | "APPROVED" | "REJECTED";

type QuestionBankDetailTableProps = {
  bankId: string;
  repositoryKind: "MINE" | "UNIFIED";
  subject: string;
  editable: boolean;
  loading: boolean;
  errorMessage: string | null;
  rows: QuestionBankQuestionRow[];
  ownedBankOptions?: Array<{ id: string; label: string }>;
  requestStatusByQuestionId?: Record<string, QuestionAccessStatus | undefined>;
  requestingQuestionId?: string | null;
  forkingQuestionId?: string | null;
  onRequestAccess?: (questionId: string) => Promise<void> | void;
  onForkQuestion?: (questionId: string, targetBankId: string) => Promise<void> | void;
};

export function QuestionBankDetailTable({
  bankId,
  repositoryKind,
  subject,
  editable,
  loading,
  errorMessage,
  rows,
  ownedBankOptions = [],
  requestStatusByQuestionId = {},
  requestingQuestionId = null,
  forkingQuestionId = null,
  onRequestAccess,
  onForkQuestion,
}: QuestionBankDetailTableProps) {
  const [menuRowId, setMenuRowId] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<QuestionBankQuestionRow | null>(
    null,
  );
  const [editingRow, setEditingRow] = useState<QuestionBankQuestionRow | null>(null);
  const [generatingRowId, setGeneratingRowId] = useState<string | null>(null);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [deleteQuestion] = useMutation(DeleteQuestionMutationDocument);
  const [createQuestionVariants] = useMutation(CreateQuestionVariantsMutationDocument);
  const [groupQuestionsAsVariants] = useMutation(GroupQuestionsAsVariantsMutationDocument);

  const handleDelete = async (row: QuestionBankQuestionRow) => {
    try {
      const accepted = window.confirm("Энэ асуултыг устгах уу?");
      if (!accepted) {
        return;
      }
      await deleteQuestion({
        variables: { id: row.id },
        refetchQueries: [{ query: QuestionBankDetailQueryDocument, variables: { id: bankId } }],
        awaitRefetchQueries: true,
      });
      setMenuRowId(null);
      if (selectedRow?.id === row.id) {
        setSelectedRow(null);
      }
    } catch (error) {
      console.error("Failed to delete question", error);
    }
  };

  const handleCreateVariants = async (row: QuestionBankQuestionRow) => {
    try {
      const accepted = window.confirm(
        "Энэ асуултаас 4 хувилбарын draft үүсгэх үү? Эхний асуулт нь A хувилбар болж, үлдсэн 3 нь шинэ draft байдлаар нэмэгдэнэ.",
      );
      if (!accepted) {
        return;
      }

      setGeneratingRowId(row.id);
      await createQuestionVariants({
        variables: {
          sourceQuestionId: row.id,
          totalVariants: 4,
        },
        refetchQueries: [{ query: QuestionBankDetailQueryDocument, variables: { id: bankId } }],
        awaitRefetchQueries: true,
      });
      setMenuRowId(null);
      window.alert("4 хувилбарын draft амжилттай үүслээ.");
    } catch (error) {
      console.error("Failed to create question variants", error);
      window.alert("Хувилбарын draft үүсгэх үед алдаа гарлаа.");
    } finally {
      setGeneratingRowId(null);
    }
  };

  const handleToggleSelectedQuestion = (questionId: string) => {
    setSelectedQuestionIds((current) =>
      current.includes(questionId)
        ? current.filter((item) => item !== questionId)
        : [...current, questionId],
    );
  };

  const handleGroupSelectedQuestions = async () => {
    try {
      const accepted = window.confirm(
        "Сонгосон асуултуудыг хувилбарын нэг бүлэг болгох уу? Эдгээрт A, B, C, D тэмдэглэгээ автоматаар өгөгдөнө.",
      );
      if (!accepted) {
        return;
      }

      await groupQuestionsAsVariants({
        variables: { questionIds: selectedQuestionIds },
        refetchQueries: [{ query: QuestionBankDetailQueryDocument, variables: { id: bankId } }],
        awaitRefetchQueries: true,
      });

      setSelectedQuestionIds([]);
      window.alert("Хувилбарын бүлэг амжилттай үүслээ.");
    } catch (error) {
      console.error("Failed to group questions as variants", error);
      window.alert("Хувилбарын бүлэг үүсгэх үед алдаа гарлаа.");
    }
  };

  const formatPreviewText = (text: string) =>
    text.length > 78 ? `${text.slice(0, 75)}...` : text;

  const canGenerateVariants = (row: QuestionBankQuestionRow) =>
    row.rawType !== "ESSAY" &&
    row.rawType !== "IMAGE_UPLOAD" &&
    row.variantLabel === null;
  const selectedRows = rows.filter((row) => selectedQuestionIds.includes(row.id));
  const selectedTypes = new Set(selectedRows.map((row) => row.rawType));
  const canGroupSelectedQuestions =
    editable &&
    (selectedQuestionIds.length === 2 || selectedQuestionIds.length === 4) &&
    selectedTypes.size <= 1;

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-[#DFE1E5] bg-white shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
        {editable ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DFE1E5] bg-[#F8FAFC] px-4 py-3">
            <div className="space-y-1">
              <p className="text-[13px] font-medium text-[#0F1216]">
                {selectedQuestionIds.length
                  ? `${selectedQuestionIds.length} асуулт сонгогдсон`
                  : "2 эсвэл 4 асуулт сонгоод хувилбарын бүлэг үүсгэнэ"}
              </p>
              <p className="text-[12px] text-[#52555B]">
                Ижил төрлийн асуултуудыг сонгоод нэг variant group болгон холбоно.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedQuestionIds.length ? (
                <button
                  type="button"
                  className="rounded-md px-3 py-2 text-[13px] font-medium text-[#52555B] hover:bg-[#EEF2F6]"
                  onClick={() => setSelectedQuestionIds([])}
                >
                  Цэвэрлэх
                </button>
              ) : null}
              <button
                type="button"
                className="rounded-md bg-[#6434F8] px-3 py-2 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#D0D5DD]"
                disabled={!canGroupSelectedQuestions}
                onClick={() => void handleGroupSelectedQuestions()}
              >
                Хувилбарын бүлэг болгох
              </button>
            </div>
          </div>
        ) : null}
        {errorMessage ? <p className="p-5 text-[14px] text-[#B42318]">{errorMessage}</p> : null}
        {loading ? (
          <div className="animate-pulse p-4">
            <div className="grid grid-cols-[minmax(0,1fr)_170px_120px_90px_120px_80px] gap-4 border-b border-[#DFE1E5] pb-3">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="h-5 rounded bg-[#E9EDF3]" />
              ))}
            </div>
            <div className="space-y-4 py-4">
              {Array.from({ length: 5 }, (_, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid grid-cols-[minmax(0,1fr)_170px_120px_90px_120px_80px] items-center gap-4"
                >
                  <div className="h-5 rounded bg-[#E9EDF3]" />
                  <div className="h-8 rounded bg-[#E9EDF3]" />
                  <div className="h-8 rounded bg-[#E9EDF3]" />
                  <div className="h-5 rounded bg-[#E9EDF3]" />
                  <div className="h-5 rounded bg-[#E9EDF3]" />
                  <div className="ml-auto h-8 w-8 rounded bg-[#E9EDF3]" />
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {!loading && !errorMessage ? (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-left">
              <colgroup>
                <col className="w-[4%]" />
                <col className="w-[47%]" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
                <col className="w-[9%]" />
                <col className="w-[10%]" />
                <col className="w-[4%]" />
              </colgroup>
              <thead className="border-b border-[#DFE1E5] text-[14px] font-medium text-[#0F1216]">
                <tr>
                  <th className="px-4 py-3 text-center">
                    {editable ? (
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border border-[#D0D5DD]"
                        checked={rows.length > 0 && selectedQuestionIds.length === rows.length}
                        onChange={(event) =>
                          setSelectedQuestionIds(event.target.checked ? rows.map((row) => row.id) : [])
                        }
                      />
                    ) : null}
                  </th>
                  <th className="px-4 py-3">Асуулт</th>
                  <th className="px-4 py-3 whitespace-nowrap">Төрөл</th>
                  <th className="px-4 py-3 whitespace-nowrap">Түвшин</th>
                  <th className="px-4 py-3 text-center">Ашигласан</th>
                  <th className="px-4 py-3 whitespace-nowrap">Дундаж оноо</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-[#DFE1E5] last:border-b-0">
                    <td className="px-4 py-4 text-center">
                      {editable ? (
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border border-[#D0D5DD]"
                          checked={selectedQuestionIds.includes(row.id)}
                          onChange={() => handleToggleSelectedQuestion(row.id)}
                        />
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-[14px] text-[#0F1216]">
                      <div className="space-y-2">
                        <button
                          type="button"
                          className="cursor-pointer text-left transition hover:text-[#6434F8] hover:underline hover:underline-offset-4"
                          title="Дарж дэлгэрэнгүй харах"
                          onClick={() => setSelectedRow(row)}
                        >
                          {formatPreviewText(row.text)}
                        </button>
                        {row.variantLabel ? (
                          <div className="flex flex-wrap items-center gap-2 text-[12px]">
                            <span className="inline-flex rounded-md border border-[#D6BBFB] bg-[#F4EBFF] px-2 py-1 font-medium text-[#6434F8]">
                              {`${row.variantLabel} хувилбар`}
                            </span>
                            {row.variantCount ? (
                              <span className="text-[#667085]">
                                {`Нийт ${row.variantCount} хувилбар`}
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                        {!editable && row.requiresAccessRequest ? (
                          <div className="flex flex-wrap items-center gap-2 text-[12px]">
                            <span className="inline-flex rounded-md border border-[#FECACA] bg-[#FEF2F2] px-2 py-1 font-medium text-[#B42318]">
                              Зөвшөөрөл шаардлагатай
                            </span>
                            {requestStatusByQuestionId[row.id] ? (
                              <span className="text-[#667085]">
                                {requestStatusByQuestionId[row.id] === "PENDING"
                                  ? "Хүсэлт илгээсэн"
                                  : requestStatusByQuestionId[row.id] === "APPROVED"
                                    ? "Зөвшөөрөгдсөн"
                                    : "Татгалзсан"}
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex whitespace-nowrap rounded-md border border-[#DFE1E5] px-2.5 py-1 text-[12px] font-medium text-[#0F1216]">
                        {row.type}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-md border px-2.5 py-1 text-[12px] font-medium ${row.difficultyTone}`}
                      >
                        {row.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-[14px] text-[#52555B]">{row.usedCount}</td>
                    <td className="px-4 py-4 text-[14px] text-[#0F1216]">{row.averageScore}</td>
                    <td className="relative px-4 py-4 text-right">
                      {editable ? (
                        <>
                          <button type="button" className="cursor-pointer rounded-md p-2 text-[#0F1216] hover:bg-[#F6F9FC]" onClick={() => setMenuRowId((current) => current === row.id ? null : row.id)}><DotsIcon className="h-4 w-4" /></button>
                          {menuRowId === row.id ? (
                            <div className="absolute right-4 top-12 z-10 min-w-28 rounded-lg border border-[#DFE1E5] bg-white p-1 text-left shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
                              <button type="button" className="block w-full cursor-pointer rounded-md px-3 py-2 text-[14px] text-[#0F1216] hover:bg-[#F6F9FC]" onClick={() => { setEditingRow(row); setMenuRowId(null); }}>Засах</button>
                              {canGenerateVariants(row) ? (
                                <button
                                  type="button"
                                  className="block w-full cursor-pointer rounded-md px-3 py-2 text-[14px] text-[#0F1216] hover:bg-[#F6F9FC]"
                                  onClick={() => void handleCreateVariants(row)}
                                  disabled={generatingRowId === row.id}
                                >
                                  {generatingRowId === row.id
                                    ? "Үүсгэж байна..."
                                    : "4 хувилбар үүсгэх"}
                                </button>
                              ) : null}
                              <button type="button" className="block w-full cursor-pointer rounded-md px-3 py-2 text-[14px] text-[#B42318] hover:bg-[#FEF3F2]" onClick={() => void handleDelete(row)}>Устгах</button>
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <span className="text-[12px] font-medium text-[#98A2B3]">Read only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length ? <p className="p-5 text-[14px] text-[#52555B]">Шүүлтүүрт тохирох асуулт алга.</p> : null}
          </div>
        ) : null}
      </div>
      <QuestionBankQuestionPreviewDialog
        row={selectedRow}
        editable={editable}
        ownedBankOptions={ownedBankOptions}
        requestStatus={selectedRow ? requestStatusByQuestionId[selectedRow.id] : undefined}
        isRequesting={selectedRow ? requestingQuestionId === selectedRow.id : false}
        isForking={selectedRow ? forkingQuestionId === selectedRow.id : false}
        onRequestAccess={onRequestAccess}
        onForkQuestion={onForkQuestion}
        onClose={() => setSelectedRow(null)}
      />
      {editingRow ? (
        <QuestionBankAddQuestionDialog
          key={`edit-${editingRow.id}`}
          bankId={bankId}
          repositoryKind={repositoryKind}
          open
          subject={subject}
          initialQuestion={editingRow}
          onClose={() => setEditingRow(null)}
        />
      ) : null}
    </>
  );
}
