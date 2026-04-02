type Difficulty = "EASY" | "MEDIUM" | "HARD";
type QuestionType = "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";

type QuestionContent = {
  title: string;
  prompt: string;
  optionsJson: string;
  correctAnswer: string;
};

const difficultyLabel = (difficulty: Difficulty) =>
  difficulty === "EASY" ? "Хялбар" : difficulty === "MEDIUM" ? "Дунд" : "Хүнд";

const buildMathQuestion = (
  topic: string,
  grade: number,
  difficulty: Difficulty,
  index: number,
  type: QuestionType,
): QuestionContent => {
  const title = `${topic} · ${difficultyLabel(difficulty)} ${index}`;

  if (topic === "Алгебр") {
    if (type === "TRUE_FALSE") {
      return {
        title,
        prompt: `x^2 - 5x + 6 = 0 тэгшитгэлийн язгууруудын нийлбэр 5 мөн.`,
        optionsJson: JSON.stringify(["Үнэн", "Худал"]),
        correctAnswer: "Үнэн",
      };
    }
    if (type === "SHORT_ANSWER") {
      return {
        title,
        prompt: `2x + ${grade - 4} = ${grade + 8} бол x-ийн утгыг ол.`,
        optionsJson: JSON.stringify([]),
        correctAnswer: "6",
      };
    }
    return {
      title,
      prompt: `x^2 - 5x + 6 = 0 тэгшитгэлийн нэг язгуур аль нь вэ?`,
      optionsJson: JSON.stringify(["1", "2", "5", "6"]),
      correctAnswer: "2",
    };
  }

  if (topic === "Функц") {
    if (type === "TRUE_FALSE") {
      return {
        title,
        prompt: `f(x)=2x+1 функцийн график нь шулуун байна.`,
        optionsJson: JSON.stringify(["Үнэн", "Худал"]),
        correctAnswer: "Үнэн",
      };
    }
    if (type === "SHORT_ANSWER") {
      return {
        title,
        prompt: `f(x)=x^2+1 бол f(3)-ийн утгыг ол.`,
        optionsJson: JSON.stringify([]),
        correctAnswer: "10",
      };
    }
    return {
      title,
      prompt: `y = -3x + 2 функцийн налалтын коэффициент аль нь вэ?`,
      optionsJson: JSON.stringify(["-3", "2", "3", "-2"]),
      correctAnswer: "-3",
    };
  }

  if (topic === "Геометр") {
    if (type === "TRUE_FALSE") {
      return {
        title,
        prompt: `Тэгш өнцөгт гурвалжинд Пифагорын теорем үйлчилнэ.`,
        optionsJson: JSON.stringify(["Үнэн", "Худал"]),
        correctAnswer: "Үнэн",
      };
    }
    if (type === "SHORT_ANSWER") {
      return {
        title,
        prompt: `Катетууд нь 6 ба 8 байх тэгш өнцөгт гурвалжны гипотенузыг ол.`,
        optionsJson: JSON.stringify([]),
        correctAnswer: "10",
      };
    }
    return {
      title,
      prompt: `Квадратын нэг тал 5 бол периметр хэд вэ?`,
      optionsJson: JSON.stringify(["10", "20", "25", "15"]),
      correctAnswer: "20",
    };
  }

  if (topic === "Тригонометр") {
    if (type === "TRUE_FALSE") {
      return {
        title,
        prompt: `sin 30° = 1/2 мөн.`,
        optionsJson: JSON.stringify(["Үнэн", "Худал"]),
        correctAnswer: "Үнэн",
      };
    }
    if (type === "SHORT_ANSWER") {
      return {
        title,
        prompt: `cos 60°-ийн утгыг бич.`,
        optionsJson: JSON.stringify([]),
        correctAnswer: "1/2",
      };
    }
    return {
      title,
      prompt: `Дараахын аль нь tan 45°-ийн утга вэ?`,
      optionsJson: JSON.stringify(["0", "1", "√3", "1/2"]),
      correctAnswer: "1",
    };
  }

  if (topic === "Магадлал") {
    if (type === "TRUE_FALSE") {
      return {
        title,
        prompt: `Шударга зоос нэг удаа шидэхэд сүлд гарах магадлал 1/2.`,
        optionsJson: JSON.stringify(["Үнэн", "Худал"]),
        correctAnswer: "Үнэн",
      };
    }
    if (type === "SHORT_ANSWER") {
      return {
        title,
        prompt: `Шударга шоог нэг удаа хаяхад 6 буух магадлалыг бич.`,
        optionsJson: JSON.stringify([]),
        correctAnswer: "1/6",
      };
    }
    return {
      title,
      prompt: `1-ээс 10 хүртэлх бүхэл тооноос санамсаргүй сонгоход тэгш тоо таарах магадлал аль нь вэ?`,
      optionsJson: JSON.stringify(["1/10", "1/2", "2/5", "3/10"]),
      correctAnswer: "1/2",
    };
  }

  if (type === "SHORT_ANSWER") {
    return {
      title,
      prompt: `${topic} сэдвийн гол ойлголтыг ашиглан богино тооцоолол хий.`,
      optionsJson: JSON.stringify([]),
      correctAnswer: "2",
    };
  }

  return {
    title,
    prompt: `${grade}-р ангийн ${topic} сэдвийн үндсэн ойлголтыг шалгах бодлого аль нь вэ?`,
    optionsJson: JSON.stringify(["A", "B", "C", "D"]),
    correctAnswer: "B",
  };
};

