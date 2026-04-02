/* eslint-disable max-lines */
"use client";

type AccessRequestItem = {
  id: string;
  questionId: string;
  questionTitle: string;
  requesterName: string;
  ownerName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  reviewedAt?: string | null;
};

type QuestionAccessRequestsPanelProps = {
  incoming: AccessRequestItem[];
  outgoing: AccessRequestItem[];
  reviewingRequestId?: string | null;
  onApprove: (requestId: string) => Promise<void> | void;
  onReject: (requestId: string) => Promise<void> | void;
};

const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("mn-MN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};

const getStatusLabel = (status: AccessRequestItem["status"]) => {
  switch (status) {
    case "APPROVED":
      return "Зөвшөөрсөн";
    case "REJECTED":
      return "Татгалзсан";
    default:
      return "Хүлээгдэж байна";
  }
};

const getStatusTone = (status: AccessRequestItem["status"]) => {
  switch (status) {
    case "APPROVED":
      return "border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]";
    case "REJECTED":
      return "border-[#FECACA] bg-[#FEF2F2] text-[#B42318]";
    default:
      return "border-[#B2DDFF] bg-[#EFF8FF] text-[#175CD3]";
  }
};

function AccessRequestCard({
  item,
  reviewingRequestId,
  showReviewActions,
  onApprove,
  onReject,
}: {
  item: AccessRequestItem;
  reviewingRequestId?: string | null;
  showReviewActions: boolean;
  onApprove: (requestId: string) => Promise<void> | void;
  onReject: (requestId: string) => Promise<void> | void;
}) {
  const isReviewing = reviewingRequestId === item.id;

  return (
    <div className="rounded-xl border border-[#E4E7EC] bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[14px] font-semibold text-[#101828]">{item.questionTitle}</p>
          <p className="text-[12px] text-[#667085]">
            {showReviewActions
              ? `${item.requesterName} энэ асуултыг ашиглах хүсэлт илгээсэн`
              : `${item.ownerName}-д ${item.requesterName} нэрээр хүсэлт илгээсэн`}
          </p>
          <p className="text-[12px] text-[#98A2B3]">
            Илгээсэн: {formatDateTime(item.createdAt)}
            {item.reviewedAt ? ` · Шийдсэн: ${formatDateTime(item.reviewedAt)}` : ""}
          </p>
        </div>
        <span
          className={`inline-flex rounded-full border px-2 py-1 text-[12px] font-medium ${getStatusTone(item.status)}`}
        >
          {getStatusLabel(item.status)}
        </span>
      </div>

      {showReviewActions && item.status === "PENDING" ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md bg-[#00267F] px-4 text-[13px] font-medium text-white disabled:cursor-not-allowed disabled:bg-[#98A2B3]"
            disabled={isReviewing}
            onClick={() => void onApprove(item.id)}
          >
            {isReviewing ? "Шийдэж байна..." : "Зөвшөөрөх"}
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md border border-[#D0D5DD] px-4 text-[13px] font-medium text-[#344054] disabled:cursor-not-allowed disabled:text-[#98A2B3]"
            disabled={isReviewing}
            onClick={() => void onReject(item.id)}
          >
            Татгалзах
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function QuestionAccessRequestsPanel({
  incoming,
  outgoing,
  reviewingRequestId = null,
  onApprove,
  onReject,
}: QuestionAccessRequestsPanelProps) {
  if (!incoming.length && !outgoing.length) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-[20px] border border-[#DFE1E5] bg-[#FCFCFD] p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.08)]">
      <div>
        <h2 className="text-[18px] font-semibold text-[#101828]">Асуултын хүсэлтүүд</h2>
        <p className="mt-1 text-[13px] text-[#667085]">
          Зөвшөөрөл шаарддаг асуултын ашиглалтын хүсэлтүүд энд харагдана.
        </p>
      </div>

      {incoming.length ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-[#101828]">Надад ирсэн хүсэлтүүд</h3>
            <span className="text-[12px] text-[#667085]">{incoming.length} хүсэлт</span>
          </div>
          <div className="space-y-3">
            {incoming.map((item) => (
              <AccessRequestCard
                key={item.id}
                item={item}
                reviewingRequestId={reviewingRequestId}
                showReviewActions
                onApprove={onApprove}
                onReject={onReject}
              />
            ))}
          </div>
        </div>
      ) : null}

      {outgoing.length ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-[#101828]">Миний илгээсэн хүсэлтүүд</h3>
            <span className="text-[12px] text-[#667085]">{outgoing.length} хүсэлт</span>
          </div>
          <div className="space-y-3">
            {outgoing.map((item) => (
              <AccessRequestCard
                key={item.id}
                item={item}
                reviewingRequestId={reviewingRequestId}
                showReviewActions={false}
                onApprove={onApprove}
                onReject={onReject}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
