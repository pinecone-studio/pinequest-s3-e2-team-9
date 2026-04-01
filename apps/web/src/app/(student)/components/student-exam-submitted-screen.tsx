/* eslint-disable max-lines, @next/next/no-img-element */
import Link from "next/link";
import { AttemptStatus, ExamMode } from "@/graphql/generated";
import { useProtectedImageSource } from "@/lib/image-answer";
import { parseOpenTaskAnswer } from "@/lib/open-task-answer";
import { getQuestionPromptImageValue } from "@/lib/question-prompt-image";
import { buildPracticeMasterySummary } from "./student-exam-practice-mastery";
import type { StudentExamAttempt, StudentExamData } from "./student-exam-room-types";
import { formatClock, formatMonthDay } from "./student-home-time";

const isUrl = (value: string) => /^https?:\/\//i.test(value);

const questionTypeLabel = (type: string) => {
  if (type === "MCQ") return "Олон сонголт";
  if (type === "TRUE_FALSE") return "Үнэн / Худал";
  if (type === "SHORT_ANSWER") return "Тоо бодолт";
  if (type === "ESSAY") return "Задгай даалгавар";
  if (type === "IMAGE_UPLOAD") return "Зураг оруулах";
  return "Асуулт";
};

function QuestionPromptImage({ tags }: { tags: string[] }) {
  const promptImageValue = getQuestionPromptImageValue(tags) ?? "";
  const { error, isLoading, src } = useProtectedImageSource(promptImageValue);

  if (src) {
    return (
      <div className="overflow-hidden rounded-md border border-[#DFE1E5] bg-[#F8FAFC] p-2">
        <img
          alt="Асуултад хавсаргасан зураг"
          className="max-h-[280px] w-full rounded object-contain"
          src={src}
        />
      </div>
    );
  }

  if (isLoading) {
    return <p className="text-[13px] text-[#667085]">Асуултын зургийг ачаалж байна...</p>;
  }

  if (error) {
    return <p className="text-[13px] font-medium text-[#B42318]">{error}</p>;
  }

  return null;
}

function AnswerValue({
  type,
  value,
}: {
  type: string;
  value: string;
}) {
  const openTaskAnswer = type === "ESSAY" ? parseOpenTaskAnswer(value) : null;
  const imageValue =
    type === "ESSAY" ? openTaskAnswer?.image ?? "" : type === "IMAGE_UPLOAD" ? value : "";
  const { error, isLoading, src } = useProtectedImageSource(imageValue);

  if (type === "ESSAY") {
    return (
      <div className="space-y-3">
        {openTaskAnswer?.text.trim() ? (
          <div className="rounded-md border border-[#DFE1E5] bg-[#F8FAFC] px-3 py-2 text-[14px] leading-6 text-[#0F1216] whitespace-pre-wrap">
            {openTaskAnswer.text}
          </div>
        ) : null}
        {src ? (
          <div className="overflow-hidden rounded-md border border-[#DFE1E5] bg-[#F8FAFC] p-2">
            <img
              alt="Хавсаргасан зураг"
              className="max-h-[320px] w-full rounded object-contain"
              src={src}
            />
          </div>
        ) : null}
        {isLoading ? (
          <p className="text-[13px] text-[#667085]">Зургийг ачаалж байна...</p>
        ) : null}
        {error ? (
          <p className="text-[13px] font-medium text-[#B42318]">{error}</p>
        ) : null}
        {!openTaskAnswer?.text.trim() && !openTaskAnswer?.image.trim() ? (
          <div className="rounded-md border border-[#DFE1E5] bg-[#F8FAFC] px-3 py-2 text-[14px] leading-6 text-[#0F1216] whitespace-pre-wrap">
            Хариулт оруулаагүй
          </div>
        ) : null}
      </div>
    );
  }

  if (src) {
    return (
      <div className="overflow-hidden rounded-md border border-[#DFE1E5] bg-[#F8FAFC] p-2">
        <img
          alt="Оруулсан зураг"
          className="max-h-[320px] w-full rounded object-contain"
          src={src}
        />
      </div>
    );
  }

  if (isLoading) {
    return <p className="text-[13px] text-[#667085]">Зургийг ачаалж байна...</p>;
  }

  if (error) {
    return <p className="text-[13px] font-medium text-[#B42318]">{error}</p>;
  }

  if (isUrl(value)) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="text-[14px] font-medium text-[#155EEF] underline underline-offset-2"
      >
        Материал нээх
      </a>
    );
  }

  return (
    <div className="rounded-md border border-[#DFE1E5] bg-[#F8FAFC] px-3 py-2 text-[14px] leading-6 text-[#0F1216] whitespace-pre-wrap">
      {value.trim() || "Хариулт оруулаагүй"}
    </div>
  );
}

