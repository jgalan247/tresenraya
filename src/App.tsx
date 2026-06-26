import React, { useState, useEffect } from "react";
import { CellState, SpanishQuestion, CategoryType, DifficultyType, GameStats, Player } from "./types";
import { CATEGORIES, getFallbackQuestion } from "./data";
import { Sparkles, Trophy, Settings, RefreshCw, Zap, Volume2, Award, Users, Bot, Check, AlertCircle, Info, VolumeX } from "lucide-react";

// Spanish Learning Components from ./components/
import StatsPanelComponent from "./components/StatsPanel";
import TutorChatComponent from "./components/TutorChat";
import TicTacToeBoardComponent from "./components/TicTacToeBoard";
import QuestionModalComponent from "./components/QuestionModal";

export default function App() {
  // Game Setup State
  const [difficulty, setDifficulty] = useState<DifficultyType>("beginner");
  const [isSinglePlayer, setIsSinglePlayer] = useState<boolean>(true); // Against Santi the AI Tutor Bot
  const [aiEnabled, setAiEnabled] = useState<boolean>(false);
  const [isCheckingAi, setIsCheckingAi] = useState<boolean>(true);

  // Active Game State
  const [board, setBoard] = useState<CellState[]>([]);
  const [turn, setTurn] = useState<"X" | "O">("X"); // X is User, O is Bot or Player 2
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [winner, setWinner] = useState<"X" | "O" | "Draw" | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [botIsThinking, setBotIsThinking] = useState<boolean>(false);

  // Modal / Question State
  const [activeCellIndex, setActiveCellIndex] = useState<number | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<SpanishQuestion | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState<boolean>(false);
  const [isDefenseMode, setIsDefenseMode] = useState<boolean>(false);

  // Tutor Sidebar Interaction
  const [tutorMessage, setTutorMessage] = useState<string>("");

  // Statistics State (cached in localStorage)
  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 0,
    playerWins: 0,
    botWins: 0,
    draws: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    streak: 0
  });

  // Load stats from localStorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem("spanish_ttt_stats_v2");
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        console.error("Failed to parse local stats", e);
      }
    }
    
    // Check if the AI backend is healthy and fully loaded
    checkAiStatus();
  }, []);

  // Save stats to localStorage when they change
  const saveStats = (newStats: GameStats) => {
    setStats(newStats);
    localStorage.setItem("spanish_ttt_stats_v2", JSON.stringify(newStats));
  };

  const checkAiStatus = async () => {
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      setAiEnabled(!!data.aiEnabled);
    } catch (e) {
      console.warn("Express AI backend not fully active yet. Falling back to offline Spanish engine.", e);
      setAiEnabled(false);
    } finally {
      setIsCheckingAi(false);
    }
  };

  // Generate a randomized distribution of categories for the 9-cell board
  const generateNewBoard = (): CellState[] => {
    const availableCategories: CategoryType[] = ["vocab", "travel", "grammar", "slang", "listening"];
    const cells: CellState[] = [];
    
    for (let i = 0; i < 9; i++) {
      // Pick a semi-random category with distribution, ensuring a good variety on board
      const category = availableCategories[Math.floor(Math.random() * availableCategories.length)];
      cells.push({
        symbol: null,
        category: category
      });
    }
    return cells;
  };

  // Start / Reset Game
  const handleStartGame = () => {
    const newBoard = generateNewBoard();
    setBoard(newBoard);
    setTurn("X");
    setWinner(null);
    setWinningLine(null);
    setGameActive(true);
    setBotIsThinking(false);
    setActiveCellIndex(null);
    setActiveQuestion(null);
    setIsDefenseMode(false);
  };

  // Cell Selection Handler
  const handleCellClick = async (index: number) => {
    if (!gameActive || board[index].symbol !== null || botIsThinking || activeQuestion) return;

    const cell = board[index];
    setActiveCellIndex(index);
    setIsLoadingQuestion(true);
    setIsDefenseMode(false);

    try {
      let fetchedQuestion: SpanishQuestion;

      if (aiEnabled) {
        // Fetch dynamically generated question from Gemini API
        const response = await fetch("/api/spanish/generate-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: cell.category,
            difficulty: difficulty,
            seed: Math.random()
          })
        });

        if (response.ok) {
          fetchedQuestion = await response.json();
        } else {
          throw new Error("API Question build failed, falling back");
        }
      } else {
        // Fallback to offline questions
        fetchedQuestion = getFallbackQuestion(cell.category, difficulty);
      }

      setActiveQuestion(fetchedQuestion);
    } catch (error) {
      console.warn("Using high-quality offline fallback question:", error);
      const fallback = getFallbackQuestion(cell.category, difficulty);
      setActiveQuestion(fallback);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  // Submit Answer from Modal
  const handleAnswerSubmit = (isCorrect: boolean, selectedAnswer: string) => {
    if (activeCellIndex === null || !activeQuestion) return;

    // Update Statistics
    const newStats = { ...stats };
    newStats.totalAnswers += 1;
    if (isCorrect) {
      newStats.correctAnswers += 1;
      newStats.streak += 1;
    } else {
      newStats.streak = 0; // Break streak on incorrect answer
    }

    const cell = board[activeCellIndex];
    const updatedBoard = [...board];

    if (!isDefenseMode) {
      // USER'S ATTACK TURN
      if (isCorrect) {
        // Answered correctly on their own turn -> Claim square!
        updatedBoard[activeCellIndex] = {
          ...cell,
          symbol: "X",
          question: activeQuestion
        };
        setBoard(updatedBoard);
        
        // Check game status
        const gameStatus = checkWinner(updatedBoard);
        if (gameStatus.winner) {
          handleGameOver(gameStatus.winner, gameStatus.line, newStats);
        } else {
          // Pass turn to opponent
          setTurn("O");
          saveStats(newStats);
          if (isSinglePlayer) {
            triggerBotTurn(updatedBoard, newStats);
          }
        }
      } else {
        // Incorrect answer -> Lose turn, square remains unclaimed!
        saveStats(newStats);
        setTurn("O");
        if (isSinglePlayer) {
          triggerBotTurn(updatedBoard, newStats);
        }
      }
    } else {
      // USER'S DEFENSE TURN (AGAINST BOT ATTACK)
      if (isCorrect) {
        // Answered correctly on defense -> Block bot! Cell remains empty, turn returns to User
        saveStats(newStats);
        setTurn("X");
      } else {
        // Failed to defend -> Bot claims the cell!
        updatedBoard[activeCellIndex] = {
          ...cell,
          symbol: "O",
          question: activeQuestion
        };
        setBoard(updatedBoard);

        const gameStatus = checkWinner(updatedBoard);
        if (gameStatus.winner) {
          handleGameOver(gameStatus.winner, gameStatus.line, newStats);
        } else {
          setTurn("X");
          saveStats(newStats);
        }
      }
    }

    // Close Modal
    setActiveCellIndex(null);
    setActiveQuestion(null);
    setIsDefenseMode(false);
  };

  // Handle game end scenarios
  const handleGameOver = (
    gameWinner: "X" | "O" | "Draw",
    line: number[] | null,
    currentStats: GameStats
  ) => {
    setWinner(gameWinner);
    setWinningLine(line);
    setGameActive(false);

    const updatedStats = { ...currentStats };
    updatedStats.gamesPlayed += 1;

    if (gameWinner === "X") {
      updatedStats.playerWins += 1;
    } else if (gameWinner === "O") {
      updatedStats.botWins += 1;
    } else {
      updatedStats.draws += 1;
    }

    saveStats(updatedStats);
  };

  // Bot Turn Logic
  const triggerBotTurn = (currentBoard: CellState[], currentStats: GameStats) => {
    setBotIsThinking(true);
    
    // Delayed response for natural "thinking" feel
    setTimeout(async () => {
      if (!gameActive) {
        setBotIsThinking(false);
        return;
      }

      // Find best cell for the bot
      const targetIndex = calculateBotMove(currentBoard);
      if (targetIndex === -1) {
        setBotIsThinking(false);
        return;
      }

      const cell = currentBoard[targetIndex];
      setActiveCellIndex(targetIndex);
      setIsDefenseMode(true);
      setIsLoadingQuestion(true);
      setBotIsThinking(false);

      try {
        let fetchedQuestion: SpanishQuestion;
        if (aiEnabled) {
          const response = await fetch("/api/spanish/generate-question", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              category: cell.category,
              difficulty: difficulty,
              seed: Math.random()
            })
          });

          if (response.ok) {
            fetchedQuestion = await response.json();
          } else {
            throw new Error("API Question build failed, falling back");
          }
        } else {
          fetchedQuestion = getFallbackQuestion(cell.category, difficulty);
        }
        setActiveQuestion(fetchedQuestion);
      } catch (error) {
        console.warn("Using offline fallback question for defense:", error);
        const fallback = getFallbackQuestion(cell.category, difficulty);
        setActiveQuestion(fallback);
      } finally {
        setIsLoadingQuestion(false);
      }
    }, 1500);
  };

  // Calculate Bot Move (Classic Tic-Tac-Toe block/win strategy + priority fallback)
  const calculateBotMove = (currentBoard: CellState[]): number => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical
      [0, 4, 8], [2, 4, 6]             // Diagonal
    ];

    // 1. Check if Bot can win in this turn
    for (const line of lines) {
      const symbols = line.map(idx => currentBoard[idx].symbol);
      const oCount = symbols.filter(s => s === "O").length;
      const nullIndex = line.find(idx => currentBoard[idx].symbol === null);
      if (oCount === 2 && nullIndex !== undefined) {
        return nullIndex;
      }
    }

    // 2. Check if Bot needs to block Player from winning
    for (const line of lines) {
      const symbols = line.map(idx => currentBoard[idx].symbol);
      const xCount = symbols.filter(s => s === "X").length;
      const nullIndex = line.find(idx => currentBoard[idx].symbol === null);
      if (xCount === 2 && nullIndex !== undefined) {
        return nullIndex;
      }
    }

    // 3. Aim for Center if available
    if (currentBoard[4].symbol === null) return 4;

    // 4. Aim for Corners
    const corners = [0, 2, 6, 8];
    const openCorners = corners.filter(idx => currentBoard[idx].symbol === null);
    if (openCorners.length > 0) {
      return openCorners[Math.floor(Math.random() * openCorners.length)];
    }

    // 5. Fallback to any remaining empty cell
    const emptyIndices = currentBoard
      .map((cell, idx) => cell.symbol === null ? idx : -1)
      .filter(idx => idx !== -1);
    
    if (emptyIndices.length > 0) {
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    return -1;
  };

  // Check Game Winner
  const checkWinner = (currentBoard: CellState[]): { winner: "X" | "O" | "Draw" | null; line: number[] | null } => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical
      [0, 4, 8], [2, 4, 6]             // Diagonal
    ];

    for (const line of lines) {
      const [a, b, c] = line;
      if (
        currentBoard[a].symbol &&
        currentBoard[a].symbol === currentBoard[b].symbol &&
        currentBoard[a].symbol === currentBoard[c].symbol
      ) {
        return { winner: currentBoard[a].symbol as "X" | "O", line };
      }
    }

    const isDraw = currentBoard.every((cell) => cell.symbol !== null);
    if (isDraw) return { winner: "Draw", line: null };

    return { winner: null, line: null };
  };

  // Submit dynamic explanation to Santi the Tutor's Chat component
  const handleAskTutorMore = async (
    questionText: string,
    options: string[],
    correctIndex: number,
    userAnswer: string
  ) => {
    setTutorMessage(`Thinking about the question...`);
    try {
      const response = await fetch("/api/spanish/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionText,
          options,
          correctIndex,
          userAnswer,
          category: activeCellIndex !== null ? board[activeCellIndex].category : "vocab",
          difficulty
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTutorMessage(data.explanation);
      } else {
        throw new Error("Failed to get explanation from tutor server");
      }
    } catch (e) {
      // Fallback response
      setTutorMessage(
        `Let me clarify that for you!\n\nQuestion: "${questionText}"\nCorrect Answer: "${options[correctIndex]}"\nYour Answer: "${userAnswer}"\n\nSpanish Tip: For intermediate learners, we often focus on preposition choices and verb structures. Try asking me specific questions like "What is the difference between Ser and Estar?" in the input below!`
      );
    }
  };

  const handleResetStats = () => {
    const freshStats = {
      gamesPlayed: 0,
      playerWins: 0,
      botWins: 0,
      draws: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      streak: 0
    };
    saveStats(freshStats);
  };

  return (
    <div className="min-h-screen bg-[#FDF8F3] text-[#2D2424] flex flex-col font-sans transition-colors duration-200">
      
      {/* Header bar */}
      <header className="bg-white border-b-4 border-[#2D2424] sticky top-0 z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#E63946] text-white rounded-2xl border-2 border-[#2D2424] shadow-[3px_3px_0px_0px_#2D2424]">
              <Sparkles className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-[#E63946]">
                Tres En Raya
              </h1>
              <p className="text-xs font-bold uppercase tracking-wide text-[#2D2424]/60">APRENDE JUGANDO • LEARN BY PLAYING</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 bg-[#E9C46A] rounded-full border-2 border-[#2D2424] font-bold shadow-[3px_3px_0px_0px_#2D2424] text-xs text-[#2D2424]">
              Nivel: {difficulty === "beginner" ? "Principiante" : difficulty === "intermediate" ? "Intermedio" : "Avanzado"}
            </div>
            
            <div className="px-4 py-2 bg-white rounded-full border-2 border-[#2D2424] font-bold shadow-[3px_3px_0px_0px_#2D2424] text-xs text-[#2D2424]">
              Racha: {stats.streak} 🔥
            </div>

            {/* AI Connectivity Indicator */}
            {isCheckingAi ? (
              <span className="text-[11px] font-bold text-[#2D2424] bg-white border-2 border-[#2D2424] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#2D2424]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Conectando...
              </span>
            ) : aiEnabled ? (
              <span className="text-[11px] font-bold text-white bg-[#2A9D8F] border-2 border-[#2D2424] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#2D2424]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping border border-emerald-500" />
                Santi AI Activado
              </span>
            ) : (
              <span className="text-[11px] font-bold text-[#2D2424] bg-[#F4A261] border-2 border-[#2D2424] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#2D2424]">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Modo Estándar
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: Game Configuration and active Tic-Tac-Toe Board */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Options Dashboard Card */}
            <div className="bg-white rounded-3xl border-4 border-[#2D2424] p-6 shadow-[8px_8px_0px_0px_#2D2424] text-[#2D2424] space-y-5">
              <h2 className="text-lg font-black uppercase tracking-tight text-[#2D2424] flex items-center gap-2 border-b-2 border-[#2D2424] pb-2">
                <Settings className="w-5 h-5 text-[#2A9D8F]" />
                Configuración de la Partida
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Mode selection */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-[#2D2424]/70">
                    Modo de Juego
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="btn-mode-single"
                      onClick={() => {
                        setIsSinglePlayer(true);
                        handleStartGame();
                      }}
                      className={`py-2 px-3 rounded-xl border-2 border-[#2D2424] text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:translate-y-0.5
                        ${isSinglePlayer 
                          ? "bg-[#2A9D8F] text-white shadow-[3px_3px_0px_0px_#2D2424]" 
                          : "bg-[#F1FAEE] text-[#2D2424] hover:bg-slate-50"
                        }`}
                    >
                      <Bot className="w-4 h-4" />
                      Contra AI
                    </button>
                    <button
                      id="btn-mode-local"
                      onClick={() => {
                        setIsSinglePlayer(false);
                        handleStartGame();
                      }}
                      className={`py-2 px-3 rounded-xl border-2 border-[#2D2424] text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:translate-y-0.5
                        ${!isSinglePlayer 
                          ? "bg-[#457B9D] text-white shadow-[3px_3px_0px_0px_#2D2424]" 
                          : "bg-[#F1FAEE] text-[#2D2424] hover:bg-slate-50"
                        }`}
                    >
                      <Users className="w-4 h-4" />
                      2 Jugadores
                    </button>
                  </div>
                </div>

                {/* 2. Difficulty selector */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-[#2D2424]/70">
                    Nivel de Español
                  </label>
                  <select
                    id="select-difficulty"
                    value={difficulty}
                    onChange={(e) => {
                      setDifficulty(e.target.value as DifficultyType);
                      handleStartGame();
                    }}
                    className="w-full py-2 px-3 rounded-xl border-2 border-[#2D2424] bg-[#F1FAEE] text-[#2D2424] text-xs font-bold focus:outline-none focus:bg-white"
                  >
                    <option value="beginner">Principiante (Beginner)</option>
                    <option value="intermediate">Intermedio (Intermediate)</option>
                    <option value="advanced">Avanzado (Advanced)</option>
                  </select>
                </div>

                {/* 3. Action / Start button */}
                <div className="flex items-end">
                  <button
                    id="btn-start-game"
                    onClick={handleStartGame}
                    className="w-full bg-[#E63946] hover:bg-[#d0323e] text-white text-xs font-black uppercase py-3 px-4 rounded-xl border-2 border-[#2D2424] shadow-[3px_3px_0px_0px_#2D2424] transition-all active:translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Nueva Partida
                  </button>
                </div>
              </div>
            </div>

            {/* Play area banner & board */}
            {gameActive ? (
              <div className="space-y-6">
                
                {/* Visual game alert banner */}
                <div className={`p-5 rounded-3xl border-4 border-[#2D2424] text-sm flex items-center gap-4 shadow-[6px_6px_0px_0px_#2D2424] transition-all bg-white text-[#2D2424]`}>
                  <div className={`p-3 rounded-xl shrink-0 border-2 border-[#2D2424] text-white ${
                    botIsThinking ? "bg-[#457B9D] animate-spin" :
                    turn === "X" ? "bg-[#2A9D8F]" : "bg-[#E76F51] animate-pulse"
                  }`}>
                    {botIsThinking ? <RefreshCw className="w-5 h-5" /> : <Zap className="w-5 h-5 fill-white" />}
                  </div>

                  <div className="flex-grow">
                    <p className="font-black text-xs uppercase tracking-widest text-[#2D2424]/60">Estado de la Partida</p>
                    <h3 className="font-black text-base mt-0.5 text-[#2D2424]">
                      {botIsThinking 
                        ? "Santi está decidiendo qué casilla atacar... 🤔"
                        : turn === "X"
                        ? "¡Es tu turno! Selecciona una casilla libre y responde en español para reclamarla con X."
                        : isSinglePlayer
                        ? "⚠️ ¡Alerta! El Bot ha elegido atacar. Responde correctamente para defender."
                        : "¡Turno del Jugador 2! Selecciona una casilla y responde para reclamarla con O."
                      }
                    </h3>
                  </div>
                </div>

                {/* Tic-Tac-Toe Active Board Grid */}
                <div className="bg-white rounded-[32px] border-4 border-[#2D2424] py-8 px-6 shadow-[10px_10px_0px_0px_#2D2424] flex items-center justify-center">
                  <TicTacToeBoardComponent
                    board={board}
                    onCellClick={handleCellClick}
                    disabled={botIsThinking || winner !== null}
                    userSymbol="X"
                    winningLine={winningLine}
                  />
                </div>
              </div>
            ) : (
              /* Splash screen before starting the game */
              <div className="bg-white rounded-[32px] border-4 border-[#2D2424] p-8 text-center shadow-[10px_10px_0px_0px_#2D2424] py-12 space-y-6 text-[#2D2424]">
                <div className="w-20 h-20 bg-[#F1FAEE] border-4 border-[#2D2424] rounded-3xl flex items-center justify-center mx-auto text-[#2A9D8F] shadow-[4px_4px_0px_0px_#2D2424] animate-bounce">
                  <Sparkles className="w-10 h-10 fill-[#2A9D8F]/20" />
                </div>

                <div className="max-w-md mx-auto space-y-2">
                  {winner ? (
                    <>
                      <h2 className="text-3xl font-black uppercase tracking-tight text-[#E63946]">
                        {winner === "X" 
                          ? "🎉 ¡Felicidades! Has Ganado" 
                          : winner === "O" 
                          ? "🤖 ¡El Bot Santi ha ganado!" 
                          : "🤝 ¡Es un Empate!"
                        }
                      </h2>
                      <p className="text-[#2D2424]/80 text-sm font-bold">
                        {winner === "X" 
                          ? "¡Tu español es excelente! Has dominado el tablero de Tic-Tac-Toe." 
                          : "Santi el Bot es un gran maestro, pero no te rindas. ¡Practica otra partida para ganarle!"
                        }
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-3xl font-black uppercase tracking-tight text-[#2D2424]">
                        Aprende Español Jugando
                      </h2>
                      <p className="text-[#2D2424]/80 text-sm font-bold leading-relaxed">
                        Selecciona tu nivel de dificultad, elige tu modo de juego preferido, y haz clic abajo para iniciar tu aventura de aprendizaje interactiva.
                      </p>
                    </>
                  )}
                </div>

                <button
                  id="btn-splash-start"
                  onClick={handleStartGame}
                  className="bg-[#E63946] hover:bg-[#d0323e] border-2 border-[#2D2424] text-white font-black uppercase tracking-tight px-8 py-3.5 rounded-xl shadow-[4px_4px_0px_0px_#2D2424] transition-all active:translate-y-0.5 hover:scale-[1.02]"
                >
                  {winner ? "Jugar Otra Vez" : "¡Comenzar el Reto!"}
                </button>

                {/* Rules Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 max-w-2xl mx-auto border-t-2 border-[#2D2424] text-left">
                  <div className="p-4 rounded-xl bg-[#F1FAEE] border-2 border-[#2D2424] text-xs shadow-[3px_3px_0px_0px_#2D2424]">
                    <p className="font-black text-[#2D2424] mb-1.5 flex items-center gap-1.5">
                      ⚔️ Atacar (Tu Turno)
                    </p>
                    <p className="text-[#2D2424]/80 font-medium">
                      Haz clic en cualquier casilla. Responde correctamente la pregunta de su categoría para reclamarla con tu <strong>X</strong>.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F1FAEE] border-2 border-[#2D2424] text-xs shadow-[3px_3px_0px_0px_#2D2424]">
                    <p className="font-black text-[#2D2424] mb-1.5 flex items-center gap-1.5">
                      🛡️ Defender (Turno del Bot)
                    </p>
                    <p className="text-[#2D2424]/80 font-medium">
                      Santi el Bot seleccionará una casilla para atacar. ¡Responde correctamente la pregunta de defensa para bloquearlo!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: Stats panel and virtual Tutor Chat panel */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Student Stats Panel Component */}
            <StatsPanelComponent
              stats={stats}
              onResetStats={handleResetStats}
              difficulty={difficulty}
            />

            {/* AI Tutor Chat component */}
            <TutorChatComponent
              initialMessage={tutorMessage}
            />
          </div>

        </div>
      </main>

      {/* Footer copyright */}
      <footer className="bg-white border-t-4 border-[#2D2424] py-6 px-6 text-center text-xs text-[#2D2424] font-black uppercase tracking-wider">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Spanish Tic-Tac-Toe Academy. Todos los derechos reservados.</p>
          <p>Potenciado por Gemini Flash & Google AI Studio</p>
        </div>
      </footer>

      {/* QUESTION MODAL POPUP */}
      {activeQuestion && activeCellIndex !== null && (
        <QuestionModalComponent
          question={activeQuestion}
          category={board[activeCellIndex].category}
          isDefenseMode={isDefenseMode}
          onAnswerSubmit={handleAnswerSubmit}
          onAskTutorMore={handleAskTutorMore}
        />
      )}

      {/* LOADER FOR FETCHING AI QUESTION */}
      {isLoadingQuestion && (
        <div id="api-question-loader" className="fixed inset-0 bg-[#2D2424]/45 backdrop-blur-xs z-50 flex flex-col items-center justify-center gap-3">
          <div className="p-5 bg-white rounded-2xl border-4 border-[#2D2424] shadow-[6px_6px_0px_0px_#2D2424] flex items-center gap-3 text-[#2D2424] font-bold">
            <Loader2 className="w-6 h-6 animate-spin text-[#E63946]" />
            <span className="text-sm font-black uppercase tracking-tight">
              {isDefenseMode ? "Cargando defensa de Santi..." : "Construyendo reto de la AI..."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple dynamic spinner icon for inline loader
function Loader2({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
