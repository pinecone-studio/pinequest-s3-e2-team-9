export type QuestionType =
  | "TRUE_FALSE"
  | "MULTIPLE_CHOICE"
  | "SHORT_TEXT"
  | "IMAGE_UPLOAD";

export type QuestionDifficulty = "easy" | "medium" | "hard";

export type QuestionOption = {
  id: string;
  text: string;
};

export type MockQuestion = {
  id: string;
  type: QuestionType;
  topic: string;
  prompt: string;
  points: number;
  difficulty: QuestionDifficulty;
  answer?: string;
  options?: QuestionOption[];
  evaluationHint?: string;
};

export type QuestionBank = {
  id: string;
  title: string;
  description: string;
  subject: string;
  date: string;
  questions: MockQuestion[];
};

export type QuestionBankItem = {
  id?: string;
  title: string;
  description: string;
  subject: string;
  questions: string;
  date: string;
};

export const formatQuestionBankDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

export const inferQuestionBankSubject = (
  title: string,
  description?: string | null,
): string => {
  const content = `${title} ${description ?? ""}`.toLowerCase();

  if (content.includes("мат")) {
    return "Математик";
  }

  if (content.includes("монгол")) {
    return "Монгол хэл";
  }

  if (content.includes("физ")) {
    return "Физик";
  }

  if (content.includes("хими")) {
    return "Хими";
  }

  if (content.includes("биолог")) {
    return "Биологи";
  }

  return "Асуултын сан";
};

type MultipleChoiceSeed = {
  topic: string;
  prompt: string;
  options: [string, string, string, string];
  answer: string;
  difficulty?: QuestionDifficulty;
};

type SimpleSeed = {
  topic: string;
  prompt: string;
  answer: string;
  difficulty?: QuestionDifficulty;
  evaluationHint?: string;
};

const createTrueFalseQuestions = (
  prefix: string,
  seeds: SimpleSeed[],
): MockQuestion[] =>
  seeds.map((seed, index) => ({
    id: `${prefix}-tf-${index + 1}`,
    type: "TRUE_FALSE",
    topic: seed.topic,
    prompt: seed.prompt,
    points: 1,
    difficulty: seed.difficulty ?? "easy",
    answer: seed.answer,
    evaluationHint: seed.evaluationHint,
  }));

const createMultipleChoiceQuestions = (
  prefix: string,
  seeds: MultipleChoiceSeed[],
): MockQuestion[] =>
  seeds.map((seed, index) => ({
    id: `${prefix}-mc-${index + 1}`,
    type: "MULTIPLE_CHOICE",
    topic: seed.topic,
    prompt: seed.prompt,
    points: 2,
    difficulty: seed.difficulty ?? "medium",
    answer: seed.answer,
    options: seed.options.map((option, optionIndex) => ({
      id: `${prefix}-mc-${index + 1}-opt-${optionIndex + 1}`,
      text: option,
    })),
  }));

const createShortTextQuestions = (
  prefix: string,
  seeds: SimpleSeed[],
): MockQuestion[] =>
  seeds.map((seed, index) => ({
    id: `${prefix}-st-${index + 1}`,
    type: "SHORT_TEXT",
    topic: seed.topic,
    prompt: seed.prompt,
    points: 3,
    difficulty: seed.difficulty ?? "medium",
    answer: seed.answer,
    evaluationHint: seed.evaluationHint,
  }));

const createImageUploadQuestions = (
  prefix: string,
  seeds: SimpleSeed[],
): MockQuestion[] =>
  seeds.map((seed, index) => ({
    id: `${prefix}-img-${index + 1}`,
    type: "IMAGE_UPLOAD",
    topic: seed.topic,
    prompt: seed.prompt,
    points: 4,
    difficulty: seed.difficulty ?? "hard",
    answer: seed.answer,
    evaluationHint: seed.evaluationHint,
  }));

const createQuestionBank = (bank: QuestionBank): QuestionBank => {
  const trueFalseCount = bank.questions.filter(
    (question) => question.type === "TRUE_FALSE",
  ).length;
  const multipleChoiceCount = bank.questions.filter(
    (question) => question.type === "MULTIPLE_CHOICE",
  ).length;
  const shortTextCount = bank.questions.filter(
    (question) => question.type === "SHORT_TEXT",
  ).length;
  const imageUploadCount = bank.questions.filter(
    (question) => question.type === "IMAGE_UPLOAD",
  ).length;

  if (
    bank.questions.length !== 50 ||
    trueFalseCount !== 10 ||
    multipleChoiceCount !== 24 ||
    shortTextCount !== 8 ||
    imageUploadCount !== 8
  ) {
    throw new Error(
      `${bank.subject} банкын асуултын бүтэц буруу байна. 10/24/8/8 хуваарилалт шаардлагатай.`,
    );
  }

  return bank;
};