const buildPhysicsQuestion = (
  topic: string,
  _grade: number,
  difficulty: Difficulty,
  index: number,
  type: QuestionType,
): QuestionContent => {
  const title = `${topic} · ${difficultyLabel(difficulty)} ${index}`;

  if (topic === "Механик") {
    if (type === "TRUE_FALSE") {
      return {
        title,
        prompt: `Хурд нь нэгж хугацаанд туулсан замаар тодорхойлогдоно.`,
        optionsJson: JSON.stringify(["Үнэн", "Худал"]),
        correctAnswer: "Үнэн",
      };
    }
    if (type === "SHORT_ANSWER") {
      return {
        title,
        prompt: `5 м/с хурдтай бие 4 секундэд ямар зам туулах вэ?`,
        optionsJson: JSON.stringify([]),
        correctAnswer: "20",
      };
    }
    return {
      title,
      prompt: `Хурдны SI нэгж аль нь вэ?`,
      optionsJson: JSON.stringify(["м", "м/с", "Н", "Ж"]),
      correctAnswer: "м/с",
    };
  }

  if (topic === "Динамик") {
    if (type === "TRUE_FALSE") {
      return {
        title,
        prompt: `Ньютоны II хууль F = ma гэж илэрхийлэгдэнэ.`,
        optionsJson: JSON.stringify(["Үнэн", "Худал"]),
        correctAnswer: "Үнэн",
      };
    }
    if (type === "SHORT_ANSWER") {
      return {
        title,
        prompt: `2 кг масстай биед 6 Н хүч үйлчлэхэд хурдатгал хэд вэ?`,
        optionsJson: JSON.stringify([]),
        correctAnswer: "3",
      };
    }
    return {
      title,
      prompt: `Инерцитэй хамгийн их холбоотой ойлголт аль нь вэ?`,
      optionsJson: JSON.stringify(["Ньютоны I хууль", "Даралт", "Чадал", "Хүчдэл"]),
      correctAnswer: "Ньютоны I хууль",
    };
  }

  if (topic === "Энерги") {
    if (type === "TRUE_FALSE") {
      return {
        title,
        prompt: `Кинетик энерги нь хөдөлгөөнтэй биетэй холбоотой.`,
        optionsJson: JSON.stringify(["Үнэн", "Худал"]),
        correctAnswer: "Үнэн",
      };
    }
    if (type === "SHORT_ANSWER") {
      return {
        title,
        prompt: `m = 2 кг, h = 5 м бол g=10 үед потенциал энергийг ол.`,
        optionsJson: JSON.stringify([]),
        correctAnswer: "100",
      };
    }
    return {
      title,
      prompt: `Потенциал энергийн томьёо аль нь вэ?`,
      optionsJson: JSON.stringify(["mv", "mgh", "F/S", "Pt"]),
      correctAnswer: "mgh",
    };
  }

  if (topic === "Цахилгаан") {
    if (type === "TRUE_FALSE") {
      return {
        title,
        prompt: `Цахилгаан гүйдлийн SI нэгж нь ампер.`,
        optionsJson: JSON.stringify(["Үнэн", "Худал"]),
        correctAnswer: "Үнэн",
      };
    }
    if (type === "SHORT_ANSWER") {
      return {
        title,
        prompt: `I = 2 A, R = 5 Ω бол хүчдэл хэд вэ?`,
        optionsJson: JSON.stringify([]),
        correctAnswer: "10",
      };
    }
    return {
      title,
      prompt: `Эсэргүүцлийн SI нэгж аль нь вэ?`,
      optionsJson: JSON.stringify(["Вольт", "Ом", "Ампер", "Кулон"]),
      correctAnswer: "Ом",
    };
  }

  if (topic === "Дулаан") {
    if (type === "TRUE_FALSE") {
      return {
        title,
        prompt: `Температур ба дулаан хэмжээ хоёр яг ижил ойлголт биш.`,
        optionsJson: JSON.stringify(["Үнэн", "Худал"]),
        correctAnswer: "Үнэн",
      };
    }
    if (type === "SHORT_ANSWER") {
      return {
        title,
        prompt: `Ердийн даралтад ус хэдэн хэмд буцлах вэ?`,
        optionsJson: JSON.stringify([]),
        correctAnswer: "100",
      };
    }
    return {
      title,
      prompt: `Температурыг хэмжих багаж аль нь вэ?`,
      optionsJson: JSON.stringify(["Барометр", "Термометр", "Динамометр", "Амперметр"]),
      correctAnswer: "Термометр",
    };
  }

  if (topic === "Долгион") {
    if (type === "TRUE_FALSE") {
      return {
        title,
        prompt: `Дуу бол долгион хэлбэрээр тархдаг үзэгдэл мөн.`,
        optionsJson: JSON.stringify(["Үнэн", "Худал"]),
        correctAnswer: "Үнэн",
      };
    }
    if (type === "SHORT_ANSWER") {
      return {
        title,
        prompt: `Долгионы нэг бүрэн хэлбэлзэлд зарцуулах хугацааг юу гэж нэрлэдэг вэ?`,
        optionsJson: JSON.stringify([]),
        correctAnswer: "Период",
      };
    }
    return {
      title,
      prompt: `Гэрлийн долгион вакуумд тархах уу?`,
      optionsJson: JSON.stringify(["Тийм", "Үгүй", "Зөвхөн усанд", "Зөвхөн агаарт"]),
      correctAnswer: "Тийм",
    };
  }

  if (type === "SHORT_ANSWER") {
    return {
      title,
      prompt: `${topic} сэдвийн нэгж хэмжигдэхүүнийг бич.`,
      optionsJson: JSON.stringify([]),
      correctAnswer: "1",
    };
  }

  return {
    title,
    prompt: `${topic} сэдвийн суурь ойлголтыг шалгах асуулт.`,
    optionsJson: JSON.stringify(["A", "B", "C", "D"]),
    correctAnswer: "B",
  };
};

