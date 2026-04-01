/* eslint-disable @next/next/no-img-element */
/* eslint-disable max-lines */
"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { QuestionType } from "@/graphql/generated";
import {
  isImageAnswerValue,
  uploadImageAnswer,
  useProtectedImageSource,
} from "@/lib/image-answer";
import {
  parseOpenTaskAnswer,
  serializeOpenTaskAnswer,
} from "@/lib/open-task-answer";
import { getQuestionPromptImageValue } from "@/lib/question-prompt-image";
import type { StudentExamQuestion } from "./student-exam-room-types";

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  [QuestionType.Mcq]: "Олон сонголт",
  [QuestionType.TrueFalse]: "Үнэн / Худал",
  [QuestionType.ShortAnswer]: "Богино хариулт",
  [QuestionType.Essay]: "Задгай даалгавар",
  [QuestionType.ImageUpload]: "Зураг оруулах",
};

const SHORT_ANSWER_HELP_TEXT =
  "Хэрэв тоон хариулттай асуулт бол нэгжийг алгасаж болно. Нэгжийг кирилл эсвэл англи үсгээр бичсэн ч зөв тооцно.";

type StudentExamQuestionCardProps = {
  draftValue: string;
  isDirty: boolean;
  isInProgress: boolean;
  isSaving: boolean;
  onChange: (value: string) => void;
  question: StudentExamQuestion;
  questionIndex: number;
  saveError?: string;
  savedValue?: string;
};