const mathQuestions = [
  ...createTrueFalseQuestions("math-10", [
    {
      topic: "Алгебр",
      prompt: "y = 2x + 3 функц нь шугаман функц мөн.",
      answer: "Үнэн",
    },
    {
      topic: "Алгебр",
      prompt: "Квадрат тэгшитгэл заавал хоёр ялгаатай бодит шийдтэй байдаг.",
      answer: "Худал",
    },
    {
      topic: "Функц",
      prompt: "f(x) = x² функцийн график нь парабол байна.",
      answer: "Үнэн",
    },
    {
      topic: "Илэрхийлэл",
      prompt: "sqrt(49) = ±7 гэж бичих нь зөв.",
      answer: "Худал",
    },
    {
      topic: "Тригонометр",
      prompt: "sin 30° = 1/2.",
      answer: "Үнэн",
    },
    {
      topic: "Тригонометр",
      prompt: "cos 90° = 1.",
      answer: "Худал",
    },
    {
      topic: "Магадлал",
      prompt: "Магадлалын утга 0-оос 1-ийн хооронд байна.",
      answer: "Үнэн",
    },
    {
      topic: "Геометр",
      prompt: "Гурвалжны дотоод өнцгүүдийн нийлбэр 360° байна.",
      answer: "Худал",
    },
    {
      topic: "Логарифм",
      prompt: "log10 100 = 2.",
      answer: "Үнэн",
    },
    {
      topic: "Вектор",
      prompt: "Тэг векторын урт 1-тэй тэнцүү.",
      answer: "Худал",
    },
  ]),
  ...createMultipleChoiceQuestions("math-10", [
    {
      topic: "Алгебр",
      prompt: "2x + 5 = 17 тэгшитгэлийн шийдийг ол.",
      options: ["x = 5", "x = 6", "x = 7", "x = 8"],
      answer: "x = 6",
      difficulty: "easy",
    },
    {
      topic: "Алгебр",
      prompt: "x² - 9 = 0 тэгшитгэлийн нэг шийд аль нь вэ?",
      options: ["x = 0", "x = 2", "x = 3", "x = 9"],
      answer: "x = 3",
      difficulty: "easy",
    },
    {
      topic: "Илэрхийлэл",
      prompt: "(a + b)² илэрхийллийг зөв задласан нь аль вэ?",
      options: [
        "a² + b²",
        "a² + 2ab + b²",
        "2a² + 2b²",
        "a² - 2ab + b²",
      ],
      answer: "a² + 2ab + b²",
    },
    {
      topic: "Функц",
      prompt: "f(x) = 3x - 4 үед f(2)-ийн утгыг ол.",
      options: ["2", "3", "4", "5"],
      answer: "2",
      difficulty: "easy",
    },
    {
      topic: "Функц",
      prompt: "y = x² + 1 функцийн орой цэг аль нь вэ?",
      options: ["(0, 1)", "(1, 0)", "(-1, 0)", "(0, -1)"],
      answer: "(0, 1)",
    },
    {
      topic: "Геометр",
      prompt: "Тэгш өнцөгт гурвалжинд Пифагорын теорем аль хэлбэрээр зөв бичигдэх вэ?",
      options: ["a + b = c", "a² + b² = c²", "a² - b² = c²", "2ab = c²"],
      answer: "a² + b² = c²",
    },
    {
      topic: "Геометр",
      prompt: "Радиус нь 7 см тойргийн диаметр хэд вэ?",
      options: ["7 см", "14 см", "21 см", "49 см"],
      answer: "14 см",
      difficulty: "easy",
    },
    {
      topic: "Тригонометр",
      prompt: "sin 90° хэдтэй тэнцүү вэ?",
      options: ["0", "1/2", "1", "-1"],
      answer: "1",
      difficulty: "easy",
    },
    {
      topic: "Тригонометр",
      prompt: "cos 0° хэдтэй тэнцүү вэ?",
      options: ["0", "1", "-1", "1/2"],
      answer: "1",
      difficulty: "easy",
    },
    {
      topic: "Магадлал",
      prompt: "Шударга зоос нэг шидэхэд сүлд гарах магадлал хэд вэ?",
      options: ["1/4", "1/3", "1/2", "1"],
      answer: "1/2",
      difficulty: "easy",
    },
    {
      topic: "Статистик",
      prompt: "2, 4, 6, 8 тоонуудын арифметик дундаж хэд вэ?",
      options: ["4", "5", "6", "7"],
      answer: "5",
      difficulty: "easy",
    },
    {
      topic: "Логарифм",
      prompt: "log2 8 хэд вэ?",
      options: ["2", "3", "4", "8"],
      answer: "3",
    },
    {
      topic: "Илэрхийлэл",
      prompt: "sqrt(81)-ийн утгыг ол.",
      options: ["7", "8", "9", "18"],
      answer: "9",
      difficulty: "easy",
    },
    {
      topic: "Тэгшитгэл",
      prompt: "3(x - 2) = 12 тэгшитгэлийн шийд аль нь вэ?",
      options: ["x = 2", "x = 4", "x = 6", "x = 8"],
      answer: "x = 6",
      difficulty: "easy",
    },
    {
      topic: "Функц",
      prompt: "Шугаман функцийн ерөнхий хэлбэр аль нь вэ?",
      options: ["ax² + bx + c", "ax + b", "a/x", "a^x"],
      answer: "ax + b",
    },
    {
      topic: "Геометр",
      prompt: "Квадратын тал 5 см бол талбай хэд вэ?",
      options: ["10 см²", "20 см²", "25 см²", "30 см²"],
      answer: "25 см²",
      difficulty: "easy",
    },
    {
      topic: "Геометр",
      prompt: "Тэгш өнцөгтийн урт 8 см, өргөн 3 см бол периметр хэд вэ?",
      options: ["11 см", "22 см", "24 см", "16 см"],
      answer: "22 см",
      difficulty: "easy",
    },
    {
      topic: "Тригонометр",
      prompt: "tan 45° хэдтэй тэнцүү вэ?",
      options: ["0", "1", "sqrt(3)", "1/2"],
      answer: "1",
    },
    {
      topic: "Магадлал",
      prompt: "1-ээс 6 хүртэл тоотой шоог нэг шидэхэд тэгш тоо гарах магадлал хэд вэ?",
      options: ["1/6", "1/3", "1/2", "2/3"],
      answer: "1/2",
    },
    {
      topic: "Вектор",
      prompt: "Векторын уртыг өөрөөр юу гэж нэрлэдэг вэ?",
      options: ["Өнцөг", "Модуль", "Координат", "Скаляр"],
      answer: "Модуль",
    },
    {
      topic: "Дараалал",
      prompt: "2, 5, 8, 11, ... дарааллын ялгавар хэд вэ?",
      options: ["2", "3", "4", "5"],
      answer: "3",
    },
    {
      topic: "Тэгш бус",
      prompt: "x > 3 нөхцөлийг хангах тоо аль нь вэ?",
      options: ["1", "2", "3", "4"],
      answer: "4",
      difficulty: "easy",
    },
    {
      topic: "Процент",
      prompt: "200-ийн 15% хэд вэ?",
      options: ["15", "20", "25", "30"],
      answer: "30",
    },
    {
      topic: "Харьцаа",
      prompt: "6:9 харьцааг хамгийн энгийн хэлбэрт оруулбал аль нь вэ?",
      options: ["1:2", "2:3", "3:4", "6:3"],
      answer: "2:3",
      difficulty: "easy",
    },
  ]),
  ...createShortTextQuestions("math-10", [
    {
      topic: "Алгебр",
      prompt: "x² - 5x + 6 = 0 тэгшитгэлийн хоёр шийдийг бич.",
      answer: "x = 2, x = 3",
    },
    {
      topic: "Функц",
      prompt: "f(x) = 2x² функцийн f(3)-ийн утгыг ол.",
      answer: "18",
      difficulty: "easy",
    },
    {
      topic: "Геометр",
      prompt: "Талбай нь 36 см² квадратын талын уртыг бич.",
      answer: "6 см",
    },
    {
      topic: "Тригонометр",
      prompt: "sin 30° + cos 60° нийлбэрийг ол.",
      answer: "1",
    },
    {
      topic: "Логарифм",
      prompt: "log10 1000 хэд вэ?",
      answer: "3",
    },
    {
      topic: "Статистик",
      prompt: "5, 7, 7, 8, 10 өгөгдлийн медианыг ол.",
      answer: "7",
    },
    {
      topic: "Магадлал",
      prompt: "10 улаан, 5 цэнхэр бөмбөгтэй уутнаас нэг бөмбөг авахад цэнхэр гарах магадлалыг бутархайгаар бич.",
      answer: "1/3",
    },
    {
      topic: "Вектор",
      prompt: "A(1,2), B(4,6) бол AB векторын координатыг ол.",
      answer: "(3,4)",
    },
  ]),
  ...createImageUploadQuestions("math-10", [
    {
      topic: "Алгебр",
      prompt: "x² + 7x + 10 = 0 тэгшитгэлийг бодож, алхамтай нооргийн зургаа оруул.",
      answer: "x = -5, x = -2",
      evaluationHint: "Үржвэрээр задлах эсвэл томьёо хэрэглэсэн алхам харагдах ёстой.",
    },
    {
      topic: "Геометр",
      prompt: "Пифагорын теоремоор катет 6, 8 үед гипотенузыг олж, зурагтай тайлбарласан хуудсаа оруул.",
      answer: "10",
      evaluationHint: "Тэгш өнцөгт гурвалжны зураг, a² + b² = c² хэрэглэсэн байдал шалгана.",
    },
    {
      topic: "Функц",
      prompt: "y = -x² + 4x + 5 параболын оройг олж, графикийн ноорог зурсан зургаа оруул.",
      answer: "Орой нь (2, 9)",
      evaluationHint: "Орой, тэнхлэг, чиглэлийг зөв тэмдэглэсэн эсэхийг шалгана.",
    },
    {
      topic: "Тригонометр",
      prompt: "sin θ = 3/5 үед cos θ-г олох бодолтын зургаа оруул.",
      answer: "4/5",
      evaluationHint: "Тэгш өнцөгт гурвалжны холбоо ашигласан эсэхийг шалгана.",
    },
    {
      topic: "Статистик",
      prompt: "Өгөгдөл: 2, 3, 3, 5, 7, 7, 7, 9. Дундаж, медиан, моодыг олсон хүснэгтээ зураг болгон оруул.",
      answer: "Дундаж 5.375, медиан 6, моод 7",
      evaluationHint: "Тоолол, эрэмбэлэлт, 3 хэмжигдэхүүн бүгд байх ёстой.",
    },
    {
      topic: "Процент",
      prompt: "120,000 төгрөгийн үнийн 15%-ийн хямдрал бодсон ноорог зургаа оруул.",
      answer: "18,000 төгрөгийн хямдрал, эцсийн үнэ 102,000 төгрөг",
      evaluationHint: "Процент бодсон алхам, эцсийн хариу хоёуланг харна.",
    },
    {
      topic: "Геометр",
      prompt: "Тойргийн урт олох томьёог ашиглан r = 7 см үед уртыг бодсон зургаа оруул.",
      answer: "14π см",
      evaluationHint: "C = 2πr томьёо хэрэглэсэн байх.",
    },
    {
      topic: "Тэгшитгэлийн систем",
      prompt: "x + y = 7, x - y = 1 системийг бодсон алхамтай хуудсаа зураг болгон оруул.",
      answer: "x = 4, y = 3",
      evaluationHint: "Нэмэх/хасах аргаар бодсон алхмыг шалгана.",
    },
  ]),
];

