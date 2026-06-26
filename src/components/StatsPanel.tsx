import React from "react";
import { GameStats } from "../types";
import { Award, Trophy, Target, Flame, RefreshCw, Zap } from "lucide-react";

interface StatsPanelProps {
  stats: GameStats;
  onResetStats: () => void;
  difficulty: string;
}

export default function StatsPanel({ stats, onResetStats, difficulty }: StatsPanelProps) {
  const accuracy = stats.totalAnswers > 0 ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) : 0;
  
  // Calculate badge/level title
  let levelTitle = "Principiante";
  let badgeColor = "bg-[#E9C46A] text-[#2D2424]";
  if (stats.correctAnswers >= 30) {
    levelTitle = "Embajador de Español";
    badgeColor = "bg-[#E63946] text-white";
  } else if (stats.correctAnswers >= 15) {
    levelTitle = "Hablante Fluido";
    badgeColor = "bg-[#F4A261] text-white";
  } else if (stats.correctAnswers >= 5) {
    levelTitle = "Estudiante Avanzado";
    badgeColor = "bg-[#2A9D8F] text-white";
  }

  return (
    <div id="stats-panel-card" className="bg-white rounded-3xl border-4 border-[#2D2424] p-6 shadow-[8px_8px_0px_0px_#2D2424] text-[#2D2424]">
      <div className="flex justify-between items-center mb-5 border-b-2 border-[#2D2424] pb-2">
        <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
          <Award className="w-5 h-5 text-[#E63946]" />
          Tu Progreso
        </h3>
        <button
          id="btn-reset-stats"
          onClick={onResetStats}
          className="text-xs text-[#2D2424] bg-[#F1FAEE] hover:bg-rose-500 hover:text-white border-2 border-[#2D2424] px-2.5 py-1 rounded-xl font-bold transition-all shadow-[2px_2px_0px_0px_#2D2424] active:translate-y-0.5 flex items-center gap-1"
          title="Reiniciar estadísticas"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reiniciar
        </button>
      </div>

      {/* Mastery Badge */}
      <div className={`mb-6 p-4 rounded-2xl border-2 border-[#2D2424] ${badgeColor} flex items-center gap-3 shadow-[3px_3px_0px_0px_#2D2424]`}>
        <div className="p-2 bg-white/25 rounded-lg border border-[#2D2424]/20">
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider opacity-85">Rango Actual</p>
          <h4 className="text-sm font-black uppercase tracking-tight truncate">{levelTitle}</h4>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Games Played */}
        <div className="bg-[#F1FAEE] p-3 rounded-xl border-2 border-[#2D2424] flex items-center gap-3 shadow-[3px_3px_0px_0px_#2D2424]">
          <div className="p-2 bg-white text-[#2D2424] border-2 border-[#2D2424] rounded-lg">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#2D2424]/60 uppercase tracking-wide">Partidas</p>
            <p className="text-base font-black">{stats.gamesPlayed}</p>
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-[#F1FAEE] p-3 rounded-xl border-2 border-[#2D2424] flex items-center gap-3 shadow-[3px_3px_0px_0px_#2D2424]">
          <div className="p-2 bg-white text-[#2D2424] border-2 border-[#2D2424] rounded-lg">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#2D2424]/60 uppercase tracking-wide">Victorias</p>
            <p className="text-base font-black">{stats.playerWins}</p>
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-[#F1FAEE] p-3 rounded-xl border-2 border-[#2D2424] flex items-center gap-3 shadow-[3px_3px_0px_0px_#2D2424]">
          <div className="p-2 bg-white text-[#2D2424] border-2 border-[#2D2424] rounded-lg">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#2D2424]/60 uppercase tracking-wide">Precisión</p>
            <p className="text-base font-black">{accuracy}%</p>
          </div>
        </div>

        {/* Racha / Streak */}
        <div className="bg-[#F1FAEE] p-3 rounded-xl border-2 border-[#2D2424] flex items-center gap-3 shadow-[3px_3px_0px_0px_#2D2424]">
          <div className="p-2 bg-white text-[#2D2424] border-2 border-[#2D2424] rounded-lg">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#2D2424]/60 uppercase tracking-wide">Racha</p>
            <p className="text-base font-black">{stats.streak} 🔥</p>
          </div>
        </div>
      </div>

      {/* Answer Accuracy Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-black uppercase tracking-wider text-[#2D2424]">
          <span>Respuestas Correctas</span>
          <span>{stats.correctAnswers}/{stats.totalAnswers}</span>
        </div>
        <div className="w-full h-4 bg-[#F1FAEE] rounded-full overflow-hidden border-2 border-[#2D2424]">
          <div
            className="h-full bg-[#2A9D8F] rounded-full transition-all duration-500 border-r-2 border-[#2D2424]"
            style={{ width: `${accuracy}%` }}
          />
        </div>
      </div>

      {/* Pedagogical Hint */}
      <div className="mt-5 p-4 rounded-xl bg-[#F1FAEE] border-2 border-[#2D2424] text-xs leading-relaxed text-[#2D2424] shadow-[3px_3px_0px_0px_#2D2424]">
        <p className="font-black uppercase tracking-wider text-[#E63946] mb-1 flex items-center gap-1.5">
          💡 Consejo del Tutor:
        </p>
        <p className="font-bold">
          {difficulty === "beginner" ? (
            "Concéntrate en el vocabulario básico y las frases de viaje cotidianas. No te preocupes por la gramática compleja por ahora."
          ) : difficulty === "intermediate" ? (
            "Pon atención a la diferencia entre los verbos 'Ser' y 'Estar' y la correcta preposición 'Por' o 'Para'."
          ) : (
            "Intenta formular oraciones en subjuntivo y aprende la jerga local. ¡La práctica hace al maestro!"
          )}
        </p>
      </div>
    </div>
  );
}
