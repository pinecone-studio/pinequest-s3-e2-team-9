/* eslint-disable max-lines */
"use client";

import { useMemo, useState } from "react";
import { useQuestionBanksQueryQuery } from "@/graphql/generated";
import { useLiveQuestionBankEvents } from "@/lib/use-live-question-bank-events";
import { PlusIcon, SearchIcon } from "../icons";
import { DownPressIcon } from "../icons-ic";
import { TopSearchBar } from "../top-search-bar";
import {
  formatQuestionBankDate,
  type QuestionBankItem,
} from "../question-bank-utils";
import { QuestionBankCreateDialog } from "./question-bank-create-dialog";
import {
  QuestionBankCardGrid,
  QuestionBankEmptyState,
} from "./question-bank-section-ui";

const QUESTION_BANK_SKELETONS = Array.from({ length: 6 }, (_, index) => index);

const mapQuestionBankItems = (
  banks: {
    id: string;
    title: string;
    description?: string | null;
    grade: number;
    subject: string;
    topic: string;
    topics: string[];
    visibility: "PRIVATE" | "PUBLIC";
    questionCount: number;
    createdAt: string;
    owner: {
      id: string;
      fullName: string;
    };
  }[],
): QuestionBankItem[] =>
  banks.map((bank) => ({
    id: bank.id,
    title: bank.title,
    displayTitle:
      bank.topic !== "Ерөнхий" ? bank.topic : (bank.topics[0] ?? bank.title),
    description: bank.description ?? "Тайлбар оруулаагүй асуултын сан",
    grade: bank.grade,
    subject: bank.subject,
    topic: bank.topic,
    categoryLabel: `${bank.grade}-р анги ${bank.subject}`,
    topics: bank.topics,
    subtopics: bank.topic !== "Ерөнхий" ? [bank.topic] : bank.topics,
    visibility: bank.visibility,
    ownerId: bank.owner.id,
    ownerName: bank.owner.fullName,
    questions: `${bank.questionCount} асуулт`,
    date: formatQuestionBankDate(bank.createdAt),
  }));

type LibraryTab = "public" | "mine";

export function QuestionBankSection() {
  const [activeTab] = useState<LibraryTab>("public");
  const [search, setSearch] = useState("");
  const [topSearch, setTopSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const { data, loading, error, refetch } = useQuestionBanksQueryQuery({
    fetchPolicy: "cache-and-network",
  });
  useLiveQuestionBankEvents({
    teacherId: data?.me?.id ?? null,
    includePublic: true,
    enabled: Boolean(data?.me),
    onEvent: () => {
      void refetch();
    },
  });

  const viewerId = data?.me?.id ?? null;
  const itemsState = useMemo(() => {
    try {
      return {
        items: mapQuestionBankItems(data?.questionBanks ?? []),
        errorMessage: error
          ? "Асуултын сангийн мэдээллийг ачаалахад алдаа гарлаа. Дахин оролдоно уу."
          : null,
      };
    } catch (mappingError) {
      console.error("Failed to map question banks", mappingError);
      return {
        items: [] as QuestionBankItem[],
        errorMessage: "Асуултын сангийн өгөгдлийг боловсруулахад алдаа гарлаа.",
      };
    }
  }, [data?.questionBanks, error]);

  const scopedItems = useMemo(() => {
    if (!viewerId) {
      return itemsState.items.filter((item) => item.visibility === "PUBLIC");
    }

    return itemsState.items.filter((item) =>
      activeTab === "public"
        ? item.visibility === "PUBLIC"
        : item.ownerId === viewerId,
    );
  }, [activeTab, itemsState.items, viewerId]);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return scopedItems.filter((item) => {
      const matchesSearch =
        !keyword ||
        `${item.title} ${item.description} ${item.subject} ${item.topics.join(" ")} ${item.ownerName}`
          .toLowerCase()
          .includes(keyword);
      return matchesSearch;
    });
  }, [scopedItems, search]);

  return (
    <>
      <section className="mx-auto flex min-h-[900px] w-full max-w-[1184px] flex-col">
        <div className="flex h-[90px] w-full items-center px-[32px] py-[24px]">
          <TopSearchBar
            searchPlaceholder="Шалгалт хайх"
            searchValue={topSearch}
            onSearchChange={setTopSearch}
            leftWidthClassName="w-[608px]"
            centered
            filters={
              <button
                type="button"
                className="flex h-[36px] w-[140px] items-center justify-between rounded-[20px] border border-transparent bg-white px-3 text-[14px] font-normal text-[#0F1216] shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)]"
              >
                <span className="flex w-[70px] justify-center whitespace-nowrap">
                  Бүх төлөв
                </span>
                <DownPressIcon className="h-4 w-4" />
              </button>
            }
          />
        </div>
        <div className="flex w-full flex-col gap-6 px-[60px] py-[54px]">
          <div className="flex w-full items-center justify-between">
            <div>
              <h1 className="text-[24px] font-semibold leading-8 text-[#0F1216]">
                Асуултын сан
              </h1>
              <p className="mt-1 text-[14px] leading-5 text-[#52555B]">
                Асуултуудыг зохион байгуулж, олон шалгалтад дахин ашиглах
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex h-[36px] items-center gap-2 rounded-[6px] bg-[#6F90FF] px-[12px] text-[14px] font-medium text-white"
            >
              <PlusIcon className="h-4 w-4" />
              Сан үүсгэх
            </button>
          </div>

          <label className="relative w-[384px]">
            <span className="sr-only">Асуултын сан хайх</span>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52555B]" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Асуултын сан хайх..."
              className="h-[36px] w-full rounded-[6px] border border-[#DFE1E5] bg-white px-[12px] pl-[36px] text-[14px] leading-[18px] text-[#52555B] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] placeholder:text-[#52555B] focus:outline-none focus:ring-1 focus:ring-[#D8E4FF]"
            />
          </label>

          {itemsState.errorMessage ? (
            <p className="text-[14px] text-[#B42318]">
              {itemsState.errorMessage}
            </p>
          ) : null}

          {!loading && !itemsState.errorMessage && !filteredItems.length ? (
            <QuestionBankEmptyState
              grade=""
              subject=""
              topic=""
              selectedPathLabel="Анги / Хичээл / Бүх дэд сэдэв"
              onCreate={() => setCreateOpen(true)}
            />
          ) : null}

          <QuestionBankCardGrid
            items={filteredItems}
            loading={loading}
            skeletons={QUESTION_BANK_SKELETONS}
          />
        </div>
      </section>

      {createOpen ? (
        <QuestionBankCreateDialog
          key={`question-bank-create-${activeTab}`}
          initialGrade={null}
          initialSubject={null}
          initialTopic={null}
          onClose={() => setCreateOpen(false)}
        />
      ) : null}
    </>
  );
}
