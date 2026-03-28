/* eslint-disable max-lines */
"use client";

import { useMemo, useState } from "react";
import { useQuestionBanksQueryQuery } from "@/graphql/generated";
import { PlusIcon } from "../icons";
import {
  getCurriculumGrades,
  getCurriculumSubjects,
  getCurriculumTopics,
} from "../question-bank-curriculum";
import {
  formatQuestionBankDate,
  type QuestionBankItem,
} from "../question-bank-utils";
import { QuestionBankCreateDialog } from "./question-bank-create-dialog";
import {
  QuestionBankEmptyState,
  QuestionBankFilterPanel,
  QuestionBankGrid,
  QuestionBankTabButton,
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
    description: bank.description ?? "Тайлбар оруулаагүй асуултын сан",
    grade: bank.grade,
    subject: bank.subject,
    topic: bank.topic,
    topics: bank.topics,
    visibility: bank.visibility,
    ownerId: bank.owner.id,
    ownerName: bank.owner.fullName,
    questions: `${bank.questionCount} асуулт`,
    date: formatQuestionBankDate(bank.createdAt),
  }));

type LibraryTab = "public" | "mine";

export function QuestionBankSection() {
  const [activeTab, setActiveTab] = useState<LibraryTab>("public");
  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const { data, loading, error } = useQuestionBanksQueryQuery({
    fetchPolicy: "cache-and-network",
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

  const gradeOptions = useMemo(
    () =>
      [...new Set([...getCurriculumGrades(), ...scopedItems.map((item) => item.grade)])]
        .sort((left, right) => left - right)
        .map((value) => String(value)),
    [scopedItems],
  );

  const subjectOptions = useMemo(() => {
    if (!grade) {
      return [];
    }

    const numericGrade = Number(grade);
    const fromCurriculum = getCurriculumSubjects(numericGrade).map((entry) => entry.name);
    const fromBanks = scopedItems
      .filter((item) => item.grade === numericGrade)
      .map((item) => item.subject);

    return [...new Set([...fromCurriculum, ...fromBanks])];
  }, [grade, scopedItems]);

  const topicOptions = useMemo(() => {
    if (!grade || !subject) {
      return [];
    }

    const numericGrade = Number(grade);
    const fromCurriculum = getCurriculumTopics(numericGrade, subject);
    const fromBanks = scopedItems
      .filter((item) => item.grade === numericGrade && item.subject === subject)
      .flatMap((item) => (item.topic !== "Ерөнхий" ? [item.topic] : item.topics));

    return [...new Set([...fromCurriculum, ...fromBanks])];
  }, [grade, scopedItems, subject]);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return scopedItems.filter((item) => {
      const topicValues = item.topic !== "Ерөнхий" ? [item.topic] : item.topics;
      const matchesSearch =
        !keyword ||
        `${item.title} ${item.description} ${item.subject} ${topicValues.join(" ")} ${item.ownerName}`
          .toLowerCase()
          .includes(keyword);
      const matchesGrade = !grade || item.grade === Number(grade);
      const matchesSubject = !subject || item.subject === subject;
      const matchesTopic = !topic || topicValues.includes(topic);

      return matchesSearch && matchesGrade && matchesSubject && matchesTopic;
    });
  }, [grade, scopedItems, search, subject, topic]);

  const selectedPathLabel = useMemo(() => {
    const path = [
      grade ? `${grade}-р анги` : "Анги",
      subject || "Хичээл",
      topic || "Дэд сэдэв",
    ];

    return path.join(" / ");
  }, [grade, subject, topic]);

  return (
    <>
      <section className="mx-auto w-full max-w-[1120px] space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-[24px] font-semibold text-[#0F1216]">
              Асуултын сан
            </h1>
            <p className="mt-1 text-[14px] text-[#52555B]">
              Эхлээд анги, дараа нь хичээл, дараа нь дэд сэдвээ сонгоод тухайн сэдвийн банкууд дээр ажиллана.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-[#00267F] px-4 py-2 text-[14px] font-medium text-white"
          >
            <PlusIcon className="h-4 w-4" />
            Сан үүсгэх
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <QuestionBankTabButton
            active={activeTab === "public"}
            label="Нэгдсэн сан"
            onClick={() => setActiveTab("public")}
          />
          <QuestionBankTabButton
            active={activeTab === "mine"}
            label="Миний сан"
            onClick={() => setActiveTab("mine")}
          />
        </div>

        <QuestionBankFilterPanel
          gradeOptions={gradeOptions}
          grade={grade}
          subjectOptions={subjectOptions}
          subject={subject}
          topicOptions={topicOptions}
          topic={topic}
          search={search}
          selectedPathLabel={selectedPathLabel}
          onGradeChange={(value) => {
            const nextGrade = value.replace("-р анги", "").trim();
            setGrade(nextGrade);
            setSubject("");
            setTopic("");
          }}
          onSubjectChange={(value) => {
            setSubject(value);
            setTopic("");
          }}
          onTopicChange={setTopic}
          onSearchChange={setSearch}
        />

        {itemsState.errorMessage ? (
          <p className="text-[14px] text-[#B42318]">{itemsState.errorMessage}</p>
        ) : null}

        {!loading && !itemsState.errorMessage && !filteredItems.length ? (
          <QuestionBankEmptyState
            grade={grade}
            subject={subject}
            topic={topic}
            selectedPathLabel={selectedPathLabel}
            onCreate={() => setCreateOpen(true)}
          />
        ) : null}

        <QuestionBankGrid
          items={filteredItems}
          loading={loading}
          skeletons={QUESTION_BANK_SKELETONS}
        />
      </section>

      {createOpen ? (
        <QuestionBankCreateDialog
          key={`${grade}-${subject}-${topic}-${activeTab}`}
          initialGrade={grade ? Number(grade) : null}
          initialSubject={subject || null}
          initialTopic={topic || null}
          onClose={() => setCreateOpen(false)}
        />
      ) : null}
    </>
  );
}
