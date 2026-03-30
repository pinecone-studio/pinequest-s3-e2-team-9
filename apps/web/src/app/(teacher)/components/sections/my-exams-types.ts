import type { PassingCriteriaType } from "@/graphql/generated";
import type { MyExamDetailQueryQuery, MyExamsSectionQueryQuery } from "@/graphql/generated";

type IconComponent = (props: { className?: string }) => React.JSX.Element;

export type QueryExamList = MyExamsSectionQueryQuery["exams"][number];
export type QueryExamDetail = NonNullable<MyExamDetailQueryQuery["exam"]>;
export type QueryExam = QueryExamDetail;

export type ExamMetaItem = { icon?: IconComponent; text: string; tone?: string };

export type ExamFooterData =
  | { type: "counts"; students: number; submitted: number }
  | {
      type: "summary";
      students: number;
      submitted: number;
      passRate: number;
      passed: number;
      failed: number;
      average: number;
    };

export type MyExamQuestionPreview = {
  id: string;
  prompt: string;
  topic: string;
  order: number;
  kind: "options" | "text" | "upload";
  points: number;
  typeLabel: string;
  options: string[];
  correctAnswer: string | null;
  answerText: string | null;
};

export type MyExamStudentAnswer = {
  id: string;
  questionId: string;
  prompt: string;
  value: string;
  displayValue: string;
  type: string;
  score: number;
  total: number;
  feedback: string | null;
  submitted: string;
};

export type MyExamStudentRow = {
  id: string;
  name: string;
  subject: string;
  score: number;
  total: number;
  percent: number;
  statusLabel: string;
  statusTone: string;
  submitted: string;
  answers: MyExamStudentAnswer[];
};

export type MyExamListView = {
  id: string;
  title: string;
  subject: string;
  subjectName: string;
  classGrade: number;
  createdDateLabel: string;
  questionCount: number;
  totalPoints: number;
  passingCriteriaType: PassingCriteriaType;
  passingThreshold: number;
  secondaryLabel: string;
  questionCountLabel: string;
  durationLabel: string;
  totalPointsLabel: string;
  status: { label: string; tone: string };
  meta: ExamMetaItem[];
  actions: { view: boolean; results: boolean };
  footer?: ExamFooterData;
  highlight?: boolean;
};

export type MyExamView = MyExamListView & {
  previewQuestions: MyExamQuestionPreview[];
  students: MyExamStudentRow[];
};
