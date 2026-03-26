export type ExamCard = {
  id: string;
  title: string;
  classLabel: string;
  tags: string[];
  passRate: number;
  passed: number;
  failed: number;
  average: number;
};

export const exams: ExamCard[] = [
  {
    id: "math-final",
    title: "Математикийн эцсийн шалгалт",
    classLabel: "Ангид оноогоогүй",
    tags: ["14 асуулт", "40 минут", "30 оноо"],
    passRate: 85,
    passed: 20,
    failed: 4,
    average: 78,
  },
  {
    id: "physics-mid",
    title: "Физикийн улирлын шалгалт",
    classLabel: "Ангид оноогоогүй",
    tags: ["14 асуулт", "40 минут", "30 оноо"],
    passRate: 85,
    passed: 20,
    failed: 4,
    average: 78,
  },
  {
    id: "chem-quiz",
    title: "Химийн сорил",
    classLabel: "Ангид оноогоогүй",
    tags: ["14 асуулт", "40 минут", "30 оноо"],
    passRate: 85,
    passed: 20,
    failed: 4,
    average: 78,
  },
  {
    id: "bio-scheduled",
    title: "Биологийн шалгалт",
    classLabel: "Ангид оноогоогүй",
    tags: ["14 асуулт", "40 минут", "30 оноо"],
    passRate: 85,
    passed: 20,
    failed: 4,
    average: 78,
  },
  {
    id: "physics-elective",
    title: "Сонгон физикийн шалгалт",
    classLabel: "Ангид оноогоогүй",
    tags: ["14 асуулт", "40 минут", "30 оноо"],
    passRate: 85,
    passed: 20,
    failed: 4,
    average: 78,
  },
];