const mongolianQuestions = [
  ...createTrueFalseQuestions("mn-10", [
    {
      topic: "Үг зүй",
      prompt: "Нэр үг нь юм, үзэгдэл, хүнийг нэрлэдэг ай юм.",
      answer: "Үнэн",
    },
    {
      topic: "Өгүүлбэр зүй",
      prompt: "Өгүүлбэр заавал нэг л үгтэй байна.",
      answer: "Худал",
    },
    {
      topic: "Найруулга",
      prompt: "Албан бичгийн найруулгад товч, тодорхой хэллэг чухал.",
      answer: "Үнэн",
    },
    {
      topic: "Уншлага",
      prompt: "Гол санаа нь эхийн хамгийн жижиг баримт мэдээлэл юм.",
      answer: "Худал",
    },
    {
      topic: "Үг бүтэх ёс",
      prompt: "Үгийн язгуур нь үгийн үндсэн утгыг илэрхийлдэг.",
      answer: "Үнэн",
    },
    {
      topic: "Цэг таслал",
      prompt: "Асуух өгүүлбэрийн төгсгөлд цэг тавина.",
      answer: "Худал",
    },
    {
      topic: "Эхийн бүтэц",
      prompt: "Эх нь оршил, гол хэсэг, төгсгөлтэй байж болно.",
      answer: "Үнэн",
    },
    {
      topic: "Утга зүй",
      prompt: "Эсрэг утгатай үгсийг ойролцоо утгатай үг гэдэг.",
      answer: "Худал",
    },
    {
      topic: "Яруу найраг",
      prompt: "Уран дүрслэл нь зохиолын илэрхийллийг баяжуулдаг.",
      answer: "Үнэн",
    },
    {
      topic: "Ярианы соёл",
      prompt: "Сонсогчийг үл тоосон өнгө аястай ярих нь зөв харилцаа мөн.",
      answer: "Худал",
    },
  ]),
  ...createMultipleChoiceQuestions("mn-10", [
    {
      topic: "Үг зүй",
      prompt: "Дараах үгсээс нэр үгийг ол.",
      options: ["сайхан", "гүйх", "ном", "улаан"],
      answer: "ном",
      difficulty: "easy",
    },
    {
      topic: "Үг зүй",
      prompt: "Дараах үгсээс үйл үгийг ол.",
      options: ["инээх", "өндөр", "цаас", "шинэ"],
      answer: "инээх",
      difficulty: "easy",
    },
    {
      topic: "Өгүүлбэр зүй",
      prompt: "Эзэн биегүй өгүүлбэр аль нь вэ?",
      options: [
        "Би ном уншив.",
        "Гадаа салхилж байна.",
        "Эгч хоол хийв.",
        "Багш тайлбарлав.",
      ],
      answer: "Гадаа салхилж байна.",
    },
    {
      topic: "Цэг таслал",
      prompt: "Холбох үгээр холбогдсон зэрэгцсэн өгүүлбэрийн хооронд ихэвчлэн ямар тэмдэг тавих вэ?",
      options: ["Таслал", "Цэг", "Асуултын тэмдэг", "Хашилт"],
      answer: "Таслал",
    },
    {
      topic: "Найруулга",
      prompt: "Албан бичгийн хэлэнд хамгийн тохиромжтой үг хэллэг аль нь вэ?",
      options: [
        "ёстой мундаг",
        "алга урвуулахын зуур",
        "шаардлагатай гэж үзэв",
        "хөөрхөн санагдлаа",
      ],
      answer: "шаардлагатай гэж үзэв",
    },
    {
      topic: "Уншлага",
      prompt: "Эхийн гол санааг тодорхойлохдоо юуг илүү анхаарах вэ?",
      options: [
        "Нэг үгийг давтах",
        "Зохиогчийн үндсэн хэлэх гэсэн санаа",
        "Зөвхөн эхний өгүүлбэр",
        "Зөвхөн сүүлийн өгүүлбэр",
      ],
      answer: "Зохиогчийн үндсэн хэлэх гэсэн санаа",
    },
    {
      topic: "Утга зүй",
      prompt: "\"Сэргэлэн\" үгийн ойролцоо утгатай үгийг ол.",
      options: ["залхуу", "ухаалаг", "будлиантай", "ганцаардмал"],
      answer: "ухаалаг",
    },
    {
      topic: "Утга зүй",
      prompt: "\"Өргөн\" үгийн эсрэг утгатай үгийг ол.",
      options: ["өндөр", "нарийн", "зузаан", "урт"],
      answer: "нарийн",
    },
    {
      topic: "Үг бүтэх ёс",
      prompt: "\"Номхон\" үгийн язгуур аль нь вэ?",
      options: ["ном", "номх", "хон", "номхон"],
      answer: "номх",
    },
    {
      topic: "Найруулга",
      prompt: "Хэн нэгэнд хүсэлт тавьж буй өгүүлбэрт аль өнгө аяс тохирох вэ?",
      options: ["зандрах", "хүндэтгэсэн", "шоолсон", "хайхрамжгүй"],
      answer: "хүндэтгэсэн",
    },
    {
      topic: "Эхийн бүтэц",
      prompt: "Эхийн төгсгөл хэсэгт ихэвчлэн юу байна вэ?",
      options: [
        "Жишээ баримт",
        "Гол санааны дүгнэлт",
        "Сэдвийн нэр",
        "Зохиогчийн намтар",
      ],
      answer: "Гол санааны дүгнэлт",
    },
    {
      topic: "Яруу найраг",
      prompt: "\"Салхи исгэрнэ\" илэрхийлэлд ямар дүрслэх хэрэглүүр ажиглагдах вэ?",
      options: ["Тоо баримт", "Хүншүүлэл", "Эшлэл", "Товчлол"],
      answer: "Хүншүүлэл",
    },
    {
      topic: "Эхийн уялдаа",
      prompt: "Эхийн өгүүлбэрүүдийн уялдаа холбоог хангахад юу чухал вэ?",
      options: [
        "Тасралтгүй урт өгүүлбэр",
        "Холбох үг ба логик дараалал",
        "Зөвхөн адил үг давтах",
        "Хашилтыг олон хэрэглэх",
      ],
      answer: "Холбох үг ба логик дараалал",
    },
    {
      topic: "Ярианы соёл",
      prompt: "Нийтийн өмнө ярихдаа хамгийн түрүүнд юуг анхаарах вэ?",
      options: [
        "Хэт хурдан ярих",
        "Сонсогчид ойлгомжтой илэрхийлэх",
        "Гараа үргэлж хөдөлгөх",
        "Өндөр дуугаар тасралтгүй ярих",
      ],
      answer: "Сонсогчид ойлгомжтой илэрхийлэх",
    },
    {
      topic: "Цэг таслал",
      prompt: "Сэтгэлийн өнгө аястай өгүүлбэрийн төгсгөлд аль тэмдэг тавих нь тохиромжтой вэ?",
      options: ["Асуултын тэмдэг", "Анхаарлын тэмдэг", "Таслал", "Хос цэг"],
      answer: "Анхаарлын тэмдэг",
    },
    {
      topic: "Үг зүй",
      prompt: "\"Тэд\" гэдэг нь ямар аймгийн үг вэ?",
      options: ["Нэр үг", "Төлөөний үг", "Тэмдэг нэр", "Тооны нэр"],
      answer: "Төлөөний үг",
      difficulty: "easy",
    },
    {
      topic: "Уншлага",
      prompt: "Эхийн дэд санааг олохдоо аль аргыг хэрэглэх нь зөв бэ?",
      options: [
        "Гол санааг орхих",
        "Бүлэг бүрийн тулгуур санааг ялгах",
        "Зөвхөн гарчиг харах",
        "Текстийг цээжлэх",
      ],
      answer: "Бүлэг бүрийн тулгуур санааг ялгах",
    },
    {
      topic: "Найруулга",
      prompt: "Шинжлэх ухааны бичвэрт аль шинж давамгайлах вэ?",
      options: ["уянгын", "албан ба логик", "ярианы", "хошин"],
      answer: "албан ба логик",
    },
    {
      topic: "Үг бүтэх ёс",
      prompt: "\"уншигч\" үг нь ямар аргаар бүтсэн бэ?",
      options: [
        "Нийлмэл үг",
        "Дагавраар бүтсэн",
        "Товчилсон үг",
        "Харь үг",
      ],
      answer: "Дагавраар бүтсэн",
    },
    {
      topic: "Эхийн бүтэц",
      prompt: "Оршил хэсгийн гол үүрэг аль нь вэ?",
      options: [
        "Сэдвийг нээх",
        "Дүгнэлт хийх",
        "Жишээг давтах",
        "Эшлэл жагсаах",
      ],
      answer: "Сэдвийг нээх",
    },
    {
      topic: "Утга зүй",
      prompt: "\"Хурдан\" үгтэй хамгийн ойролцоо утгатай үгийг ол.",
      options: ["удаан", "түргэн", "том", "зөөлөн"],
      answer: "түргэн",
      difficulty: "easy",
    },
    {
      topic: "Ярианы соёл",
      prompt: "Мэтгэлцээний үед хамгийн зөв хандлага аль нь вэ?",
      options: [
        "Хүнийг биш санааг шүүмжлэх",
        "Дуугаа өндөрсгөх",
        "Тасалж ярих",
        "Баримтгүй маргах",
      ],
      answer: "Хүнийг биш санааг шүүмжлэх",
    },
    {
      topic: "Уран зохиол",
      prompt: "Зохиолын дүрийн зан чанарыг юу илүү тодруулдаг вэ?",
      options: [
        "Зөвхөн гарчиг",
        "Үйлдэл ба яриа",
        "Хуудасны тоо",
        "Номын өнгө",
      ],
      answer: "Үйлдэл ба яриа",
    },
    {
      topic: "Найруулга",
      prompt: "Дараах хэллэгээс ярианы өнгө аяс илүүтэйг нь ол.",
      options: [
        "мэдэгдэж байна",
        "ёстой гоё байна",
        "шийдвэрлэв",
        "шаардлагатай",
      ],
      answer: "ёстой гоё байна",
    },
  ]),
  ...createShortTextQuestions("mn-10", [
    {
      topic: "Үг зүй",
      prompt: "\"Ухаантай\" үгийг аймгаар нь ангилж бич.",
      answer: "Тэмдэг нэр",
    },
    {
      topic: "Цэг таслал",
      prompt: "Асуух өгүүлбэрийн төгсгөлд тавих тэмдгийг нэрлэ.",
      answer: "Асуултын тэмдэг",
    },
    {
      topic: "Эхийн бүтэц",
      prompt: "Эхийн 3 үндсэн хэсгийг бич.",
      answer: "Оршил, гол хэсэг, төгсгөл",
    },
    {
      topic: "Утга зүй",
      prompt: "\"Эрэлхэг\" үгийн ойролцоо утгатай нэг үг бич.",
      answer: "Зоригтой",
    },
    {
      topic: "Найруулга",
      prompt: "Албан бичгийн найруулгын 1 гол шинжийг бич.",
      answer: "Товч, тодорхой",
    },
    {
      topic: "Яруу найраг",
      prompt: "Хүншүүллийн нэг жишээ 3-5 үгээр бич.",
      answer: "Салхи дуулна",
    },
    {
      topic: "Ярианы соёл",
      prompt: "Сонсогчидтой хүндэтгэлтэй харилцахад хэрэгтэй 1 зарчим бич.",
      answer: "Эелдэг үг хэрэглэх",
    },
    {
      topic: "Уншлага",
      prompt: "Эхийн гол санааг тодорхойлоход хамгийн чухал 1 зүйл бич.",
      answer: "Зохиогчийн үндсэн санаа",
    },
  ]),
  ...createImageUploadQuestions("mn-10", [
    {
      topic: "Эхийн бүтэц",
      prompt: "Өгөгдсөн сэдвээр богино эхийн бүтэц (оршил, гол, төгсгөл)-ийг схемлэн зурж, зургаа оруул.",
      answer: "3 хэсэгтэй логик бүтэцтэй схем",
      evaluationHint: "Сэдэв нээсэн оршил, хөгжүүлсэн гол хэсэг, дүгнэсэн төгсгөл харагдах ёстой.",
    },
    {
      topic: "Найруулга",
      prompt: "Албан ба ярианы хэлний ялгааг 2 баганат хүснэгтээр бичиж, зургаа оруул.",
      answer: "Албан/ярианы ялгааг жишээтэй хүснэгт",
      evaluationHint: "Хэл найруулгын 2-оос доошгүй ялгаа байх.",
    },
    {
      topic: "Өгүүлбэр зүй",
      prompt: "Нэг нийлмэл өгүүлбэр задлан шинжилж, өгүүлбэрийн гишүүдийг тэмдэглэсэн зургаа оруул.",
      answer: "Эзэн, өгүүлэхүүн болон бусад гишүүдийг зөв ялгасан байна",
      evaluationHint: "Гишүүдийг өнгөөр эсвэл тэмдэглэгээгээр ялгасан байвал сайн.",
    },
    {
      topic: "Цэг таслал",
      prompt: "Алдаатай 5 өгүүлбэрийг зөв цэг тэмдэгтэй болгож зассан хуудсаа зураг болгон оруул.",
      answer: "Таслал, цэг, асуултын тэмдэг, анхаарлын тэмдэг зөв хэрэглэсэн байх",
      evaluationHint: "Алдаа зассан нь тодорхой харагдах ёстой.",
    },
    {
      topic: "Утга зүй",
      prompt: "Ойролцоо утгатай ба эсрэг утгатай үгсийн mind map хийж зургаа оруул.",
      answer: "2 салаа ангилалтай, жишээ үгстэй зураг",
      evaluationHint: "Ангилал ойлгомжтой, жишээ бүр зөв байх.",
    },
    {
      topic: "Яруу найраг",
      prompt: "Өгөгдсөн шүлгийн мөрүүдээс дүрслэх хэрэглүүрийг ялгаж тэмдэглэсэн хуудсаа зураг болгон оруул.",
      answer: "Хүншүүлэл, зүйрлэл, адилтгал зэргийг зөв ялгасан байх",
      evaluationHint: "Тайлбар хавсаргавал давуу тал болно.",
    },
    {
      topic: "Уншлага",
      prompt: "Нэг эхийн гол санаа ба дэд санааг concept map хэлбэрээр зурж, зургаа оруул.",
      answer: "Гол санаа төвд, дэд санаанууд салбарласан бүтэцтэй",
      evaluationHint: "Гол ба дэд санааны ялгаа тодорхой байх.",
    },
    {
      topic: "Ярианы соёл",
      prompt: "Нийтийн өмнө ярих 5 зөвлөмжийг постер маягаар зохион байгуулж, зургаа оруул.",
      answer: "Ойлгомжтой постер, 5 зөвлөмжтэй",
      evaluationHint: "Уншихад ойлгомжтой, зөв хэллэгтэй байх.",
    },
  ]),
];