const buildMongolianQuestion = (
  topic: string,
  _grade: number,
  difficulty: Difficulty,
  index: number,
  type: QuestionType,
): QuestionContent => {
  const title = `${topic} · ${difficultyLabel(difficulty)} ${index}`;

  if (topic === "Үг зүй") {
    if (type === "TRUE_FALSE") {
      return {
        title,
        prompt: `"Тэд" гэдэг нь төлөөний үг мөн.`,
        optionsJson: JSON.stringify(["Үнэн", "Худал"]),
        correctAnswer: "Үнэн",
      };
    }
    if (type === "SHORT_ANSWER") {
      return {
        title,
        prompt: `"Ухаалаг" үгийг аймгаар нь ангилж бич.`,
        optionsJson: JSON.stringify([]),
        correctAnswer: "Тэмдэг нэр",
      };
    }
    return {
      title,
      prompt: `"Эрэлхэг" үгтэй ойролцоо утгатай үгийг ол.`,
      optionsJson: JSON.stringify(["аймхай", "зоригтой", "жижиг", "сул"]),
      correctAnswer: "зоригтой",
    };
  }

  if (topic === "Найруулга") {
    if (type === "TRUE_FALSE") {
      return {
        title,
        prompt: `Албан бичгийн найруулга нь товч, тодорхой байх ёстой.`,
        optionsJson: JSON.stringify(["Үнэн", "Худал"]),
        correctAnswer: "Үнэн",
      };
    }
    if (type === "SHORT_ANSWER") {
      return {
        title,
        prompt: `Албан бичгийн найруулгын нэг онцлог шинжийг бич.`,
        optionsJson: JSON.stringify([]),
        correctAnswer: "Товч тодорхой",
      };
    }
    return {
      title,
      prompt: `Шинжлэх ухааны бичвэрт аль шинж давамгайлах вэ?`,
      optionsJson: JSON.stringify(["уянгын", "албан ба логик", "хошин", "ярианы"]),
      correctAnswer: "албан ба логик",
    };
  }

  if (topic === "Уншлага") {
    if (type === "TRUE_FALSE") {
      return {
        title,
        prompt: `Эхийн гол санаа нь бүх өгүүлбэрийн төв агуулгыг илэрхийлдэг.`,
        optionsJson: JSON.stringify(["Үнэн", "Худал"]),
        correctAnswer: "Үнэн",
      };
    }
    if (type === "SHORT_ANSWER") {
      return {
        title,
        prompt: `Эхийн гол санааг тодорхойлоход хамгийн чухал нэг зүйлийг бич.`,
        optionsJson: JSON.stringify([]),
        correctAnswer: "Зохиогчийн үндсэн санаа",
      };
    }
    return {
      title,
      prompt: `Эхийн дэд санааг олохдоо аль аргыг хэрэглэх нь зөв бэ?`,
      optionsJson: JSON.stringify([
        "Гарчиг л харах",
        "Бүлэг бүрийн тулгуур санааг ялгах",
        "Текстийг цээжлэх",
        "Зөвхөн эхний өгүүлбэр унших",
      ]),
      correctAnswer: "Бүлэг бүрийн тулгуур санааг ялгах",
    };
  }

  if (topic === "Яруу найраг") {
    if (type === "TRUE_FALSE") {
      return {
        title,
        prompt: `"Салхи дуулна" гэдэгт хүншүүлэл хэрэглэсэн байна.`,
        optionsJson: JSON.stringify(["Үнэн", "Худал"]),
        correctAnswer: "Үнэн",
      };
    }
    if (type === "SHORT_ANSWER") {
      return {
        title,
        prompt: `Хүншүүллийн нэг богино жишээ бич.`,
        optionsJson: JSON.stringify([]),
        correctAnswer: "Салхи дуулна",
      };
    }
    return {
      title,
      prompt: `"Салхи исгэрнэ" илэрхийлэлд ямар дүрслэх хэрэглүүр ажиглагдах вэ?`,
      optionsJson: JSON.stringify(["Эшлэл", "Хүншүүлэл", "Тоо баримт", "Товчлол"]),
      correctAnswer: "Хүншүүлэл",
    };
  }

  if (topic === "Өгүүлбэр зүй") {
    if (type === "TRUE_FALSE") {
      return {
        title,
        prompt: `Нийлмэл өгүүлбэр нь хоёр ба түүнээс олон өгүүлбэрийн үндэстэй байж болно.`,
        optionsJson: JSON.stringify(["Үнэн", "Худал"]),
        correctAnswer: "Үнэн",
      };
    }
    if (type === "SHORT_ANSWER") {
      return {
        title,
        prompt: `Өгүүлбэрийн гол гишүүдийг нэрлэ.`,
        optionsJson: JSON.stringify([]),
        correctAnswer: "Эзэн ба өгүүлэхүүн",
      };
    }
    return {
      title,
      prompt: `Асуух өгүүлбэрийн төгсгөлд ямар тэмдэг тавих вэ?`,
      optionsJson: JSON.stringify(["Цэг", "Асуултын тэмдэг", "Таслал", "Хос цэг"]),
      correctAnswer: "Асуултын тэмдэг",
    };
  }

  if (topic === "Цэг таслал") {
    if (type === "TRUE_FALSE") {
      return {
        title,
        prompt: `Анхаарлын өнгө аястай өгүүлбэрийн төгсгөлд анхаарлын тэмдэг хэрэглэж болно.`,
        optionsJson: JSON.stringify(["Үнэн", "Худал"]),
        correctAnswer: "Үнэн",
      };
    }
    if (type === "SHORT_ANSWER") {
      return {
        title,
        prompt: `Асуух өгүүлбэрийн төгсгөлд тавих тэмдгийг нэрлэ.`,
        optionsJson: JSON.stringify([]),
        correctAnswer: "Асуултын тэмдэг",
      };
    }
    return {
      title,
      prompt: `Сэтгэлийн өнгө аястай өгүүлбэрийн төгсгөлд аль тэмдэг тохиромжтой вэ?`,
      optionsJson: JSON.stringify([
        "Асуултын тэмдэг",
        "Анхаарлын тэмдэг",
        "Таслал",
        "Хос цэг",
      ]),
      correctAnswer: "Анхаарлын тэмдэг",
    };
  }

  if (type === "SHORT_ANSWER") {
    return {
      title,
      prompt: `${topic} сэдвийн нэг гол ойлголтыг бич.`,
      optionsJson: JSON.stringify([]),
      correctAnswer: "Ойлголт",
    };
  }

  return {
    title,
    prompt: `${topic} сэдвийн суурь ойлголтыг шалгах асуулт.`,
    optionsJson: JSON.stringify(["A", "B", "C", "D"]),
    correctAnswer: "B",
  };
};

