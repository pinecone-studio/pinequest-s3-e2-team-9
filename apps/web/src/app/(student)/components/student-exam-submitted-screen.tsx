/* eslint-disable max-lines */
import Link from "next/link";
import { AttemptStatus } from "@/graphql/generated";
import type { StudentExamAttempt, StudentExamData } from "./student-exam-room-types";
import { formatClock, formatMonthDay } from "./student-home-time";

const isUrl = (value: string) => /^https?:\/\//i.test(value);

const AnswerValue = ({ value }: { value: string }) =>
  isUrl(value) ? (
    <a
      href={value}
      target="_blank"
      rel="noreferrer"
      className="text-[14px] font-medium text-[#155EEF] underline underline-offset-2"
    >
      Материал нээх
    </a>
  ) : (
    <div className="rounded-md border border-[#DFE1E5] bg-[#F8FAFC] px-3 py-2 text-[14px] leading-6 text-[#0F1216] whitespace-pre-wrap">
      {value.trim() || "Хариулт оруулаагүй"}
    </div>
  );

type StudentExamSubmittedScreenProps = {
  answeredCount: number;
  currentAttempt: StudentExamAttempt;
  exam: StudentExamData;
};

export function StudentExamSubmittedScreen({
  answeredCount,
  currentAttempt,
  exam,
}: StudentExamSubmittedScreenProps) {
  const submittedAt = currentAttempt.submittedAt ?? currentAttempt.startedAt;
  const isReviewed = currentAttempt.status === AttemptStatus.Graded;
  const totalPoints = exam.questions.reduce((sum, question) => sum + question.points, 0);
  const answersByQuestionId = new Map(
    currentAttempt.answers.map((answer) => [answer.question.id, answer]),
  );
  const details = [
    {
      label: "Төлөв",
      value: isReviewed ? "Reviewed" : "Pending Review",
    },
    ...(isReviewed
      ? [{ label: "Final score", value: `${currentAttempt.totalScore} / ${totalPoints}` }]
      : []),
    {
      label: "Илгээсэн огноо, цаг",
      value: `${formatMonthDay(submittedAt)} ${formatClock(submittedAt)}`,
    },
    { label: "Нийт асуултын тоо", value: String(exam.questions.length) },
    { label: "Хариулсан асуултын тоо", value: String(answeredCount) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_360px]">
        <section className="overflow-hidden rounded-[28px] border border-[#DCE6FF] bg-[radial-gradient(circle_at_top_left,#EEF4FF_0%,#F8FAFF_45%,#FFFFFF_100%)] p-7 shadow-[0_24px_60px_rgba(36,102,208,0.12)] sm:p-8">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.1em] ${
              isReviewed
                ? "bg-[#ECFDF3] text-[#027A48]"
                : "bg-[#FFF4E5] text-[#B54708]"
            }`}
          >
            {isReviewed ? "Reviewed" : "Pending Review"}
          </span>
          <h1 className="mt-4 text-[32px] font-semibold tracking-[-0.03em] text-[#101828]">
            {exam.title}
          </h1>
          <p className="mt-4 max-w-[760px] text-[16px] leading-7 text-[#475467]">
            {isReviewed
              ? "Багш таны шалгалтыг шалгасан байна. Final score болон feedback доор харагдана."
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
            {isReviewed ? "Final result бэлэн боллоо" : "Багшийн review-г хүлээнэ үү"}
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-[#475467]">
            {isReviewed
              ? "Хэрэв багш нэмэлт тайлбар үлдээсэн бол доорх асуулт бүрийн card дээрээс уншина уу."
              : "Review хийгдсэний дараа энэ хуудас автоматаар Reviewed төлөв, final score, feedback-тайгаар шинэчлэгдэнэ."}
          </p>
          <Link
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-[16px] bg-[#2466D0] text-[15px] font-semibold text-white shadow-[0_16px_36px_rgba(36,102,208,0.28)] transition hover:bg-[#1E56B2]"
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
                    <div>
                      <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#475467]">
                        Таны хариулт
                      </p>
                      {answer ? (
                        <AnswerValue value={answer.value} />
                      ) : (
                        <div className="rounded-md border border-dashed border-[#D0D5DD] bg-white px-3 py-2 text-[14px] text-[#667085]">
                          Хариулт оруулаагүй
                        </div>
                      )}
                    </div>

                    <div className="rounded-md border border-[#D5E3FF] bg-[#EEF4FF] px-4 py-3">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#2466D0]">
                        Feedback
                      </p>
                      <p className="mt-2 text-[14px] leading-6 text-[#344054]">
                        {answer?.feedback?.trim() || "Багш энэ асуултад нэмэлт feedback үлдээгээгүй байна."}
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
