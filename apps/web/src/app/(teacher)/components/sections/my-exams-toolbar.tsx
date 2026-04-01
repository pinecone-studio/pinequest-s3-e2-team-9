"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { PlusIcon } from "../icons";
import { ArrowDropDownIcon } from "../icons-addition";
import { PdfImportDialog } from "./pdf-import-dialog";

type MyExamsToolbarProps = {
  isLibraryMode: boolean;
  subjectFilter: string;
  subjectOptions: string[];
  levelFilter: string;
  levelOptions: string[];
  onSubjectChange: (value: string) => void;
  onLevelChange: (value: string) => void;
};

export function MyExamsToolbar({
  isLibraryMode,
  subjectFilter,
  subjectOptions,
  levelFilter,
  levelOptions,
  onSubjectChange,
  onLevelChange,
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
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <label className="relative inline-flex h-10 w-full items-center rounded-full bg-white px-3 shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)] sm:w-[134px]">
          <select
            value={subjectFilter}
            onChange={(event) => onSubjectChange(event.target.value)}
            className="h-full w-full cursor-pointer appearance-none bg-transparent pr-7 text-[14px] text-[#0F1216] outline-none"
          >
            {subjectOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ArrowDropDownIcon className="pointer-events-none absolute right-3 top-1/2 h-2 w-4 -translate-y-1/2 text-[#0F1216]" />
        </label>
        <label className="relative inline-flex h-10 w-full items-center rounded-full bg-white px-3 shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)] sm:w-[136px]">
          <select
            value={levelFilter}
            onChange={(event) => onLevelChange(event.target.value)}
            className="h-full w-full cursor-pointer appearance-none bg-transparent pr-7 text-[14px] text-[#0F1216] outline-none"
          >
            {levelOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ArrowDropDownIcon className="pointer-events-none absolute right-3 top-1/2 h-2 w-4 -translate-y-1/2 text-[#0F1216]" />
        </label>
      </div>

      {isLibraryMode ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
          <button
            type="button"
            onClick={() => pdfInputRef.current?.click()}
            className="inline-flex h-10 items-center justify-center rounded-[5px] border border-[#DDD6FE] bg-white px-5 text-[14px] font-semibold text-[#6434F8] shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)] transition hover:bg-[#F8F5FF]"
          >
            PDF upload
          </button>
          <Link
            href="/create-exam"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[5px] bg-[#6434F8] px-5 text-[14px] font-semibold text-white shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)] transition hover:bg-[#5628E8]"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[#6434F8]">
              <PlusIcon className="h-3 w-3" />
            </span>
            Шалгалт үүсгэх
          </Link>
        </div>
      ) : null}
      </div>
      <PdfImportDialog
        open={isImportDialogOpen}
        selectedFile={selectedPdf}
        onClose={closeImportDialog}
      />
    </>
  );
}
