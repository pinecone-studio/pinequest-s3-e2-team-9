/* eslint-disable max-lines */
export type CurriculumSubject = {
  name: string;
  topics: string[];
};

export type CurriculumTopicGroup = {
  name: string;
  topics: string[];
};

export type CurriculumGrade = {
  grade: number;
  subjects: CurriculumSubject[];
};

const SHARED_SUBJECTS = [
  "Монгол хэл",
  "Математик",
  "Физик",
  "Хими",
  "Биологи",
  "Англи хэл",
  "Түүх",
  "Мэдээлэл зүй",
] as const;

const TENTH_GRADE_TOPIC_OVERRIDES: Record<string, string[]> = {
  Математик: [
    "Алгебр",
    "Функц",
    "Илэрхийлэл",
    "Тэгшитгэл",
    "Тэгшитгэлийн систем",
    "Геометр",
    "Тригонометр",
    "Логарифм",
    "Магадлал",
    "Статистик",
    "Вектор",
    "Дараалал",
    "Тэгш бус",
    "Процент",
    "Харьцаа",
  ],
  "Монгол хэл": [
    "Үг зүй",
    "Өгүүлбэр зүй",
    "Найруулга",
    "Уншлага",
    "Үг бүтэх ёс",
    "Цэг таслал",
    "Эхийн бүтэц",
    "Утга зүй",
    "Яруу найраг",
    "Ярианы соёл",
    "Эхийн уялдаа",
    "Уран зохиол",
  ],
  Физик: [
    "Механик",
    "Динамик",
    "Энерги",
    "Даралт",
    "Нягт",
    "Дулаан",
    "Цахилгаан",
    "Хэлхээ",
    "Соронзон орон",
    "Гэрэл",
    "Долгион",
    "Ажил",
    "Чадал",
    "Импульс",
    "Хүч",
  ],
};

const TENTH_GRADE_TOPIC_GROUPS: Record<string, CurriculumTopicGroup[]> = {
  Математик: [
    {
      name: "Алгебр ба илэрхийлэл",
      topics: ["Алгебр", "Илэрхийлэл"],
    },
    {
      name: "Тэгшитгэл",
      topics: ["Тэгшитгэл", "Тэгшитгэлийн систем", "Тэгш бус"],
    },
    {
      name: "Функц",
      topics: ["Функц", "Дараалал"],
    },
    {
      name: "Геометр ба тригонометр",
      topics: ["Геометр", "Тригонометр", "Вектор"],
    },
    {
      name: "Магадлал ба статистик",
      topics: ["Магадлал", "Статистик", "Процент", "Харьцаа"],
    },
    {
      name: "Логарифм",
      topics: ["Логарифм"],
    },
  ],
  "Монгол хэл": [
    {
      name: "Хэл зүй",
      topics: ["Үг зүй", "Өгүүлбэр зүй", "Үг бүтэх ёс", "Цэг таслал", "Утга зүй"],
    },
    {
      name: "Найруулга ба эх",
      topics: ["Найруулга", "Эхийн бүтэц", "Эхийн уялдаа", "Ярианы соёл"],
    },
    {
      name: "Уншлага ба уран зохиол",
      topics: ["Уншлага", "Уран зохиол", "Яруу найраг"],
    },
  ],
  Физик: [
    {
      name: "Механик",
      topics: ["Механик", "Динамик", "Хүч", "Импульс", "Даралт", "Нягт"],
    },
    {
      name: "Дулаан",
      topics: ["Дулаан", "Энерги", "Ажил", "Чадал"],
    },
    {
      name: "Цахилгаан",
      topics: ["Цахилгаан", "Хэлхээ", "Соронзон орон"],
    },
    {
      name: "Гэрэл ба долгион",
      topics: ["Гэрэл", "Долгион"],
    },
    {
      name: "Ерөнхий бодлого",
      topics: ["Ерөнхий сэдэв"],
    },
  ],
};

const buildGradeSubjects = (grade: number): CurriculumSubject[] =>
  SHARED_SUBJECTS.map((subject) => ({
    name: subject,
    topics:
      grade === 10
        ? TENTH_GRADE_TOPIC_OVERRIDES[subject] ?? ["Ерөнхий сэдэв"]
        : ["Ерөнхий сэдэв"],
  }));

export const QUESTION_BANK_CURRICULUM: CurriculumGrade[] = Array.from(
  { length: 7 },
  (_, index) => ({
    grade: index + 6,
    subjects: buildGradeSubjects(index + 6),
  }),
);

export const getCurriculumGrades = () =>
  QUESTION_BANK_CURRICULUM.map((entry) => entry.grade);

export const getCurriculumSubjects = (grade: number) =>
  QUESTION_BANK_CURRICULUM.find((entry) => entry.grade === grade)?.subjects ?? [];

export const getCurriculumTopics = (grade: number, subject: string) =>
  getCurriculumSubjects(grade).find((entry) => entry.name === subject)?.topics ?? [];

export const getCurriculumTopicGroups = (
  grade: number,
  subject: string,
): CurriculumTopicGroup[] => {
  const grouped = grade === 10 ? TENTH_GRADE_TOPIC_GROUPS[subject] : undefined;

  if (grouped?.length) {
    return grouped;
  }

  return getCurriculumTopics(grade, subject).map((topic) => ({
    name: topic,
    topics: [topic],
  }));
};

export const getCurriculumTopicGroupName = (
  grade: number,
  subject: string,
  topic: string,
) =>
  getCurriculumTopicGroups(grade, subject).find((entry) => entry.topics.includes(topic))?.name ??
  topic;