type StudentExamSubmittedScreenProps = {
  answeredCount: number;
  currentAttempt: StudentExamAttempt;
  exam: StudentExamData;
  isRestarting: boolean;
  onRestartAttempt: () => void;
};

export function StudentExamSubmittedScreen({
  answeredCount,
  currentAttempt,
  exam,
  isRestarting,
  onRestartAttempt,
}: StudentExamSubmittedScreenProps) {
  const submittedAt = currentAttempt.submittedAt ?? currentAttempt.startedAt;
  const isPractice = exam.mode === ExamMode.Practice;
  const isReviewed = currentAttempt.status === AttemptStatus.Graded;
  const totalPoints = exam.questions.reduce((sum, question) => sum + question.points, 0);
  const answersByQuestionId = new Map(
    currentAttempt.answers.map((answer) => [answer.question.id, answer]),
  );
  const pointsByQuestionId = new Map(
    exam.questions.map((item) => [item.question.id, item.points]),
  );
  const weakTopicCounts = new Map<string, number>();
  for (const answer of currentAttempt.answers) {
    const topic = answer.question.bank?.topic ?? "Ерөнхий";
    const points = pointsByQuestionId.get(answer.question.id) ?? 0;
    const score = (answer.autoScore ?? 0) + (answer.manualScore ?? 0);
    if (points > 0 && score < points) {
      weakTopicCounts.set(topic, (weakTopicCounts.get(topic) ?? 0) + 1);
    }
  }
  const weakTopics = [...weakTopicCounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3);
  const practiceMastery = isPractice
    ? buildPracticeMasterySummary(exam, currentAttempt)
    : null;
  const details = [
    {
      label: "Төлөв",
      value: isPractice ? "Practice дууссан" : isReviewed ? "Reviewed" : "Pending Review",
    },
    ...(isReviewed
      ? [{ label: isPractice ? "Practice score" : "Final score", value: `${currentAttempt.totalScore} / ${totalPoints}` }]
      : []),
    {
      label: "Илгээсэн огноо, цаг",
      value: `${formatMonthDay(submittedAt)} ${formatClock(submittedAt)}`,
    },
    { label: "Нийт асуултын тоо", value: String(exam.questions.length) },
    { label: "Хариулсан асуултын тоо", value: String(answeredCount) },
    ...(practiceMastery
      ? [
          { label: "Ерөнхий mastery", value: `${practiceMastery.overallMasteryPercent}%` },
          { label: "Тооцсон түвшин", value: practiceMastery.estimatedLevel },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_360px]">
        <section className="overflow-hidden rounded-[28px] border border-[#DCE6FF] bg-[radial-gradient(circle_at_top_left,#EEF4FF_0%,#F8FAFF_45%,#FFFFFF_100%)] p-7 shadow-[0_24px_60px_rgba(36,102,208,0.12)] sm:p-8">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.1em] ${
              isPractice
                ? "bg-[#ECFDF3] text-[#027A48]"
                : isReviewed
                ? "bg-[#ECFDF3] text-[#027A48]"
                : "bg-[#FFF4E5] text-[#B54708]"
            }`}
          >
            {isPractice ? "Practice Complete" : isReviewed ? "Reviewed" : "Pending Review"}
          </span>
          <h1 className="mt-4 text-[32px] font-semibold tracking-[-0.03em] text-[#101828]">
            {exam.title}
          </h1>
          <p className="mt-4 max-w-[760px] text-[16px] leading-7 text-[#475467]">
            {isReviewed
              ? isPractice
                ? "Та энэ self-test-ийг дуусгалаа. Доор зөв хариу, өөрийн хариулт, сул сэдвийн зөвлөмж харагдана."
                : "Багш таны шалгалтыг шалгасан байна. Final score болон feedback доор харагдана."
              : "Таны шалгалт хүлээн авлаа. Review дуусмагц энэ хуудсанд final score болон feedback харагдана."}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {details.map((detail) => (
              <div
                key={detail.label}
                className="rounded-[20px] border border-[#E4E7EC] bg-white px-5 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
              >
                <p className="text-[13px] text-[#667085]">{detail.label}</p>
                <p className="mt-2 text-[18px] font-semibold text-[#101828]">{detail.value}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-[28px] border border-[#E7ECF6] bg-white p-6 shadow-[0_20px_45px_rgba(16,24,40,0.08)]">
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#2466D0]">
            Дараагийн алхам
          </p>
          <h2 className="mt-3 text-[24px] font-semibold tracking-[-0.03em] text-[#101828]">
            {isPractice
              ? "Self-review ба зөвлөмж"
              : isReviewed
                ? "Final result бэлэн боллоо"
                : "Багшийн review-г хүлээнэ үү"}
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-[#475467]">
            {isPractice
              ? weakTopics.length
                ? `Илүү анхаарах сэдэв: ${weakTopics.map(([topic]) => topic).join(", ")}. Дахин ажиллаад ахицaa шууд харж болно.`
                : "Сайн байна. Ихэнх асуултад зөв хариулсан тул ахиад нэг удаа өөр хувилбараар өөрийгөө сорьж болно."
              : isReviewed
                ? "Хэрэв багш нэмэлт тайлбар үлдээсэн бол доорх асуулт бүрийн card дээрээс уншина уу."
                : "Review хийгдсэний дараа энэ хуудас автоматаар Reviewed төлөв, final score, feedback-тайгаар шинэчлэгдэнэ."}
          </p>
          {practiceMastery ? (
            <div className="mt-5 space-y-4 rounded-[20px] border border-[#D5E3FF] bg-[#F8FAFF] p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[16px] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#2466D0]">
                    Тооцсон түвшин
                  </p>
                  <p className="mt-2 text-[20px] font-semibold text-[#101828]">
                    {practiceMastery.estimatedLevel}
                  </p>
                  <p className="mt-1 text-[13px] text-[#475467]">
                    Итгэлцүүр: {practiceMastery.confidenceLabel}
                  </p>
                </div>

                <div className="rounded-[16px] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#2466D0]">
                    Дараагийн санал болгож буй түвшин
                  </p>
                  <p className="mt-2 text-[20px] font-semibold text-[#101828]">
                    {practiceMastery.recommendedDifficulty}
                  </p>
                  <p className="mt-1 text-[13px] text-[#475467]">
                    Mastery: {practiceMastery.overallMasteryPercent}%
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[16px] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#B54708]">
                    Илүү анхаарах сэдэв
                  </p>
                  <div className="mt-3 space-y-2">
                    {practiceMastery.weakTopics.length ? (
                      practiceMastery.weakTopics.map((topic) => (
                        <div
                          key={topic.topic}
                          className="flex items-center justify-between rounded-xl border border-[#F2F4F7] bg-[#FFFAEB] px-3 py-2 text-[13px]"
                        >
                          <span className="font-medium text-[#344054]">{topic.topic}</span>
                          <span className="text-[#B54708]">{topic.masteryPercent}%</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[13px] text-[#475467]">
                        Сул сэдэв одоогоор тод илрээгүй байна.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-[16px] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#027A48]">
                    Хүчтэй сэдэв
                  </p>
                  <div className="mt-3 space-y-2">
                    {practiceMastery.strongTopics.length ? (
                      practiceMastery.strongTopics.map((topic) => (
                        <div
                          key={topic.topic}
                          className="flex items-center justify-between rounded-xl border border-[#ECFDF3] bg-[#F6FEF9] px-3 py-2 text-[13px]"
                        >
                          <span className="font-medium text-[#344054]">{topic.topic}</span>
                          <span className="text-[#027A48]">{topic.masteryPercent}%</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[13px] text-[#475467]">
                        Хүчтэй сэдвийг тогтооход илүү олон хариулт хэрэгтэй.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {isPractice ? (
            <button
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-[16px] bg-[#16A34A] text-[15px] font-semibold text-white shadow-[0_16px_36px_rgba(22,163,74,0.28)] transition hover:bg-[#15803D] disabled:cursor-not-allowed disabled:bg-[#98A2B3]"
              disabled={isRestarting}
              onClick={onRestartAttempt}
              type="button"
            >
              {isRestarting ? "Дахин эхлүүлж байна..." : "Дахин оролдох"}
            </button>
          ) : null}
          <Link
            className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-[16px] bg-[#2466D0] text-[15px] font-semibold text-white shadow-[0_16px_36px_rgba(36,102,208,0.28)] transition hover:bg-[#1E56B2]"
            href="/student"
          >
            Нүүр хуудас руу буцах
          </Link>
        </aside>
      </div>

      {isReviewed ? (
        <section className="rounded-[28px] border border-[#E4E7EC] bg-white p-6 shadow-[0_20px_45px_rgba(16,24,40,0.08)]">
          <div className="mb-5">
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#2466D0]">
              Teacher Review
            </p>
            <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#101828]">
              Хариулт бүрийн үнэлгээ ба feedback
            </h2>
          </div>

          <div className="space-y-4">
            {exam.questions.map((item, index) => {
              const answer = answersByQuestionId.get(item.question.id) ?? null;
              const score = (answer?.autoScore ?? 0) + (answer?.manualScore ?? 0);

              return (
                <article
                  key={item.id}
                  className="rounded-[20px] border border-[#E4E7EC] bg-[#F8FAFC] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#EEF4FF] px-2 text-[12px] font-semibold text-[#1D4ED8]">
                          {index + 1}
                        </span>
                        <span className="rounded-md border border-[#D5D9E0] bg-white px-2 py-0.5 text-[12px] font-medium text-[#344054]">
                          {questionTypeLabel(item.question.type)}
                        </span>
                        <span className="rounded-md border border-[#D5D9E0] bg-white px-2 py-0.5 text-[12px] font-medium text-[#344054]">
                          {item.points} оноо
                        </span>
                      </div>
                      <p className="mt-3 text-[16px] font-medium leading-7 text-[#101828]">
                        {item.question.prompt || item.question.title}
                      </p>
                    </div>
                    <span className="rounded-md bg-[#ECFDF3] px-3 py-1 text-[13px] font-semibold text-[#027A48]">
                      {score} / {item.points}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <QuestionPromptImage tags={item.question.tags} />

                    <div>
                      <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#475467]">
                        Таны хариулт
                      </p>
                      {answer ? (
                        <AnswerValue type={item.question.type} value={answer.value} />
                      ) : (
                        <div className="rounded-md border border-dashed border-[#D0D5DD] bg-white px-3 py-2 text-[14px] text-[#667085]">
                          Хариулт оруулаагүй
                        </div>
                      )}
                    </div>

                    {isPractice ? (
                      <div className="rounded-md border border-[#D5E3FF] bg-white px-4 py-3">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#2466D0]">
                          Зөв хариу
                        </p>
                        <p className="mt-2 text-[14px] leading-6 text-[#344054] whitespace-pre-wrap">
                          {answer?.question.correctAnswer?.trim() || "Тайлбаргүй"}
                        </p>
                      </div>
                    ) : null}

                    <div className="rounded-md border border-[#D5E3FF] bg-[#EEF4FF] px-4 py-3">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#2466D0]">
                        {isPractice ? "Feedback / Зөвлөмж" : "Feedback"}
                      </p>
                      <p className="mt-2 text-[14px] leading-6 text-[#344054]">
                        {isPractice
                          ? answer && ((answer.autoScore ?? 0) + (answer.manualScore ?? 0)) >= item.points
                            ? "Зөв хариулсан байна. Хүсвэл ижил сэдвээр дараагийн түвшний дасгал ажиллаарай."
                            : `Энэ асуулт дээр ${answer?.question.bank?.topic ?? "энэ сэдэв"}-ээ дахин давтаад, зөв хариутайгаа харьцуулж бодоорой.`
                          : answer?.feedback?.trim() || "Багш энэ асуултад нэмэлт feedback үлдээгээгүй байна."}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
