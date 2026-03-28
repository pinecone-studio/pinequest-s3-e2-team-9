export type CurriculumSubject = {
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
