import type { MyExamsQueryQuery } from "@/graphql/generated";

type IconComponent = (props: { className?: string }) => React.JSX.Element;

export type QueryExam = MyExamsQueryQuery["exams"][number];

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
  kind: "options" | "text" | "upload";
  options: string[];
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
};

export type MyExamView = {
  id: string;
  title: string;
  subject: string;
  status: { label: string; tone: string };
  meta: ExamMetaItem[];
  actions: { view: boolean; results: boolean };
  footer?: ExamFooterData;
  highlight?: boolean;
  previewQuestions: MyExamQuestionPreview[];
  students: MyExamStudentRow[];
};