const buildFallbackQuestion = (
  subject: string,
  topic: string,
  grade: number,
  difficulty: Difficulty,
  index: number,
  type: QuestionType,
): QuestionContent => {
  const title = `${topic} · ${difficultyLabel(difficulty)} ${index}`;
  if (type === "TRUE_FALSE") {
    return {
      title,
      prompt: `${grade}-р ангийн ${subject} · ${topic} сэдвийн мэдэгдэл үнэн эсэхийг тодорхойл.`,
      optionsJson: JSON.stringify(["Үнэн", "Худал"]),
      correctAnswer: "Үнэн",
    };
  }
  if (type === "SHORT_ANSWER") {
    return {
      title,
      prompt: `${grade}-р ангийн ${subject} · ${topic} сэдвийн нэг гол хариуг бич.`,
      optionsJson: JSON.stringify([]),
      correctAnswer: topic,
    };
  }
  return {
    title,
    prompt: `${grade}-р ангийн ${subject} · ${topic} сэдвийн зөв хариултыг сонго.`,
    optionsJson: JSON.stringify(["A", "B", "C", "D"]),
    correctAnswer: "B",
  };
};

export const buildMockQuestionContent = ({
  subject,
  topic,
  grade,
  difficulty,
  index,
  type,
}: {
  subject: string;
  topic: string;
  grade: number;
  difficulty: Difficulty;
  index: number;
  type: QuestionType;
}): QuestionContent => {
  if (subject === "Математик") {
    return buildMathQuestion(topic, grade, difficulty, index, type);
  }

  if (subject === "Физик") {
    return buildPhysicsQuestion(topic, grade, difficulty, index, type);
  }

  if (subject === "Монгол хэл") {
    return buildMongolianQuestion(topic, grade, difficulty, index, type);
  }

  return buildFallbackQuestion(subject, topic, grade, difficulty, index, type);
};
