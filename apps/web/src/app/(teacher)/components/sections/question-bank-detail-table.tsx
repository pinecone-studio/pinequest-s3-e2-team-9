"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
  DeleteQuestionMutationDocument,
  QuestionBankDetailQueryDocument,
} from "@/graphql/generated";
import type { QuestionBankQuestionRow } from "../question-bank-utils";
import { DotsIcon } from "../icons";
import { QuestionBankAddQuestionDialog } from "./question-bank-add-question-dialog";
import { QuestionBankQuestionPreviewDialog } from "./question-bank-question-preview-dialog";

type QuestionBankDetailTableProps = {
  bankId: string;
  subject: string;
  loading: boolean;
  errorMessage: string | null;
  rows: QuestionBankQuestionRow[];
};

export function QuestionBankDetailTable({
  bankId,
  subject,
  loading,
  errorMessage,
  rows,
}: QuestionBankDetailTableProps) {
  const [menuRowId, setMenuRowId] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<QuestionBankQuestionRow | null>(
    null,
  );
  const [editingRow, setEditingRow] = useState<QuestionBankQuestionRow | null>(null);
  const [deleteQuestion] = useMutation(DeleteQuestionMutationDocument);

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

  const formatPreviewText = (text: string) =>
    text.length > 78 ? `${text.slice(0, 75)}...` : text;

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-[#DFE1E5] bg-white shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
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
                <col className="w-[47%]" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
                <col className="w-[9%]" />
                <col className="w-[10%]" />
                <col className="w-[4%]" />
              </colgroup>
              <thead className="border-b border-[#DFE1E5] text-[14px] font-medium text-[#0F1216]">
                <tr>
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
                    <td className="px-4 py-4 text-[14px] text-[#0F1216]">
                      <button
                        type="button"
                        className="cursor-pointer text-left transition hover:text-[#00267F] hover:underline hover:underline-offset-4"
                        title="Дарж дэлгэрэнгүй харах"
                        onClick={() => setSelectedRow(row)}
                      >
                        {formatPreviewText(row.text)}
                      </button>
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
                      <button type="button" className="cursor-pointer rounded-md p-2 text-[#0F1216] hover:bg-[#F6F9FC]" onClick={() => setMenuRowId((current) => current === row.id ? null : row.id)}><DotsIcon className="h-4 w-4" /></button>
                      {menuRowId === row.id ? (
                        <div className="absolute right-4 top-12 z-10 min-w-28 rounded-lg border border-[#DFE1E5] bg-white p-1 text-left shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
                          <button type="button" className="block w-full cursor-pointer rounded-md px-3 py-2 text-[14px] text-[#0F1216] hover:bg-[#F6F9FC]" onClick={() => { setEditingRow(row); setMenuRowId(null); }}>Засах</button>
                          <button type="button" className="block w-full cursor-pointer rounded-md px-3 py-2 text-[14px] text-[#B42318] hover:bg-[#FEF3F2]" onClick={() => void handleDelete(row)}>Устгах</button>
                        </div>
                      ) : null}
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
        onClose={() => setSelectedRow(null)}
      />
      {editingRow ? (
        <QuestionBankAddQuestionDialog
          key={`edit-${editingRow.id}`}
          bankId={bankId}
          open
          subject={subject}
          initialQuestion={editingRow}
          onClose={() => setEditingRow(null)}
        />
      ) : null}
    </>
  );
}