export function StudentExamQuestionCard({
  draftValue,
  isDirty,
  isInProgress,
  isSaving,
  onChange,
  question,
  questionIndex,
  saveError,
  savedValue,
}: StudentExamQuestionCardProps) {
  const { getToken } = useAuth();
  const isImageUpload = question.question.type === QuestionType.ImageUpload;
  const isEssay = question.question.type === QuestionType.Essay;
  const isShortAnswer = question.question.type === QuestionType.ShortAnswer;
  const essayAnswer = parseOpenTaskAnswer(isEssay ? draftValue : "");
  const essayImageValue = essayAnswer.image.trim();
  const promptImageValue = getQuestionPromptImageValue(question.question.tags);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const currentImageValue = draftValue.trim() || savedValue?.trim() || "";
  const { error: imageSourceError, isLoading: isImageLoading, src: protectedImageSrc } =
    useProtectedImageSource(isImageUpload ? currentImageValue : "");
  const {
    error: essayImageSourceError,
    isLoading: isEssayImageLoading,
    src: protectedEssayImageSrc,
  } = useProtectedImageSource(isEssay ? essayImageValue : "");
  const {
    error: promptImageError,
    isLoading: isPromptImageLoading,
    src: promptImageSrc,
  } = useProtectedImageSource(promptImageValue ?? "");
  const imagePreviewSrc = localPreviewUrl ?? protectedImageSrc;
  const essayImagePreviewSrc = localPreviewUrl ?? protectedEssayImageSrc;
  const shouldShowImagePreview = Boolean(imagePreviewSrc);
  const shouldShowEssayImagePreview = Boolean(essayImagePreviewSrc);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  useEffect(() => {
    if (!isImageUpload || draftValue.trim().startsWith("r2:")) {
      return;
    }

    setLocalPreviewUrl(null);
  }, [draftValue, isImageUpload]);

  useEffect(() => {
    if (!isEssay || essayImageValue.startsWith("r2:")) {
      return;
    }

    setLocalPreviewUrl(null);
  }, [essayImageValue, isEssay]);

  const handleImagePick = async (file: File | null) => {
    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return objectUrl;
    });
    setImageUploadError(null);
    setIsUploadingImage(true);

    try {
      const storedValue = await uploadImageAnswer(file, getToken);
      setImageUploadError(null);
      onChange(storedValue);
    } catch (error) {
      console.error("Failed to upload image answer", error);
      setImageUploadError(
        error instanceof Error
          ? error.message
          : "Зураг оруулах үед алдаа гарлаа.",
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleEssayImagePick = async (file: File | null) => {
    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return objectUrl;
    });
    setImageUploadError(null);
    setIsUploadingImage(true);

    try {
      const storedValue = await uploadImageAnswer(file, getToken);
      setImageUploadError(null);
      onChange(
        serializeOpenTaskAnswer({
          image: storedValue,
          text: essayAnswer.text,
        }),
      );
    } catch (error) {
      console.error("Failed to upload essay image", error);
      setImageUploadError(
        error instanceof Error
          ? error.message
          : "Зураг оруулах үед алдаа гарлаа.",
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <article className="rounded-[20px] border border-[#E7ECF6] bg-white p-6 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#2466D0]">Асуулт {questionIndex + 1}</p>
          <h3 className="text-[18px] font-semibold text-[#0F1216]">{question.question.title || question.question.prompt}</h3>
          <p className="text-[15px] leading-6 text-[#475467]">{question.question.prompt}</p>
          {promptImageSrc ? (
            <div className="mt-3 overflow-hidden rounded-[14px] border border-[#D0D5DD] bg-[#F8FAFC] p-2">
              <img
                alt={`Асуулт ${questionIndex + 1}-ийн хавсаргасан зураг`}
                className="max-h-[320px] w-full rounded-[10px] object-contain"
                src={promptImageSrc}
              />
            </div>
          ) : null}
          {isPromptImageLoading ? (
            <p className="text-[13px] text-[#667085]">Асуултын зургийг ачаалж байна...</p>
          ) : null}
          {promptImageError ? (
            <p className="text-[13px] font-medium text-[#B42318]">{promptImageError}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{QUESTION_TYPE_LABELS[question.question.type]}</Badge>
          <Badge>{question.points} оноо</Badge>
        </div>
      </div>

      <div className="mt-5">
        {question.question.type === QuestionType.Mcq || question.question.type === QuestionType.TrueFalse ? (
          <div className="grid gap-3">
            {question.question.options.map((option) => (
              <label key={option} className="flex cursor-pointer items-start gap-3 rounded-[14px] border border-[#E4E7EC] px-4 py-3 transition hover:border-[#B2CCFF]">
                <input checked={draftValue === option} className="mt-1" disabled={!isInProgress} name={question.question.id} onChange={(event) => onChange(event.target.value)} type="radio" value={option} />
                <span className="text-[14px] leading-6 text-[#344054]">{option}</span>
              </label>
            ))}
          </div>
        ) : null}

        {isShortAnswer ? (
          <div className="space-y-2">
            <input
              className="h-12 w-full rounded-[14px] border border-[#D0D5DD] px-4 text-[14px] outline-none focus:border-[#2466D0]"
              disabled={!isInProgress}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Хариултаа оруулна уу"
              type="text"
              value={draftValue}
            />
            <p className="rounded-[12px] border border-[#D9E6FF] bg-[#F5F8FF] px-3 py-2 text-[12px] leading-5 text-[#475467]">
              {SHORT_ANSWER_HELP_TEXT}
            </p>
          </div>
        ) : null}
        {isEssay ? (
          <div className="space-y-3 rounded-[14px] border border-[#D0D5DD] bg-[#F8FAFF] px-4 py-4">
            <textarea
              className="min-h-[140px] w-full rounded-[14px] border border-[#D0D5DD] bg-white px-4 py-3 text-[14px] outline-none focus:border-[#2466D0]"
              disabled={!isInProgress}
              onChange={(event) =>
                onChange(
                  serializeOpenTaskAnswer({
                    image: essayAnswer.image,
                    text: event.target.value,
                  }),
                )
              }
              placeholder="Тайлбар, бодолт, шийдлээ энд бичнэ үү"
              value={essayAnswer.text}
            />
            <div className="space-y-3 rounded-[14px] border border-dashed border-[#D0D5DD] bg-white px-4 py-4">
              <label className="block text-[13px] font-medium text-[#344054]">
                Зураг хавсаргах
              </label>
              <input
                accept="image/*"
                className="block w-full text-[13px] text-[#475467]"
                disabled={!isInProgress}
                onChange={(event) => void handleEssayImagePick(event.target.files?.[0] ?? null)}
                type="file"
              />
              <input
                className="h-11 w-full rounded-[14px] border border-[#D0D5DD] px-4 text-[14px] outline-none focus:border-[#2466D0]"
                disabled={!isInProgress}
                onChange={(event) => {
                  setLocalPreviewUrl((current) => {
                    if (current) {
                      URL.revokeObjectURL(current);
                    }
                    return null;
                  });
                  setImageUploadError(null);
                  onChange(
                    serializeOpenTaskAnswer({
                      image: event.target.value,
                      text: essayAnswer.text,
                    }),
                  );
                }}
                placeholder="Эсвэл зургийн холбоос оруулна уу"
                type="text"
                value={isImageAnswerValue(essayAnswer.image) ? "" : essayAnswer.image}
              />
              {shouldShowEssayImagePreview ? (
                <div className="overflow-hidden rounded-[14px] border border-[#D0D5DD] bg-white p-2">
                  <img
                    alt={`Асуулт ${questionIndex + 1}-ийн хавсаргасан зураг`}
                    className="max-h-[280px] w-full rounded-[10px] object-contain"
                    src={essayImagePreviewSrc ?? ""}
                  />
                </div>
              ) : null}
              {isUploadingImage ? (
                <p className="text-[12px] font-medium text-[#2466D0]">
                  Зургийг R2 руу оруулж байна...
                </p>
              ) : null}
              {isEssayImageLoading && !localPreviewUrl ? (
                <p className="text-[12px] text-[#667085]">
                  Хадгалагдсан зургийг ачаалж байна...
                </p>
              ) : null}
              {imageUploadError ? (
                <p className="text-[12px] font-medium text-[#B42318]">
                  {imageUploadError}
                </p>
              ) : null}
              {essayImageSourceError && !imageUploadError ? (
                <p className="text-[12px] font-medium text-[#B42318]">
                  {essayImageSourceError}
                </p>
              ) : null}
              <p className="text-[12px] leading-5 text-[#667085]">
                Текст болон зураг хоёуланг нь илгээж болно. Энэ даалгаврыг багш гараар шалгана.
              </p>
            </div>
          </div>
        ) : null}
        {isImageUpload ? (
          <div className="space-y-3 rounded-[14px] border border-dashed border-[#D0D5DD] bg-[#F8FAFF] px-4 py-5">
            <label className="block text-[13px] font-medium text-[#344054]">
              Зургаа оруулах
            </label>
            <input
              accept="image/*"
              className="block w-full text-[13px] text-[#475467]"
              disabled={!isInProgress}
              onChange={(event) => handleImagePick(event.target.files?.[0] ?? null)}
              type="file"
            />
            <input
              className="h-11 w-full rounded-[14px] border border-[#D0D5DD] px-4 text-[14px] outline-none focus:border-[#2466D0]"
              disabled={!isInProgress}
              onChange={(event) => {
                setLocalPreviewUrl((current) => {
                  if (current) {
                    URL.revokeObjectURL(current);
                  }
                  return null;
                });
                setImageUploadError(null);
                onChange(event.target.value);
              }}
              placeholder="Эсвэл зургийн холбоос оруулна уу"
              type="text"
              value={isImageAnswerValue(draftValue) ? "" : draftValue}
            />
            {shouldShowImagePreview ? (
              <div className="overflow-hidden rounded-[14px] border border-[#D0D5DD] bg-white p-2">
                <img
                  alt={`Асуулт ${questionIndex + 1}-ийн оруулсан зураг`}
                  className="max-h-[280px] w-full rounded-[10px] object-contain"
                  src={imagePreviewSrc ?? ""}
                />
              </div>
            ) : null}
            {isUploadingImage ? (
              <p className="text-[12px] font-medium text-[#2466D0]">
                Зургийг R2 руу оруулж байна...
              </p>
            ) : null}
            {isImageLoading && !localPreviewUrl ? (
              <p className="text-[12px] text-[#667085]">
                Хадгалагдсан зургийг ачаалж байна...
              </p>
            ) : null}
            {imageUploadError ? (
              <p className="text-[12px] font-medium text-[#B42318]">
                {imageUploadError}
              </p>
            ) : null}
            {imageSourceError && !imageUploadError ? (
              <p className="text-[12px] font-medium text-[#B42318]">
                {imageSourceError}
              </p>
            ) : null}
            <p className="text-[12px] leading-5 text-[#667085]">
              Энэ төрлийн хариултыг багш гараар шалгана.
            </p>
          </div>
        ) : null}
      </div>

      <SaveStatus
        isDirty={isDirty}
        isInProgress={isInProgress}
        isSaving={isSaving || isUploadingImage}
        saveError={saveError}
        savedValue={savedValue}
      />
    </article>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full bg-[#EEF4FF] px-3 py-1 text-[12px] font-semibold text-[#3538CD]">{children}</span>;
}

function SaveStatus({
  isDirty,
  isInProgress,
  isSaving,
  saveError,
  savedValue,
}: {
  isDirty: boolean;
  isInProgress: boolean;
  isSaving: boolean;
  saveError?: string;
  savedValue?: string;
}) {
  if (saveError) {
    return <p className="mt-5 text-[13px] font-medium text-[#B42318]">{saveError}</p>;
  }

  if (!isInProgress) {
    return savedValue ? <p className="mt-5 text-[13px] text-[#667085]">Хадгалагдсан хариулт харагдаж байна.</p> : null;
  }

  if (isSaving) {
    return <p className="mt-5 text-[13px] font-medium text-[#2466D0]">Автоматаар хадгалж байна...</p>;
  }

  if (isDirty) {
    return <p className="mt-5 text-[13px] text-[#B54708]">Өөрчлөлт автоматаар хадгалагдана.</p>;
  }

  if (savedValue?.trim()) {
    return <p className="mt-5 text-[13px] font-medium text-[#027A48]">Хариулт автоматаар хадгалагдсан.</p>;
  }

  return <p className="mt-5 text-[13px] text-[#667085]">Хариултаа оруулахад автоматаар хадгална.</p>;
}