const physicsQuestions = [
  ...createTrueFalseQuestions("physics-10", [
    {
      topic: "Механик",
      prompt: "Хурд нь хугацааны нэгжид туулсан замыг илэрхийлнэ.",
      answer: "Үнэн",
    },
    {
      topic: "Механик",
      prompt: "Хөдөлгөөнгүй биед үйлчлэх хүчний нийлбэр заавал 0-ээс их байна.",
      answer: "Худал",
    },
    {
      topic: "Динамик",
      prompt: "Ньютоны 2-р хуульд F = ma гэж илэрхийлдэг.",
      answer: "Үнэн",
    },
    {
      topic: "Энерги",
      prompt: "Потенциал энерги зөвхөн хөдөлж буй биед л байдаг.",
      answer: "Худал",
    },
    {
      topic: "Даралт",
      prompt: "Даралт нь нэгж талбайд үйлчлэх хүч юм.",
      answer: "Үнэн",
    },
    {
      topic: "Дулаан",
      prompt: "Температур ба дулаан хэмжээ хоёр ижил ойлголт мөн.",
      answer: "Худал",
    },
    {
      topic: "Цахилгаан",
      prompt: "Цэнэгийн нэгж нь кулон мөн.",
      answer: "Үнэн",
    },
    {
      topic: "Гэрэл",
      prompt: "Гэрэл вакуумд тархахгүй.",
      answer: "Худал",
    },
    {
      topic: "Долгион",
      prompt: "Дуу бол долгион хэлбэрийн үзэгдэл мөн.",
      answer: "Үнэн",
    },
    {
      topic: "Нягт",
      prompt: "Нягтын нэгжийг Ньютон гэж авна.",
      answer: "Худал",
    },
  ]),
  ...createMultipleChoiceQuestions("physics-10", [
    {
      topic: "Механик",
      prompt: "Хурдны SI нэгж аль нь вэ?",
      options: ["м", "м/с", "кг", "Н"],
      answer: "м/с",
      difficulty: "easy",
    },
    {
      topic: "Механик",
      prompt: "5 м/с хурдтай биет 4 секундэд ямар зам туулах вэ?",
      options: ["9 м", "20 м", "25 м", "40 м"],
      answer: "20 м",
      difficulty: "easy",
    },
    {
      topic: "Динамик",
      prompt: "2 кг масстай биед 6 Н хүч үйлчлэхэд хурдатгал хэд вэ?",
      options: ["2 м/с²", "3 м/с²", "4 м/с²", "12 м/с²"],
      answer: "3 м/с²",
    },
    {
      topic: "Динамик",
      prompt: "Ньютоны 1-р хууль ямар ойлголттой хамгийн холбоотой вэ?",
      options: ["Даралт", "Инерци", "Чадал", "Нягт"],
      answer: "Инерци",
    },
    {
      topic: "Энерги",
      prompt: "Кинетик энергийн томьёо аль нь вэ?",
      options: ["mgh", "mv", "1/2 mv²", "F/s"],
      answer: "1/2 mv²",
    },
    {
      topic: "Энерги",
      prompt: "Потенциал энергийн томьёо аль нь вэ?",
      options: ["mgh", "ma", "Pt", "qU"],
      answer: "mgh",
    },
    {
      topic: "Ажил, чадал",
      prompt: "Ажлын SI нэгж аль нь вэ?",
      options: ["Ватт", "Жоуль", "Ньютон", "Паскаль"],
      answer: "Жоуль",
    },
    {
      topic: "Ажил, чадал",
      prompt: "Чадлын SI нэгж аль нь вэ?",
      options: ["Жоуль", "Ньютон", "Ватт", "Кулон"],
      answer: "Ватт",
    },
    {
      topic: "Даралт",
      prompt: "Даралтын томьёо аль нь вэ?",
      options: ["p = F/S", "p = m/V", "p = A/t", "p = qU"],
      answer: "p = F/S",
    },
    {
      topic: "Нягт",
      prompt: "Нягтын томьёо аль нь вэ?",
      options: ["ρ = m/V", "ρ = F/S", "ρ = A/t", "ρ = q/t"],
      answer: "ρ = m/V",
    },
    {
      topic: "Дулаан",
      prompt: "Температурыг хэмжих багаж аль нь вэ?",
      options: ["Динамометр", "Амперметр", "Термометр", "Барометр"],
      answer: "Термометр",
      difficulty: "easy",
    },
    {
      topic: "Дулаан",
      prompt: "Ус 100°C-т ямар төлөв шилжилтэд ордог вэ? (ердийн даралтад)",
      options: ["Хөлдөнө", "Буцална", "Нягтарна", "Тэлэхгүй"],
      answer: "Буцална",
    },
    {
      topic: "Цахилгаан",
      prompt: "Цахилгаан гүйдлийн SI нэгж аль нь вэ?",
      options: ["Вольт", "Ампер", "Ом", "Ватт"],
      answer: "Ампер",
    },
    {
      topic: "Цахилгаан",
      prompt: "Хүчдэлийн SI нэгж аль нь вэ?",
      options: ["Ом", "Ампер", "Вольт", "Тесла"],
      answer: "Вольт",
    },
    {
      topic: "Цахилгаан",
      prompt: "Эсэргүүцлийн SI нэгж аль нь вэ?",
      options: ["Ом", "Вольт", "Кулон", "Герц"],
      answer: "Ом",
    },
    {
      topic: "Хэлхээ",
      prompt: "Цуваа хэлхээнд гүйдэл ямар байдаг вэ?",
      options: [
        "Салбар бүрт өөр",
        "Бүх хэсэгт ижил",
        "Зөвхөн эх үүсвэр дээр их",
        "Тэг",
      ],
      answer: "Бүх хэсэгт ижил",
    },
    {
      topic: "Соронзон орон",
      prompt: "Соронзын ижил туйлууд хоорондоо яах вэ?",
      options: ["Таталцана", "Түлхэлцэнэ", "Нөлөөгүй", "Ууршина"],
      answer: "Түлхэлцэнэ",
      difficulty: "easy",
    },
    {
      topic: "Гэрэл",
      prompt: "Гэрлийн хурд вакуумд ойролцоогоор хэд вэ?",
      options: ["3×10⁵ м/с", "3×10⁶ м/с", "3×10⁷ м/с", "3×10⁸ м/с"],
      answer: "3×10⁸ м/с",
    },
    {
      topic: "Гэрэл",
      prompt: "Тэгш гадаргуу дээр гэрэл ойх үед тусах өнцөг ба ойх өнцөг ямар хамааралтай вэ?",
      options: [
        "Тусах өнцөг их",
        "Ойх өнцөг их",
        "Хоёулаа тэнцүү",
        "Хамааралгүй",
      ],
      answer: "Хоёулаа тэнцүү",
    },
    {
      topic: "Долгион",
      prompt: "Дуу вакуумд тархах уу?",
      options: ["Тийм", "Үгүй", "Заримдаа", "Зөвхөн хүйтэнд"],
      answer: "Үгүй",
      difficulty: "easy",
    },
    {
      topic: "Механик",
      prompt: "Массийн SI нэгж аль нь вэ?",
      options: ["Н", "Па", "кг", "м/с"],
      answer: "кг",
      difficulty: "easy",
    },
    {
      topic: "Хүч",
      prompt: "Хүчний SI нэгж аль нь вэ?",
      options: ["Ж", "Н", "Вт", "Па"],
      answer: "Н",
      difficulty: "easy",
    },
    {
      topic: "Импульс",
      prompt: "Импульсийг илэрхийлэх хамгийн тохиромжтой хэлбэр аль нь вэ?",
      options: ["p = mv", "p = ma", "p = F/S", "p = A/t"],
      answer: "p = mv",
    },
    {
      topic: "Даралт",
      prompt: "Шингэн дотор гүн ихсэхэд даралт яах вэ?",
      options: ["Буурна", "Өөрчлөгдөхгүй", "Ихсэнэ", "Тэг болно"],
      answer: "Ихсэнэ",
    },
  ]),
  ...createShortTextQuestions("physics-10", [
    {
      topic: "Механик",
      prompt: "10 м/с хурдтай биет 3 секундэд туулах замыг ол.",
      answer: "30 м",
      difficulty: "easy",
    },
    {
      topic: "Динамик",
      prompt: "4 кг масстай биет 8 Н хүчний нөлөөгөөр хэдэн м/с² хурдатгал авах вэ?",
      answer: "2 м/с²",
    },
    {
      topic: "Энерги",
      prompt: "m = 2 кг, h = 5 м үед g = 10 м/с² гэж үзвэл потенциал энергийг ол.",
      answer: "100 Ж",
    },
    {
      topic: "Даралт",
      prompt: "20 Н хүч 4 м² талбайд жигд үйлчлэхэд даралт хэд вэ?",
      answer: "5 Па",
    },
    {
      topic: "Цахилгаан",
      prompt: "I = 2 A, R = 5 Ω үед хүчдэл хэд вэ?",
      answer: "10 В",
    },
    {
      topic: "Нягт",
      prompt: "m = 400 г, V = 200 см³ биеийн нягтыг г/см³-ээр ол.",
      answer: "2 г/см³",
    },
    {
      topic: "Ажил",
      prompt: "10 Н хүчээр биетийг 3 м зөөвөрлөв. Хийсэн ажлыг ол.",
      answer: "30 Ж",
    },
    {
      topic: "Чадал",
      prompt: "60 Ж ажил 5 секундэд хийгдвэл чадал хэд вэ?",
      answer: "12 Вт",
    },
  ]),
  ...createImageUploadQuestions("physics-10", [
    {
      topic: "Механик",
      prompt: "Хугацаа-хурдны графикаас туулсан замыг олох бодолтын зургаа оруул.",
      answer: "Графикийн доорх талбайгаар замыг тооцсон байх",
      evaluationHint: "Тэнхлэгийн тэмдэглэгээ, талбайн тайлбар харагдах ёстой.",
    },
    {
      topic: "Динамик",
      prompt: "Чөлөөт биетийн диаграм зурж, хүчнүүдийг тэмдэглэсэн хуудсаа зураг болгон оруул.",
      answer: "mg, N, F гэх мэт хүчнүүд зөв чиглэлтэй байна",
      evaluationHint: "Чиглэл, тэмдэглэгээ, тайлбар зөв байх.",
    },
    {
      topic: "Энерги",
      prompt: "Кинетик ба потенциал энергийн шилжилтийг тайлбарласан схем зурж, зургаа оруул.",
      answer: "Өндөр өөрчлөгдөхөд Ep, Ek хэрхэн солигдохыг зөв үзүүлсэн байх",
      evaluationHint: "Сум, тайлбар, жишээ байвал сайн.",
    },
    {
      topic: "Даралт",
      prompt: "Шингэний даралт гүнээс хамаардагийг харуулах туршилтын схем зурж, зургаа оруул.",
      answer: "Гүн ихсэхэд даралт ихсэхийг схемээр илэрхийлсэн байх",
      evaluationHint: "Сав, нүх, шингэний түвшин ойлгомжтой байх.",
    },
    {
      topic: "Цахилгаан",
      prompt: "Зай, унтраалга, чийдэнтэй энгийн хэлхээний схем зурж, зургаа оруул.",
      answer: "Хаалттай хэлхээний зөв тэмдэглэгээтэй зураг",
      evaluationHint: "Эх үүсвэр, дамжуулагч, ачаалал бүгд байх.",
    },
    {
      topic: "Гэрэл",
      prompt: "Ойх хуулийг харуулсан цацрагийн зураг зурж, тусах ба ойх өнцгийг тэмдэглэсэн зургаа оруул.",
      answer: "Тусах өнцөг = ойх өнцөг гэж зөв тэмдэглэсэн байх",
      evaluationHint: "Хэвийн шулуун заавал байх.",
    },
    {
      topic: "Долгион",
      prompt: "Долгионы урт, далайц, тэнцвэрийн байрлалыг тэмдэглэсэн долгионы ноорог зурж оруул.",
      answer: "λ, A, тэнцвэрийн шугам зөв тэмдэглэсэн байх",
      evaluationHint: "Нэг бүтэн долгион тодорхой харагдах ёстой.",
    },
    {
      topic: "Нягт",
      prompt: "Нягтыг олох туршилтын алхмуудыг зурагт тайлбар хэлбэрээр үзүүлж, зургаа оруул.",
      answer: "Масс хэмжих, эзлэхүүн тодорхойлох, ρ = m/V алхмууд орсон байх",
      evaluationHint: "Хэмжилтийн дараалал логик байх.",
    },
  ]),
];

