import type { MyExamView } from "./my-exams-types";

export const truncate = (value: string, length: number) =>
  value.length > length ? `${value.slice(0, length).trimEnd()}...` : value;

const escapeCsv = (value: string | number) =>
  `"${String(value).replaceAll('"', '""')}"`;

export const buildReportRows = (exam: MyExamView) =>
  exam.previewQuestions.map((question) => {
    const scores = exam.students.map((student) => {
      const answer = student.answers.find((item) => item.questionId === question.id);
      return answer ? `${answer.score}/${question.points}` : "-";
    });
    const earnedTotal = exam.students.reduce((sum, student) => {
      const answer = student.answers.find((item) => item.questionId === question.id);
      return sum + (answer?.score ?? 0);
    }, 0);
    const maxTotal = question.points * exam.students.length;

    return {
      id: question.id,
      prompt: question.prompt,
      total: question.points,
      scores,
      earnedTotal,
      percent: maxTotal > 0 ? Math.round((earnedTotal / maxTotal) * 100) : 0,
    };
  });

export const downloadExamReportCsv = (
  exam: MyExamView,
  rows: ReturnType<typeof buildReportRows>,
) => {
  const header = [
    "Асуулт",
    ...exam.students.map((student) => student.name),
    "Нийт оноо",
    "Хувь",
  ];
  const body = rows.map((row) => [
    row.prompt,
    ...row.scores,
    `${row.earnedTotal}/${row.total * exam.students.length}`,
    `${row.percent}%`,
  ]);
  const footer = [
    ["Нийт оноо", ...exam.students.map((student) => `${student.score}/${student.total}`), "", ""],
    ["Хувь", ...exam.students.map((student) => `${student.percent}%`), "", ""],
  ];
  const csv = [header, ...body, ...footer]
    .map((line) => line.map(escapeCsv).join(","))
    .join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${exam.title}-tailan.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
