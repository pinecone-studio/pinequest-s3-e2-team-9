/* eslint-disable max-lines */
import { hasPassedExam } from "./my-exams-view-model-utils";
import type { MyExamView } from "./my-exams-types";

type AnalyticsTone = "neutral" | "success" | "warning";

export type ExamAnalyticsInsight = {
  title: string;
  description: string;
  tone: AnalyticsTone;
};

export type ExamAnalyticsBar = {
  label: string;
  value: number;
  meta: string;
  note?: string;
};

export type ExamAnalyticsStudent = {
  name: string;
  percent: number;
  scoreLabel: string;
};

export type ExamAnalyticsWeakTopic = {
  topic: string;
  percent: number;
};

export type ExamAnalyticsData = {
  summary: {
    studentCount: number;
    submittedCount: number;
    averagePercent: number;
    passRate: number;
    highestPercent: number;
    lowestPercent: number;
    completionRate: number;
  };
  scoreDistribution: ExamAnalyticsBar[];
  topicPerformance: ExamAnalyticsBar[];
  questionPerformance: ExamAnalyticsBar[];
  topStudents: ExamAnalyticsStudent[];
  supportStudents: ExamAnalyticsStudent[];
  insights: ExamAnalyticsInsight[];
  overallConclusion: string;
};

const toPercent = (earned: number, possible: number) =>
  possible > 0 ? Math.round((earned / possible) * 100) : 0;

const truncate = (value: string, max = 60) =>
  value.length > max ? `${value.slice(0, max - 3).trimEnd()}...` : value;

export const getStudentWeakTopics = (exam: MyExamView, studentId: string) => {
  const student = exam.students.find((entry) => entry.id === studentId);
  if (!student) {
    return [] as ExamAnalyticsWeakTopic[];
  }

  const topicMap = new Map<string, { earned: number; possible: number }>();

  for (const question of exam.previewQuestions) {
    const answer = student.answers.find((item) => item.questionId === question.id);
    const current = topicMap.get(question.topic) ?? { earned: 0, possible: 0 };
    current.earned += answer?.score ?? 0;
    current.possible += question.points;
    topicMap.set(question.topic, current);
  }

  return [...topicMap.entries()]
    .map(([topic, stats]) => ({
      topic,
      percent: toPercent(stats.earned, stats.possible),
    }))
    .sort((left, right) => left.percent - right.percent)
    .slice(0, 3);
};