export const questionBanks: QuestionBank[] = [
  createQuestionBank({
    id: "bank-math-10",
    title: "10-р ангийн математикийн шалгалтын сан",
    description:
      "Алгебр, функц, геометр, тригонометрийн сэдвүүдийг хамарсан 50 асуулттай mock сан.",
    subject: "Математик",
    date: "2026.03.25",
    questions: mathQuestions,
  }),
  createQuestionBank({
    id: "bank-mn-10",
    title: "10-р ангийн монгол хэлний шалгалтын сан",
    description:
      "Үг зүй, өгүүлбэр зүй, найруулга, уншлага ойлголтын 50 асуулттай mock сан.",
    subject: "Монгол хэл",
    date: "2026.03.25",
    questions: mongolianQuestions,
  }),
  createQuestionBank({
    id: "bank-physics-10",
    title: "10-р ангийн физикийн шалгалтын сан",
    description:
      "Механик, динамик, энерги, цахилгаан, гэрлийн сэдвүүдтэй 50 асуулттай mock сан.",
    subject: "Физик",
    date: "2026.03.25",
    questions: physicsQuestions,
  }),
];

export const questionBankItems: QuestionBankItem[] = questionBanks.map((bank) => ({
  id: bank.id,
  title: bank.title,
  description: `${bank.description} Үнэн/худал 10, 4 сонголттой 24, богино хариулт 8, зураг оруулах 8.`,
  subject: bank.subject,
  questions: `${bank.questions.length} асуулт`,
  date: bank.date,
}));
