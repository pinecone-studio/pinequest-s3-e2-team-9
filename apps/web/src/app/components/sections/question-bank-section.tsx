"use client";

import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { QuestionBanksQueryDocument } from "@/graphql/generated";
import { BookIcon, PlusIcon, SearchIcon } from "../icons";
import {
  formatQuestionBankDate,
  type QuestionBankItem,
} from "../question-bank-utils";

const QUESTION_BANK_SKELETONS = Array.from({ length: 6 }, (_, index) => index);

const mapQuestionBankItems = (
  banks: {
    id: string;
    title: string;
    description?: string | null;
    subject: string;
    questionCount: number;
    createdAt: string;
  }[],
): QuestionBankItem[] =>
  banks.map((bank) => ({
    id: bank.id,
    title: bank.title,
    description: bank.description ?? "Тайлбар оруулаагүй асуултын сан",
    subject: bank.subject,
    questions: `${bank.questionCount} асуулт`,
    date: formatQuestionBankDate(bank.createdAt),
  }));

export function QuestionBankSection() {
  const { data, loading, error } = useQuery(QuestionBanksQueryDocument, {
    fetchPolicy: "cache-and-network",
  });

  let items: QuestionBankItem[] = [];
  let errorMessage: string | null = null;

  try {
    items = mapQuestionBankItems(data?.questionBanks ?? []);
  } catch (mappingError) {
    console.error("Failed to map question banks", mappingError);
    errorMessage = "Асуултын сангийн өгөгдлийг боловсруулахад алдаа гарлаа.";
  }

  if (error) {
    errorMessage = "GraphQL холбоход алдаа гарлаа. Backend-ээ шалгаад дахин оролдоно уу.";
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-[#0F1216]">
            Асуултын сан
          </h1>
          <p className="mt-1 text-[14px] text-[#52555B]">
            Асуултуудыг зохион байгуулж, олон шалгалтад дахин ашиглах
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-[#00267F] px-4 py-2 text-[14px] font-medium text-white">
          <PlusIcon className="h-4 w-4" />
          Сан үүсгэх
        </button>
      </div>

      <label className="relative block max-w-[384px]">
        <span className="sr-only">Асуултын сан хайх</span>
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#52555B]">
          <SearchIcon className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="Асуултын сан хайх..."
          className="h-9 w-full rounded-md border border-[#DFE1E5] bg-white px-9 text-[14px] text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] placeholder:text-[#52555B]"
        />
      </label>

      {errorMessage ? <p className="text-[14px] text-[#B42318]">{errorMessage}</p> : null}

      {!loading && !errorMessage && !items.length ? (
        <p className="text-[14px] text-[#52555B]">
          Асуултын сан алга. Backend seed эсвэл sync-ээ шалгана уу.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? QUESTION_BANK_SKELETONS.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-[#DFE1E5] bg-white p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
              >
                <div className="animate-pulse">
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-lg bg-[#E9EDF3]" />
                    <div className="h-7 w-20 rounded-md bg-[#E9EDF3]" />
                  </div>
                  <div className="mt-4 h-5 w-2/3 rounded bg-[#E9EDF3]" />
                  <div className="mt-2 h-4 w-full rounded bg-[#E9EDF3]" />
                  <div className="mt-2 h-4 w-5/6 rounded bg-[#E9EDF3]" />
                  <div className="mt-4 flex items-center justify-between">
                    <div className="h-4 w-20 rounded bg-[#E9EDF3]" />
                    <div className="h-4 w-24 rounded bg-[#E9EDF3]" />
                  </div>
                </div>
              </div>
            ))
          : null}
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/question-bank/${item.id}`}
            className="relative block cursor-pointer rounded-xl border border-[#DFE1E5] bg-white p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] transition hover:-translate-y-0.5 hover:shadow-[0px_8px_24px_rgba(15,18,22,0.08)]"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1922301A] text-[#192230]">
                <BookIcon className="h-5 w-5" />
              </div>
              <span className="rounded-md bg-[#F63D6B] px-2.5 py-1 text-[12px] font-medium text-white">
                {item.subject}
              </span>
            </div>
            <h3 className="mt-4 text-[16px] font-medium text-[#0F1216]">
              {item.title}
            </h3>
            <p className="mt-1 text-[14px] text-[#52555B]">
              {item.description}
            </p>
            <div className="mt-4 flex items-center justify-between text-[14px] text-[#52555B]">
              <span>{item.questions}</span>
              <span>{item.date}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