export const buildExamAnalytics = (exam: MyExamView): ExamAnalyticsData => {
  const submittedStudents = exam.students.filter(
    (student) => student.statusLabel !== "Явагдаж буй",
  );
  const studentCount = exam.students.length;
  const submittedCount = submittedStudents.length;
  const studentPercents = submittedStudents.map((student) => student.percent);
  const averagePercent = submittedCount
    ? Math.round(
        submittedStudents.reduce((sum, student) => sum + student.percent, 0) /
          submittedCount,
      )
    : 0;
  const highestPercent = studentPercents.length ? Math.max(...studentPercents) : 0;
  const lowestPercent = studentPercents.length ? Math.min(...studentPercents) : 0;
  const passedCount = submittedStudents.filter((student) =>
    hasPassedExam(
      student.score,
      student.total,
      exam.passingCriteriaType,
      exam.passingThreshold,
    ),
  ).length;
  const passRate = submittedCount ? Math.round((passedCount / submittedCount) * 100) : 0;
  const completionRate = studentCount ? Math.round((submittedCount / studentCount) * 100) : 0;

  const scoreRanges = [
    { label: "0-20%", min: 0, max: 20 },
    { label: "21-40%", min: 21, max: 40 },
    { label: "41-60%", min: 41, max: 60 },
    { label: "61-80%", min: 61, max: 80 },
    { label: "81-100%", min: 81, max: 100 },
  ];
  const scoreDistribution = scoreRanges.map((range) => {
    const count = submittedStudents.filter(
      (student) => student.percent >= range.min && student.percent <= range.max,
    ).length;
    return { label: range.label, value: count, meta: `${count} сурагч` };
  });

  const questionPerformance = exam.previewQuestions
    .map((question) => {
      const earned = submittedStudents.reduce((sum, student) => {
        const answer = student.answers.find((item) => item.questionId === question.id);
        return sum + (answer?.score ?? 0);
      }, 0);
      const possible = question.points * submittedCount;
      const accuracy = toPercent(earned, possible);
      const incorrectCount = submittedStudents.filter((student) => {
        const answer = student.answers.find((item) => item.questionId === question.id);
        return (answer?.score ?? 0) < question.points;
      }).length;
      const wrongOptionCounts = new Map<string, number>();

      for (const student of submittedStudents) {
        const answer = student.answers.find((item) => item.questionId === question.id);
        if (!answer?.value || answer.score >= question.points) {
          continue;
        }

        if (
          question.kind === "options" &&
          answer.value !== question.correctAnswer &&
          question.options.includes(answer.value)
        ) {
          wrongOptionCounts.set(
            answer.value,
            (wrongOptionCounts.get(answer.value) ?? 0) + 1,
          );
        }
      }

      const mostChosenWrong = [...wrongOptionCounts.entries()].sort(
        (left, right) => right[1] - left[1],
      )[0];
      return {
        label: `${question.order}. ${truncate(question.prompt, 72)}`,
        value: accuracy,
        meta: `${incorrectCount} сурагч алдсан`,
        topic: question.topic,
        note: mostChosenWrong
          ? `Хамгийн их андуурсан: ${mostChosenWrong[0]} (${mostChosenWrong[1]} сурагч)`
          : undefined,
      };
    })
    .sort((left, right) => left.value - right.value);

  const topicMap = new Map<string, { earned: number; possible: number; questionCount: number }>();
  for (const question of exam.previewQuestions) {
    const topicEntry = topicMap.get(question.topic) ?? {
      earned: 0,
      possible: 0,
      questionCount: 0,
    };
    topicEntry.questionCount += 1;
    topicEntry.possible += question.points * submittedCount;
    topicEntry.earned += submittedStudents.reduce((sum, student) => {
      const answer = student.answers.find((item) => item.questionId === question.id);
      return sum + (answer?.score ?? 0);
    }, 0);
    topicMap.set(question.topic, topicEntry);
  }

  const topicPerformance = [...topicMap.entries()]
    .map(([topic, stats]) => ({
      label: topic,
      value: toPercent(stats.earned, stats.possible),
      meta: `${stats.questionCount} асуулт`,
    }))
    .sort((left, right) => left.value - right.value);

  const rankedStudents = [...submittedStudents].sort((left, right) => right.percent - left.percent);
  const topStudents = rankedStudents.slice(0, 3).map((student) => ({
    name: student.name,
    percent: student.percent,
    scoreLabel: `${student.score}/${student.total}`,
  }));
  const supportStudents = [...rankedStudents]
    .reverse()
    .slice(0, 3)
    .map((student) => ({
      name: student.name,
      percent: student.percent,
      scoreLabel: `${student.score}/${student.total}`,
    }));

  const weakestTopic = topicPerformance[0];
  const hardestQuestion = questionPerformance[0];
  const insights: ExamAnalyticsInsight[] = [];

  if (weakestTopic) {
    insights.push({
      title: "Анхаарах сэдэв",
      description: `${weakestTopic.label} сэдвийн гүйцэтгэл ${weakestTopic.value}% байна. Нэмэлт давтлага төлөвлөхөд тохиромжтой.`,
      tone: weakestTopic.value < 50 ? "warning" : "neutral",
    });
  }

  if (hardestQuestion) {
    insights.push({
      title: "Их алдсан асуулт",
      description: `${hardestQuestion.label} дээр сурагчдын амжилт ${hardestQuestion.value}% байна.`,
      tone: hardestQuestion.value < 40 ? "warning" : "neutral",
    });
  }

  insights.push({
    title: passRate >= 70 ? "Ерөнхий дүн сайн байна" : "Ерөнхий гүйцэтгэл анхаарах түвшинд байна",
    description:
      submittedCount === 0
        ? "Одоогоор дүн шинжилгээ хийх илгээсэн оролдлого алга."
        : `Тэнцсэн хувь ${passRate}%, дундаж оноо ${averagePercent}%, хамрагдалт ${completionRate}% байна.`,
    tone: passRate >= 70 ? "success" : "warning",
  });

  const overallConclusion =
    submittedCount === 0
      ? "Одоогоор илгээсэн оролдлого байхгүй тул нэгтгэсэн дүгнэлт гарсангүй."
      : weakestTopic && hardestQuestion
        ? `${exam.title} шалгалтад ${submittedCount} сурагч оролцож, дундаж амжилт ${averagePercent}% гарлаа. Хамгийн их анхаарах сэдэв нь ${weakestTopic.label}, харин хамгийн их алдаа гарсан асуулт нь ${hardestQuestion.label} байна. Тэнцсэн хувь ${passRate}% байгаа тул дараагийн давтлагыг эдгээр сул хэсгүүдэд төвлөрүүлбэл илүү үр дүнтэй.`
        : `${exam.title} шалгалтад ${submittedCount} сурагч оролцож, дундаж амжилт ${averagePercent}% гарлаа. Тэнцсэн хувь ${passRate}% байна.`;

  return {
    summary: {
      studentCount,
      submittedCount,
      averagePercent,
      passRate,
      highestPercent,
      lowestPercent,
      completionRate,
    },
    scoreDistribution,
    topicPerformance,
    questionPerformance: questionPerformance.slice(0, 5),
    topStudents,
    supportStudents,
    insights,
    overallConclusion,
  };
};
