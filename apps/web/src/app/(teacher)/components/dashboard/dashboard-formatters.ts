const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("mn-MN", {
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export const clampPercent = (value: number): number =>
  Math.max(0, Math.min(100, Math.round(value)));

export const formatDashboardDateTime = (value: string): string => {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return "Огноо тодорхойгүй";
  }

  return DATE_TIME_FORMATTER.format(new Date(parsed));
};

export const formatQuestionCount = (count: number): string =>
  `${count.toLocaleString("mn-MN")} асуулт`;

export const formatReviewSubtitle = (count: number): string =>
  count > 0 ? `${count.toLocaleString("mn-MN")} хянагдаагүй` : "Шалгах зүйл алга";

export const formatDraftSubtitle = (draftCount: number, ongoingCount: number): string => {
  if (draftCount > 0) {
    return `${draftCount.toLocaleString("mn-MN")} ноорог шалгалт`;
  }

  return ongoingCount > 0
    ? `${ongoingCount.toLocaleString("mn-MN")} явагдаж байна`
    : "Ноорог шалгалт алга";
};

export const formatScheduledSubtitle = (count: number): string =>
  count > 0 ? "удахгүй болох шалгалт" : "товлосон шалгалт алга";
