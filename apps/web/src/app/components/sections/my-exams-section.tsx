"use client";

import { useState } from "react";
import {
  CalendarIcon,
  ChartIcon,
  CheckCircleIcon,
  CheckIcon,
  ClipboardIcon,
  ClockIcon,
  DotsIcon,
  EyeIcon,
  PlusIcon,
  SearchIcon,
  UsersIcon,
  CloseIcon,
  ChevronDownIcon,
} from "../icons";
import { ExamPreviewDialog } from "./exam-preview-dialog";
import { ExamResultsDialog } from "./exam-results-dialog";

const baseCard =
  "rounded-xl border border-[#DFE1E5] bg-white p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]";

const actionButton =
  "inline-flex items-center gap-2 rounded-md border border-[#DFE1E5] bg-[#FAFAFA] px-3 py-1.5 text-[14px] font-medium text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]";

export function MyExamsSection() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-[#0F1216]">
            Миний шалгалтууд
          </h1>
          <p className="mt-1 text-[14px] text-[#52555B]">
            Шалгалтуудаа харах, удирдах
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-[#00267F] px-4 py-2 text-[14px] font-medium text-white">
          <PlusIcon className="h-4 w-4" />
          Шинэ шалгалт
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative block flex-1">
          <span className="sr-only">Шалгалт хайх</span>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#52555B]">
            <SearchIcon className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Шалгалт хайх..."
            className="h-9 w-full rounded-md border border-[#DFE1E5] bg-white px-9 text-[14px] text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] placeholder:text-[#52555B]"
          />
        </label>
        <button
          className={[
            "inline-flex h-9 w-full items-center justify-between gap-2",
            "rounded-md border border-[#DFE1E5] bg-white px-3 text-[14px]",
            "text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]",
            "sm:w-[140px]",
          ].join(" ")}
        >
          Бүх төлөв
          <ChevronDownIcon className="h-4 w-4 text-[#52555B]" />
        </button>
      </div>

      <div className="space-y-4">
        <article className={`${baseCard} ring-2 ring-[#3B82F6]`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[16px] font-medium text-[#0F1216]">
                  Математикийн эцсийн шалгалт
                </h3>
                <span className="rounded-md border border-[#31AA4033] bg-[#31AA401A] px-2 py-[2px] text-[12px] font-medium text-[#31AA40]">
                  Явагдаж буй
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#52555B]">
                <span className="flex items-center gap-2">
                  <ClipboardIcon className="h-3.5 w-3.5" />
                  4 асуулт
                </span>
                <span className="flex items-center gap-2">
                  <ClockIcon className="h-3.5 w-3.5" />
                  120 минут
                </span>
                <span>Математик</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={actionButton}
                onClick={() => {
                  setIsResultsOpen(false);
                  setIsPreviewOpen(true);
                }}
                type="button"
              >
                <EyeIcon className="h-4 w-4" />
                Харах
              </button>
              <button
                className={actionButton}
                onClick={() => {
                  setIsPreviewOpen(false);
                  setIsResultsOpen(true);
                }}
                type="button"
              >
                <ChartIcon className="h-4 w-4" />
                Үр дүн
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-md text-[#0F1216] hover:bg-[#F0F2F5]">
                <DotsIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 border-t border-[#DFE1E5] pt-4">
            <div className="flex flex-wrap items-center gap-6 text-[14px] text-[#52555B]">
              <span className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4" />
                <span className="font-medium text-[#0F1216]">28</span> сурагч
              </span>
              <span className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4" />
                <span className="font-medium text-[#0F1216]">22</span> илгээсэн
              </span>
            </div>
          </div>
        </article>

        <article className={baseCard}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[16px] font-medium text-[#0F1216]">
                  Физикийн улирлын шалгалт
                </h3>
                <span className="rounded-md border border-[#19223033] bg-[#1922301A] px-2 py-[2px] text-[12px] font-medium text-[#192230]">
                  Дууссан
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#52555B]">
                <span className="flex items-center gap-2">
                  <ClipboardIcon className="h-3.5 w-3.5" />
                  4 асуулт
                </span>
                <span className="flex items-center gap-2">
                  <ClockIcon className="h-3.5 w-3.5" />
                  90 минут
                </span>
                <span>Физик</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={actionButton}
                onClick={() => {
                  setIsResultsOpen(false);
                  setIsPreviewOpen(true);
                }}
                type="button"
              >
                <EyeIcon className="h-4 w-4" />
                Харах
              </button>
              <button
                className={actionButton}
                onClick={() => {
                  setIsPreviewOpen(false);
                  setIsResultsOpen(true);
                }}
                type="button"
              >
                <ChartIcon className="h-4 w-4" />
                Үр дүн
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-md text-[#0F1216] hover:bg-[#F0F2F5]">
                <DotsIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 border-t border-[#DFE1E5] pt-4">
            <div className="flex flex-wrap items-center gap-6 text-[14px] text-[#52555B]">
              <span className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4" />
                <span className="font-medium text-[#0F1216]">24</span> сурагч
              </span>
              <span className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4" />
                <span className="font-medium text-[#0F1216]">24</span> илгээсэн
              </span>
              <div className="min-w-[220px] flex-1 space-y-2">
                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-[#52555B]">Тэнцсэн хувь</span>
                  <span className="font-medium text-[#0F1216]">85%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#19223033]">
                  <div className="h-2 w-[85%] rounded-full bg-[#192230]" />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-2 text-[#31AA40]">
                  <CheckIcon className="h-4 w-4" />
                  20 тэнцсэн
                </span>
                <span className="flex items-center gap-2 text-[#D40924]">
                  <CloseIcon className="h-4 w-4" />
                  4 унасан
                </span>
              </div>
              <span className="flex items-center gap-2 text-[#52555B]">
                <ChartIcon className="h-4 w-4" />
                Дундаж <span className="font-medium text-[#0F1216]">78%</span>
              </span>
            </div>
          </div>
        </article>

        <article className={baseCard}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[16px] font-medium text-[#0F1216]">
                  Химийн сорил
                </h3>
                <span className="rounded-md border border-[#DFE1E5] bg-[#F0F2F5] px-2 py-[2px] text-[12px] font-medium text-[#52555B]">
                  Архив
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#52555B]">
                <span className="flex items-center gap-2">
                  <ClipboardIcon className="h-3.5 w-3.5" />
                  4 асуулт
                </span>
                <span className="flex items-center gap-2">
                  <ClockIcon className="h-3.5 w-3.5" />
                  45 минут
                </span>
                <span>Хими</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={actionButton}
                onClick={() => {
                  setIsResultsOpen(false);
                  setIsPreviewOpen(true);
                }}
                type="button"
              >
                <EyeIcon className="h-4 w-4" />
                Харах
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-md text-[#0F1216] hover:bg-[#F0F2F5]">
                <DotsIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </article>

        <article className={baseCard}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[16px] font-medium text-[#0F1216]">
                  Биологийн шалгалт
                </h3>
                <span className="rounded-md border border-[#F63D6B33] bg-[#F63D6B1A] px-2 py-[2px] text-[12px] font-medium text-[#F63D6B]">
                  Товлогдсон
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#52555B]">
                <span className="flex items-center gap-2">
                  <ClipboardIcon className="h-3.5 w-3.5" />
                  2 асуулт
                </span>
                <span className="flex items-center gap-2">
                  <ClockIcon className="h-3.5 w-3.5" />
                  90 минут
                </span>
                <span>Биологи</span>
                <span className="flex items-center gap-2 text-[#F63D6B]">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  2 сар 20, 8:00 AM
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={actionButton}
                onClick={() => {
                  setIsResultsOpen(false);
                  setIsPreviewOpen(true);
                }}
                type="button"
              >
                <EyeIcon className="h-4 w-4" />
                Харах
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-md text-[#0F1216] hover:bg-[#F0F2F5]">
                <DotsIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </article>

        <article className={baseCard}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[16px] font-medium text-[#0F1216]">
                  Сонгон физикийн шалгалт
                </h3>
                <span className="rounded-md border border-[#31AA4033] bg-[#31AA401A] px-2 py-[2px] text-[12px] font-medium text-[#31AA40]">
                  Явагдаж буй
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#52555B]">
                <span className="flex items-center gap-2">
                  <ClipboardIcon className="h-3.5 w-3.5" />
                  4 асуулт
                </span>
                <span className="flex items-center gap-2">
                  <ClockIcon className="h-3.5 w-3.5" />
                  60 минут
                </span>
                <span>Физик</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={actionButton}
                onClick={() => {
                  setIsResultsOpen(false);
                  setIsPreviewOpen(true);
                }}
                type="button"
              >
                <EyeIcon className="h-4 w-4" />
                Харах
              </button>
              <button
                className={actionButton}
                onClick={() => {
                  setIsPreviewOpen(false);
                  setIsResultsOpen(true);
                }}
                type="button"
              >
                <ChartIcon className="h-4 w-4" />
                Үр дүн
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-md text-[#0F1216] hover:bg-[#F0F2F5]">
                <DotsIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 border-t border-[#DFE1E5] pt-4">
            <div className="flex flex-wrap items-center gap-6 text-[14px] text-[#52555B]">
              <span className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4" />
                <span className="font-medium text-[#0F1216]">24</span> сурагч
              </span>
              <span className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4" />
                <span className="font-medium text-[#0F1216]">15</span> илгээсэн
              </span>
            </div>
          </div>
        </article>
      </div>
      <ExamPreviewDialog
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
      <ExamResultsDialog
        open={isResultsOpen}
        onClose={() => setIsResultsOpen(false)}
      />
    </section>
  );
}
