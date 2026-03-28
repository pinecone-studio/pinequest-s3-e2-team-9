/* eslint-disable max-lines */
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  QuestionBankVisibility,
  QuestionBanksQueryDocument,
  useCreateQuestionBankMutationMutation,
} from "@/graphql/generated";
import {
  getCurriculumGrades,
  getCurriculumSubjects,
  getCurriculumTopics,
} from "../question-bank-curriculum";
import { CloseIcon } from "../icons";
import { QuestionBankDialogFooter } from "./question-bank-dialog-actions";
import { QuestionBankCreateDialogForm } from "./question-bank-create-dialog-form";

type QuestionBankCreateDialogProps = {
  initialGrade?: number | null;
  initialSubject?: string | null;
  initialTopic?: string | null;
  onClose: () => void;
};

const toDefaultTitle = (
  grade: number | null,
  subject: string,
  topic: string,
) => {
  if (!grade || !subject || !topic) {
    return "";
  }

  return `${grade}-р анги ${subject} · ${topic}`;
};

const getInitialDialogState = (
  initialGrade: number | null,
  initialSubject: string | null,
  initialTopic: string | null,
) => {
  const grade = initialGrade ? String(initialGrade) : "";
  const subject = initialSubject?.trim() ?? "";
  const topic = initialTopic?.trim() ?? "";

  return {
    grade,
    subject,
    topic,
    title: toDefaultTitle(initialGrade, subject, topic),
  };
};

export function QuestionBankCreateDialog({
  initialGrade = null,
  initialSubject = null,
  initialTopic = null,
  onClose,
}: QuestionBankCreateDialogProps) {
  const router = useRouter();
  const initialState = getInitialDialogState(
    initialGrade,
    initialSubject,
    initialTopic,
  );
  const [title, setTitle] = useState(initialState.title);
  const [description, setDescription] = useState("");
  const [grade, setGrade] = useState<string>(initialState.grade);
  const [subject, setSubject] = useState(initialState.subject);
  const [topic, setTopic] = useState(initialState.topic);
  const [visibility, setVisibility] = useState<QuestionBankVisibility>(
    QuestionBankVisibility.Private,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createQuestionBank, { loading }] =
    useCreateQuestionBankMutationMutation();

  const gradeOptions = useMemo(
    () => getCurriculumGrades().map((value) => String(value)),
    [],
  );
  const subjectOptions = useMemo(
    () => (grade ? getCurriculumSubjects(Number(grade)).map((entry) => entry.name) : []),
    [grade],
  );
  const topicOptions = useMemo(
    () => (grade && subject ? getCurriculumTopics(Number(grade), subject) : []),
    [grade, subject],
  );

  const handleSubmit = async () => {
    const numericGrade = Number(grade);

    if (!numericGrade || !subject || !topic) {
      setErrorMessage("Анги, хичээл, дэд сэдвээ бүрэн сонгоно уу.");
      return;
    }

    if (!title.trim()) {
      setErrorMessage("Сангийн нэрээ оруулна уу.");
      return;
    }

    try {
      const result = await createQuestionBank({
        variables: {
          title: title.trim(),
          description: description.trim() || null,
          grade: numericGrade,
          subject,
          topic,
          visibility,
        },
        refetchQueries: [{ query: QuestionBanksQueryDocument }],
        awaitRefetchQueries: true,
      });

      const createdId = result.data?.createQuestionBank.id;

      onClose();

      if (createdId) {
        router.push(`/question-bank/${createdId}`);
      }
    } catch (error) {
      console.error("Failed to create question bank", error);
      setErrorMessage("Сан үүсгэх үед алдаа гарлаа.");
    }
  };

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
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-semibold text-[#0F1216]">
              Асуултын сан үүсгэх
            </h2>
            <p className="mt-1 text-[14px] text-[#52555B]">
              Сангаа анги, хичээл, дэд сэдвээр нь үүсгэвэл дараа нь асуултаа цэгцтэй хадгална.
            </p>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-[#52555B] hover:bg-white"
            onClick={onClose}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <QuestionBankCreateDialogForm
            grade={grade}
            subject={subject}
            topic={topic}
            title={title}
            description={description}
            visibility={visibility}
            gradeOptions={gradeOptions}
            subjectOptions={subjectOptions}
            topicOptions={topicOptions}
            onGradeChange={(value) => {
              setGrade(value);
              setSubject("");
              setTopic("");
              setTitle(toDefaultTitle(Number(value), "", ""));
            }}
            onSubjectChange={(value) => {
              setSubject(value);
              setTopic("");
              setTitle(toDefaultTitle(Number(grade), value, ""));
            }}
            onTopicChange={(value) => {
              setTopic(value);
              setTitle(toDefaultTitle(Number(grade), subject, value));
            }}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onVisibilityChange={setVisibility}
          />

          {errorMessage ? (
            <p className="text-[14px] text-[#B42318]">{errorMessage}</p>
          ) : null}

          <QuestionBankDialogFooter
            loading={loading}
            showLibraryAction={false}
            submitLabel="Сан үүсгэх"
            onCancel={onClose}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
