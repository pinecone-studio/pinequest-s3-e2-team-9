export type QuestionBankItem = {
  title: string;
  description: string;
  subject: string;
  questions: string;
  date: string;
};

export const questionBankItems: QuestionBankItem[] = [
  {
    title: "Калькулусын үндэс",
    description: "Калькулусын үндсэн ойлголт ба бодлогууд",
    subject: "Математик",
    questions: "4 асуулт",
    date: "2024.01.01",
  },
  {
    title: "Физикийн механик",
    description: "Ньютоны хууль болон хөдөлгөөний бодлогууд",
    subject: "Физик",
    questions: "4 асуулт",
    date: "2024.01.05",
  },
  {
    title: "Органик хими",
    description: "Органик нэгдлүүд ба урвалууд",
    subject: "Хими",
    questions: "4 асуулт",
    date: "2024.01.10",
  },
  {
    title: "Эсийн биологи",
    description: "Эсийн бүтэц ба үүрэг",
    subject: "Биологи",
    questions: "2 асуулт",
    date: "2024.01.15",
  },
];
