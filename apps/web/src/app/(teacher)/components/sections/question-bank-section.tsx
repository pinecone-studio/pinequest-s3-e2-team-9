/* eslint-disable max-lines */
"use client";

import { useMemo, useState } from "react";
import {
  QuestionRepositoryKind,
  useQuestionBanksQueryQuery,
} from "@/graphql/generated";
import { useLiveQuestionBankEvents } from "@/lib/use-live-question-bank-events";
import { PlusIcon } from "../icons";
import {
  getCurriculumGrades,
  getCurriculumTopicGroupName,
  getCurriculumSubjects,
  getCurriculumTopicGroups,
} from "../question-bank-curriculum";
import {
  formatQuestionBankDate,
  type QuestionBankItem,
} from "../question-bank-utils";
import { TeacherBackButton } from "../teacher-back-button";
import { QuestionBankCreateDialog } from "./question-bank-create-dialog";
import {
  QuestionBankBrowseGrid,
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
    repositoryKind: "MINE" | "UNIFIED";
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
      bank.topic !== "Ерөнхий" ? bank.topic : bank.topics[0] ?? bank.title,
    description: bank.description ?? "Тайлбар оруулаагүй асуултын сан",
    repositoryKind: bank.repositoryKind,
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

type LibraryTab = "unified" | "mine";

export function QuestionBankSection() {
  const [activeTab, setActiveTab] = useState<LibraryTab>("unified");
  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
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

  const itemsState = useMemo(() => {
    try {
      const combinedBanks = [
        ...(data?.mineQuestionBanks ?? []),
        ...(data?.unifiedQuestionBanks ?? []),
      ];

      return {
        items: mapQuestionBankItems(combinedBanks),
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
  }, [data?.mineQuestionBanks, data?.unifiedQuestionBanks, error]);

  const scopedItems = useMemo(() => {
    return itemsState.items.filter((item) =>
      activeTab === "unified"
        ? item.repositoryKind === "UNIFIED"
        : item.repositoryKind === "MINE",
    );
  }, [activeTab, itemsState.items]);

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
    const fromCurriculum = getCurriculumTopicGroups(numericGrade, subject).map(
      (entry) => entry.name,
    );
    const fromBanks = scopedItems
      .filter((item) => item.grade === numericGrade && item.subject === subject)
      .flatMap((item) => (item.topic !== "Ерөнхий" ? [item.topic] : item.topics));

    return [...new Set([...fromCurriculum, ...fromBanks])];
  }, [grade, scopedItems, subject]);

  const topicGroups = useMemo(() => {
    if (!grade || !subject) {
      return [];
    }

    return getCurriculumTopicGroups(Number(grade), subject);
  }, [grade, subject]);

  const topicGroupMap = useMemo(
    () => new Map(topicGroups.map((entry) => [entry.name, entry.topics])),
    [topicGroups],
  );

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return scopedItems.filter((item) => {
      const topicValues = item.topic !== "Ерөнхий" ? [item.topic] : item.topics;
      const selectedTopicMembers = topic ? topicGroupMap.get(topic) ?? [topic] : [];
      const matchesSearch =
        !keyword ||
        `${item.title} ${item.description} ${item.subject} ${topicValues.join(" ")} ${item.ownerName}`
          .toLowerCase()
          .includes(keyword);
      const matchesGrade = !grade || item.grade === Number(grade);
      const matchesSubject = !subject || item.subject === subject;
      const matchesTopic =
        !topic || topicValues.some((value) => selectedTopicMembers.includes(value));

      return matchesSearch && matchesGrade && matchesSubject && matchesTopic;
    });
  }, [grade, scopedItems, search, subject, topic, topicGroupMap]);

  const groupedCategoryItems = useMemo(() => {
    if (!grade || !subject || topic) {
      return [];
    }

    const grouped = new Map<
      string,
      QuestionBankItem & { questionCountNumber: number; bankCount: number }
    >();

    for (const item of filteredItems) {
      const topicValues = item.topic !== "Ерөнхий" ? [item.topic] : item.topics;
      const primaryTopic = topicValues[0] ?? item.displayTitle;
      const groupName = getCurriculumTopicGroupName(Number(grade), subject, primaryTopic);
      const current = grouped.get(groupName) ?? {
        ...item,
        id: `group:${groupName}`,
        title: groupName,
        displayTitle: groupName,
        description: `${groupName} сэдэвт хамаарах сангуудыг нэгтгэн харуулж байна.`,
        subtopics: [],
        ownerName: "",
        questions: "0 асуулт",
        questionCountNumber: 0,
        bankCount: 0,
      };

      current.bankCount += 1;
      const questionCount = Number.parseInt(item.questions, 10);
      current.questionCountNumber += Number.isFinite(questionCount) ? questionCount : 0;
      current.questions = `${current.questionCountNumber} асуулт`;
      current.ownerName = `${current.bankCount} сан нэгтгэсэн`;
      current.subtopics = [
        ...new Set([...(current.subtopics ?? []), ...topicValues]),
      ];
      grouped.set(groupName, current);
    }

    return [...grouped.values()]
      .sort((left, right) => left.displayTitle.localeCompare(right.displayTitle, "mn"))
      .map(({ questionCountNumber: _questionCountNumber, bankCount: _bankCount, ...item }) => item);
  }, [filteredItems, grade, subject, topic]);

  const categoryBrowseItems = useMemo(() => {
    if (grade) {
      return [];
    }

    const keyword = search.trim().toLowerCase();
    const itemsByCategory = new Map<
      string,
      { key: string; label: string; subtitle: string; bankCount: number }
    >();

    for (const item of scopedItems) {
      const key = `${item.grade}:${item.subject}`;
      const current = itemsByCategory.get(key) ?? {
        key,
        label: `${item.grade}-р анги ${item.subject}`,
        subtitle: "",
        bankCount: 0,
      };
      current.bankCount += 1;
      current.subtitle = `${current.bankCount} сан`;
      itemsByCategory.set(key, current);
    }

    return [...itemsByCategory.values()]
      .filter((item) => !keyword || item.label.toLowerCase().includes(keyword))
      .sort((left, right) => left.label.localeCompare(right.label, "mn"));
  }, [grade, scopedItems, search]);

  const subjectBrowseItems = useMemo(() => {
    if (!grade || subject) {
      return [];
    }

    const keyword = search.trim().toLowerCase();
    const itemsBySubject = new Map<
      string,
      { key: string; label: string; subtitle: string; bankCount: number }
    >();

    for (const item of scopedItems.filter((entry) => entry.grade === Number(grade))) {
      const current = itemsBySubject.get(item.subject) ?? {
        key: item.subject,
        label: item.subject,
        subtitle: "",
        bankCount: 0,
      };
      current.bankCount += 1;
      current.subtitle = `${current.bankCount} сан`;
      itemsBySubject.set(item.subject, current);
    }

    return [...itemsBySubject.values()]
      .filter((item) => !keyword || item.label.toLowerCase().includes(keyword))
      .sort((left, right) => left.label.localeCompare(right.label, "mn"));
  }, [grade, scopedItems, search, subject]);

  const selectedPathLabel = useMemo(() => {
    const path = [
      grade ? `${grade}-р анги` : "Анги",
      subject || "Хичээл",
      topic || "Бүх дэд сэдэв",
    ];

    return path.join(" / ");
  }, [grade, subject, topic]);

  return (
    <>
      <section className="mx-auto w-full max-w-[1120px] space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <TeacherBackButton fallbackHref="/" />
            <div>
            <h1 className="text-[24px] font-semibold text-[#0F1216]">
              Асуултын сан
            </h1>
            <p className="mt-1 text-[14px] text-[#52555B]">
              Эхлээд хадгалах газраа, дараа нь анги ба хичээлээ сонгоно. Нэгдсэн сан нь community болон нээлттэй эх сурвалжуудыг нэгтгэнэ.
            </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-[#6434F8] px-4 py-2 text-[14px] font-medium text-white"
          >
            <PlusIcon className="h-4 w-4" />
            Сан үүсгэх
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <QuestionBankTabButton
            active={activeTab === "unified"}
            label="Нэгдсэн сан"
            onClick={() => setActiveTab("unified")}
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

        {!loading && !itemsState.errorMessage && !grade && categoryBrowseItems.length ? (
          <QuestionBankBrowseGrid
            title="Категориуд"
            description="Анги, хичээлээр ангилсан сангийн category-оос сонгоно уу."
            items={categoryBrowseItems}
            onSelect={(value) => {
              const [nextGrade, nextSubject] = value.split(":");
              setGrade(nextGrade ?? "");
              setSubject(nextSubject ?? "");
              setTopic("");
            }}
          />
        ) : null}

        {!loading && !itemsState.errorMessage && grade && !subject && subjectBrowseItems.length ? (
          <QuestionBankBrowseGrid
            title={`${grade}-р ангийн хичээлүүд`}
            description="Энэ ангийн category дотроос хичээлээ сонгоно уу."
            items={subjectBrowseItems}
            onSelect={(value) => {
              setSubject(value);
              setTopic("");
            }}
          />
        ) : null}

        {!loading &&
        !itemsState.errorMessage &&
        !filteredItems.length &&
        !categoryBrowseItems.length &&
        !subjectBrowseItems.length ? (
          <QuestionBankEmptyState
            grade={grade}
            subject={subject}
            topic={topic}
            selectedPathLabel={selectedPathLabel}
            onCreate={() => setCreateOpen(true)}
          />
        ) : null}

        {grade && subject ? (
          <QuestionBankGrid
            items={topic ? filteredItems : groupedCategoryItems}
            loading={loading}
            skeletons={QUESTION_BANK_SKELETONS}
            categoryLabel={grade && subject ? `${grade}-р анги ${subject}` : ""}
            showCategoryContext={Boolean(grade && subject)}
            onSelectItem={topic ? undefined : (item) => setTopic(item.displayTitle)}
          />
        ) : null}
      </section>

      {createOpen ? (
        <QuestionBankCreateDialog
          key={`${grade}-${subject}-${topic}-${activeTab}`}
          initialGrade={grade ? Number(grade) : null}
          initialSubject={subject || null}
          initialTopic={topic || null}
          initialRepositoryKind={
            activeTab === "unified"
              ? QuestionRepositoryKind.Unified
              : QuestionRepositoryKind.Mine
          }
          onClose={() => setCreateOpen(false)}
        />
      ) : null}
    </>
  );
}
