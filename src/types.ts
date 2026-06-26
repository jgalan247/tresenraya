export interface SpanishQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  spanishText: string;
}

export type CategoryType = "vocab" | "travel" | "grammar" | "slang" | "listening";

export type DifficultyType = "beginner" | "intermediate" | "advanced";

export interface GameStats {
  gamesPlayed: number;
  playerWins: number;
  botWins: number;
  draws: number;
  correctAnswers: number;
  totalAnswers: number;
  streak: number;
}

export interface Player {
  name: string;
  symbol: "X" | "O";
  color: string;
  isBot: boolean;
}

export interface CellState {
  symbol: "X" | "O" | null;
  category: CategoryType;
  question?: SpanishQuestion;
}

export interface TutorMessage {
  id: string;
  sender: "user" | "bot" | "system";
  text: string;
  timestamp: Date;
}
