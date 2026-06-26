import { SpanishQuestion, CategoryType, DifficultyType } from "./types";

export const CATEGORIES: { value: CategoryType; label: string; icon: string; desc: string; color: string }[] = [
  {
    value: "vocab",
    label: "Vocabulario",
    icon: "BookOpen",
    desc: "Nouns, verbs, adjectives and meanings",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/50"
  },
  {
    value: "travel",
    label: "Viajes y Frases",
    icon: "Compass",
    desc: "Greetings, directions, and restaurant terms",
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800/50"
  },
  {
    value: "grammar",
    label: "Gramática",
    icon: "Sliders",
    desc: "Conjugations, gender nouns, ser vs estar",
    color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-800/50"
  },
  {
    value: "slang",
    label: "Modismos y Jerga",
    icon: "MessageSquare",
    desc: "Street expressions and colloquialisms",
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800/50"
  },
  {
    value: "listening",
    label: "Escucha",
    icon: "Headphones",
    desc: "Audio pronunciation and transcription comprehension",
    color: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/20 dark:text-pink-400 dark:border-pink-800/50"
  }
];

export const STATIC_QUESTIONS: Record<CategoryType, Record<DifficultyType, SpanishQuestion[]>> = {
  vocab: {
    beginner: [
      {
        question: "What is the English translation of 'la manzana'?",
        options: ["The banana", "The grape", "The apple", "The pear"],
        correctIndex: 2,
        explanation: "La manzana means 'the apple' in Spanish. To say the other fruits, you use 'el plátano' (banana), 'la uva' (grape), and 'la pera' (pear).",
        spanishText: "la manzana"
      },
      {
        question: "Which Spanish word means 'the book'?",
        options: ["el cuaderno", "el libro", "la pluma", "la mesa"],
        correctIndex: 1,
        explanation: "El libro means 'the book'. El cuaderno is 'the notebook', la pluma is 'the pen' (or feather), and la mesa is 'the table'.",
        spanishText: "el libro"
      },
      {
        question: "What does the Spanish adjective 'rojo' mean?",
        options: ["Blue", "Red", "Green", "Yellow"],
        correctIndex: 1,
        explanation: "Rojo means 'red'. In Spanish, colors must agree in gender and number with the noun they modify, e.g., 'la manzana roja' (the red apple).",
        spanishText: "rojo"
      }
    ],
    intermediate: [
      {
        question: "Translate 'the butterfly' to Spanish:",
        options: ["la mariquita", "la hormiga", "la mariposa", "la abeja"],
        correctIndex: 2,
        explanation: "La mariposa is the Spanish word for 'the butterfly'. La mariquita is 'the ladybug', la hormiga is 'the ant', and la abeja is 'the bee'.",
        spanishText: "la mariposa"
      },
      {
        question: "What is the meaning of the Spanish verb 'desarrollar'?",
        options: ["To discharge", "To discover", "To design", "To develop"],
        correctIndex: 3,
        explanation: "Desarrollar means 'to develop'. For example, 'desarrollar una aplicación' means 'to develop an application'.",
        spanishText: "desarrollar"
      }
    ],
    advanced: [
      {
        question: "Which word describes a state of extreme weariness or boredom, often used to refer to tediousness?",
        options: ["el hastío", "la algarabía", "el regocijo", "el sosiego"],
        correctIndex: 0,
        explanation: "El hastío refers to weariness, boredom, or disgust. Algarabía means rejoicing/clatter, regocijo means joy, and sosiego means calmness.",
        spanishText: "el hastío"
      },
      {
        question: "What is the meaning of 'estremecer'?",
        options: ["To straighten", "To shudder or shake", "To stretch", "To narrow"],
        correctIndex: 1,
        explanation: "Estremecer means to shake, shudder, or tremble, often used with emotions or physical movements.",
        spanishText: "estremecer"
      }
    ]
  },
  travel: {
    beginner: [
      {
        question: "How do you ask 'Where is the bathroom?' in Spanish?",
        options: ["¿Dónde está el baño?", "¿Cuánto cuesta esto?", "¿Qué hora es?", "¿Dónde está la estación?"],
        correctIndex: 0,
        explanation: "¿Dónde está el baño? is the essential phrase for asking 'Where is the bathroom?'.",
        spanishText: "¿Dónde está el baño?"
      },
      {
        question: "What is the polite way to say 'Please' in Spanish?",
        options: ["De nada", "Por favor", "Muchas gracias", "Disculpe"],
        correctIndex: 1,
        explanation: "Por favor means 'Please'. De nada means 'You are welcome', muchas gracias is 'Thank you very much', and disculpe is 'Excuse me'.",
        spanishText: "por favor"
      }
    ],
    intermediate: [
      {
        question: "How would you ask for the bill at a Spanish restaurant?",
        options: ["¿Me trae la cuenta, por favor?", "¿Dónde está la cocina?", "¿Tiene un menú del día?", "¿Cuánto vale la comida?"],
        correctIndex: 0,
        explanation: "¿Me trae la cuenta, por favor? is the standard, polite way to ask a waiter: 'Could you bring me the bill, please?'",
        spanishText: "¿Me trae la cuenta, por favor?"
      },
      {
        question: "What are you asking for when you say 'Quiero un billete de ida y vuelta'?",
        options: ["A business class upgrade", "A single-use transit card", "A round-trip ticket", "A one-way ticket"],
        correctIndex: 2,
        explanation: "Un billete/boleto de 'ida y vuelta' means a 'round-trip' (go and return) ticket. A one-way ticket is just 'ida' or 'un solo sentido'.",
        spanishText: "un billete de ida y vuelta"
      }
    ],
    advanced: [
      {
        question: "If a local in Spain tells you, 'El tren tiene un transbordo obligatorio en Zaragoza', what must you do?",
        options: ["Claim your checked luggage early", "Pay an extra high-speed surcharge", "Change trains/transfer", "Purchase a new physical ticket"],
        correctIndex: 2,
        explanation: "'Un transbordo' refers to a connection or transfer. Zaragoza is a mandatory transfer point on that route.",
        spanishText: "El tren tiene un transbordo obligatorio en Zaragoza"
      }
    ]
  },
  grammar: {
    beginner: [
      {
        question: "Fill in the blank: 'Yo ___ de México.' (Expressing origin)",
        options: ["estoy", "soy", "tengo", "hago"],
        correctIndex: 1,
        explanation: "Use 'soy' (from the verb Ser) to express origin or nationality. 'Estoy' (from Estar) is used for location or temporary states.",
        spanishText: "Yo soy de México"
      },
      {
        question: "Which pronoun is used for 'They' (all-female group)?",
        options: ["Ellos", "Nosotras", "Ellas", "Ustedes"],
        correctIndex: 2,
        explanation: "Ellas is 'they' (female). Ellos is 'they' (all-male or mixed), nosotras is 'we' (female), and ustedes is 'you all'.",
        spanishText: "ellas"
      }
    ],
    intermediate: [
      {
        question: "Choose the correct preposition: 'Este regalo es ___ ti.' (Recipient)",
        options: ["por", "para", "de", "con"],
        correctIndex: 1,
        explanation: "Use 'para' when indicating the recipient of an object (e.g., 'para ti' = for you). 'Por' is used for duration, cause, or exchange.",
        spanishText: "Este regalo es para ti."
      },
      {
        question: "Complete the sentence with the correct past tense form: 'Ayer yo ___ al mercado.'",
        options: ["fui", "iba", "voy", "fuera"],
        correctIndex: 0,
        explanation: "'Ayer' (yesterday) signals a completed action in the past, so the preterite tense 'fui' (I went) is used instead of the imperfect 'iba'.",
        spanishText: "Ayer yo fui al mercado."
      }
    ],
    advanced: [
      {
        question: "Select the sentence that correctly uses the subjunctive mood:",
        options: [
          "Es obvio que él venga temprano.",
          "Espero que ellos hayan terminado a tiempo.",
          "Creo que tú tengas razón.",
          "No dudo que ella sabe hablar español."
        ],
        correctIndex: 1,
        explanation: "'Espero que...' (I hope that) expresses a wish, triggering the present perfect subjunctive 'hayan terminado'. Statements of certainty (es obvio, creo, no dudo) trigger the indicative.",
        spanishText: "Espero que ellos hayan terminado a tiempo."
      }
    ]
  },
  slang: {
    beginner: [
      {
        question: "In Spain, if someone says something is 'guay', what do they mean?",
        options: ["It is expensive", "It is terrible", "It is boring", "It is cool / great"],
        correctIndex: 3,
        explanation: "'Guay' is very common Spanish slang meaning 'cool' or 'awesome'. In Mexico, the equivalent is 'chido' or 'padre'.",
        spanishText: "guay"
      }
    ],
    intermediate: [
      {
        question: "What is the meaning of the colloquial idiom 'tomar el pelo'?",
        options: ["To cut hair", "To pull someone's leg / tease", "To get angry", "To run away quickly"],
        correctIndex: 1,
        explanation: "'Tomar el pelo' literally means 'to take the hair' but idiomatically means 'to pull someone's leg' or tease/fool them.",
        spanishText: "tomar el pelo"
      },
      {
        question: "If someone tells you '¡Ponte las pilas!', what are they urging you to do?",
        options: ["Charge your smartphone", "Go to sleep early", "Wake up / get your act together / pay attention", "Buy groceries"],
        correctIndex: 2,
        explanation: "'Ponerse las pilas' (literally 'to put on batteries') is a super popular idiom meaning to focus, wake up, get your act together, or put energy into something.",
        spanishText: "¡Ponte las pilas!"
      }
    ],
    advanced: [
      {
        question: "What does the phrase 'Estar de mala leche' mean?",
        options: ["To be extremely lucky", "To be in a bad mood / have bad intentions", "To run out of groceries", "To be feeling energetic"],
        correctIndex: 1,
        explanation: "'Estar de mala leche' (literally 'to be of bad milk') means to be in a bad mood, or to act with bad temper/intentions.",
        spanishText: "estar de mala leche"
      }
    ]
  },
  listening: {
    beginner: [
      {
        question: "Listen to the word and select the correct English translation of the spoken term:",
        options: ["Cat", "Dog", "Horse", "Bird"],
        correctIndex: 1,
        explanation: "'Perro' means dog in Spanish. Click the speaker button to hear its pronunciation with a rolling double-r!",
        spanishText: "perro"
      },
      {
        question: "Listen to the greeting and identify which phrase is being spoken:",
        options: ["Buenas noches", "Buenos días", "Hola, ¿cómo estás?", "Adiós, hasta mañana"],
        correctIndex: 1,
        explanation: "'Buenos días' is spoken. It translates to 'Good morning'. Hear the clear vowels!",
        spanishText: "buenos días"
      }
    ],
    intermediate: [
      {
        question: "Listen to the Spanish question and select what the speaker is asking about:",
        options: ["Asking for the time", "Asking for directions to a hotel", "Asking for the price of an item", "Asking for recommendations"],
        correctIndex: 2,
        explanation: "The phrase is '¿Cuánto cuesta este billete?' which translates to 'How much does this ticket cost?', thus asking for the price.",
        spanishText: "¿Cuánto cuesta este billete?"
      }
    ],
    advanced: [
      {
        question: "Listen to this subjunctive idiom and select its meaning:",
        options: [
          "No matter what happens",
          "As far as I know",
          "As you wish / whatever you say",
          "Believe it or not"
        ],
        correctIndex: 2,
        explanation: "'Como tú quieras' uses the subjunctive 'quieras' to mean 'As you wish' or 'Whatever you want'.",
        spanishText: "como tú quieras"
      }
    ]
  }
};

export function getFallbackQuestion(category: CategoryType, difficulty: DifficultyType): SpanishQuestion {
  const list = STATIC_QUESTIONS[category][difficulty];
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}
