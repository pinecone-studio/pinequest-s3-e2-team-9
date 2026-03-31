"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { DownPressIcon } from "../icons-ic";
import { TopSearchBar } from "../top-search-bar";
import { PdfImportDialog } from "./pdf-import-dialog";

type MyExamsToolbarProps = {
  isLibraryMode: boolean;
  search: string;
  status: string;
  statusOptions: string[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
};

export function MyExamsToolbar({
  isLibraryMode,
  search,
  status,
  statusOptions,
  onSearchChange,
  onStatusChange,
}: MyExamsToolbarProps) {
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const closeImportDialog = () => {
    setIsImportDialogOpen(false);
    setSelectedPdf(null);
  };

  return (
    <>
      <TopSearchBar
        searchPlaceholder="Шалгалт хайх"
        searchValue={search}
        onSearchChange={onSearchChange}
        centered
        filters={
          <label className="relative inline-flex h-[36px] w-[140px] items-center rounded-[20px] border border-[#EAECF0] bg-white px-[12px] text-[14px] font-normal leading-5 text-[#0F1216] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
            <select
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
              className="h-full w-full cursor-pointer appearance-none bg-transparent pr-6 outline-none"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <DownPressIcon className="pointer-events-none absolute right-3 h-4 w-4" />
          </label>
        }
        actions={
          isLibraryMode ? (
            <>
              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(event) => {
                  const nextFile = event.target.files?.[0] ?? null;
                  setSelectedPdf(nextFile);
                  setIsImportDialogOpen(Boolean(nextFile));
                  event.currentTarget.value = "";
                }}
              />
              <Link
                href="/create-exam"
                className="inline-flex h-[36px] w-[158px] items-center justify-center gap-4 rounded-[20px] bg-[#16A34A] px-[12px] text-[14px] font-medium leading-5 text-white shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] transition hover:bg-[#15803D]"
              >
                + Шинэ шалгалт
              </Link>
            </>
          ) : null
        }
      />
      <PdfImportDialog
        open={isImportDialogOpen}
        selectedFile={selectedPdf}
        onClose={closeImportDialog}
      />
    </>
  );
}
