import React, { useState } from "react";
import { SpanishQuestion, CategoryType } from "../types";
import { CATEGORIES } from "../data";
import AudioPronounce from "./AudioPronounce";
import { CheckCircle2, XCircle, Sparkles, BookOpen, Volume2, HelpCircle } from "lucide-react";

interface QuestionModalProps {
  question: SpanishQuestion;
  category: CategoryType;
  isDefenseMode: boolean; // True if bot is attacking and user needs to defend
  onAnswerSubmit: (isCorrect: boolean, selectedAnswer: string) => void;
  onAskTutorMore: (questionText: string, options: string[], correctIndex: number, userAnswer: string) => void;
}

export default function QuestionModal({
  question,
  category,
  isDefenseMode,
  onAnswerSubmit,
  onAskTutorMore
}: QuestionModalProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const categoryInfo = CATEGORIES.find((c) => c.value === category) || CATEGORIES[0];
  const isCorrect = selectedIdx === question.correctIndex;

  const handleOptionClick = (index: number) => {
    if (isSubmitted) return;
    setSelectedIdx(index);
  };

  const handleSubmit = () => {
    if (selectedIdx === null || isSubmitted) return;
    setIsSubmitted(true);
  };

  const handleContinue = () => {
    if (selectedIdx === null) return;
    onAnswerSubmit(selectedIdx === question.correctIndex, question.options[selectedIdx]);
  };

  const handleAskTutor = () => {
    if (selectedIdx === null) return;
    onAskTutorMore(
      question.question,
      question.options,
      question.correctIndex,
      question.options[selectedIdx]
    );
  };

  return (
    <div id="question-modal-backdrop" className="fixed inset-0 bg-[#2D2424]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        id="question-modal-card"
        className="bg-white w-full max-w-xl rounded-3xl border-4 border-[#2D2424] shadow-[10px_10px_0px_0px_#2D2424] overflow-hidden animate-scale-up"
      >
        {/* Modal Header */}
        <div className={`p-5 text-white flex justify-between items-center border-b-4 border-[#2D2424] ${
          isDefenseMode 
            ? "bg-[#E76F51]" 
            : "bg-[#2A9D8F]"
        }`}>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-[#2D2424] text-white px-3 py-1.5 rounded-full border-2 border-white shadow-[2px_2px_0px_0px_#2D2424]">
              {categoryInfo.label}
            </span>
            <h3 className="text-xl font-black mt-3.5 flex items-center gap-2 uppercase tracking-tight">
              {isDefenseMode ? "🛡️ ¡Alerta de Defensa!" : "⚡ ¡Tu Turno de Atacar!"}
            </h3>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black uppercase bg-[#2D2424]/30 px-3 py-1 rounded-lg border border-[#2D2424]/20">
              {isDefenseMode ? "Santi Ataca" : "Reclama la X"}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Objective Banner */}
          <div className={`p-3.5 rounded-xl text-xs mb-6 font-bold leading-relaxed border-2 border-[#2D2424] shadow-[2px_2px_0px_0px_#2D2424] ${
            isDefenseMode 
              ? "bg-[#F4A261]/20 text-[#2D2424]" 
              : "bg-[#2A9D8F]/20 text-[#2D2424]"
          }`}>
            {isDefenseMode 
              ? "Santi está atacando esta casilla. Responde correctamente para mantenerla vacía y detenerlo. Si fallas, Santi colocará su O."
              : "Responde correctamente para reclamar esta casilla con tu X. Si fallas, perderás tu turno y quedará abierta para que te la roben."
            }
          </div>

          {/* Question Text */}
          <div className="mb-6 space-y-4">
            <h4 className="text-lg md:text-xl font-black text-[#2D2424] leading-snug">
              {question.question}
            </h4>

            {/* TTS Pronunciation widget */}
            {question.spanishText && (
              <div className="flex items-center gap-3 bg-[#F1FAEE] p-3 rounded-xl border-2 border-[#2D2424] shadow-[3px_3px_0px_0px_#2D2424]">
                <AudioPronounce text={question.spanishText} size="md" autoPlay={category === "listening"} />
                <div>
                  <p className="text-[10px] text-[#2D2424]/60 uppercase tracking-wider font-black">Pronunciación en Español</p>
                  <p className="text-base font-black text-[#2D2424] font-serif italic">
                    "{question.spanishText}"
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Multiple Choice Options */}
          <div className="space-y-3 mb-6">
            {question.options.map((option, idx) => {
              // Custom coloring after submission
              let optionClass = "bg-[#F1FAEE] text-[#2D2424] hover:bg-yellow-50 shadow-[3px_3px_0px_0px_#2D2424] hover:scale-[1.01] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#2D2424]";
              if (selectedIdx === idx) {
                optionClass = "bg-[#457B9D] text-white shadow-[3px_3px_0px_0px_#2D2424]";
              }
              if (isSubmitted) {
                if (idx === question.correctIndex) {
                  optionClass = "bg-[#2A9D8F] text-white shadow-[3px_3px_0px_0px_#2D2424] pointer-events-none";
                } else if (selectedIdx === idx && idx !== question.correctIndex) {
                  optionClass = "bg-[#E63946] text-white shadow-[3px_3px_0px_0px_#2D2424] pointer-events-none";
                } else {
                  optionClass = "bg-slate-100 text-[#2D2424]/30 opacity-50 border-dashed pointer-events-none";
                }
              }

              return (
                <button
                  id={`opt-btn-${idx}`}
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={isSubmitted}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border-2 border-[#2D2424] text-sm font-black transition-all flex items-center justify-between ${optionClass}`}
                >
                  <span className="flex-grow pr-3">{option}</span>
                  {isSubmitted && idx === question.correctIndex && (
                    <CheckCircle2 className="w-5 h-5 text-white shrink-0 drop-shadow-[1px_1px_0px_#2D2424]" />
                  )}
                  {isSubmitted && selectedIdx === idx && idx !== question.correctIndex && (
                    <XCircle className="w-5 h-5 text-white shrink-0 drop-shadow-[1px_1px_0px_#2D2424]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Tutor Explanation Panel (post-submit) */}
          {isSubmitted && (
            <div className={`p-5 rounded-2xl border-4 border-[#2D2424] shadow-[4px_4px_0px_0px_#2D2424] mb-6 animate-fade-in ${
              isCorrect 
                ? "bg-[#2A9D8F]/15 text-[#2D2424]" 
                : "bg-[#E63946]/15 text-[#2D2424]"
            }`}>
              <div className="flex items-center gap-2 font-black uppercase text-sm mb-2.5">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[#2A9D8F] drop-shadow-[1px_1px_0px_#2D2424]" />
                    <span>¡Excelente! Respuesta Correcta</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-[#E63946] drop-shadow-[1px_1px_0px_#2D2424]" />
                    <span>¡Incorrecto! Práctica extra</span>
                  </>
                )}
              </div>
              <p className="text-xs font-bold leading-relaxed mb-4">
                {question.explanation}
              </p>

              {/* Tutor Action Button */}
              <button
                id="btn-ask-santi-more"
                onClick={handleAskTutor}
                className="w-full text-center py-2.5 px-3 rounded-xl text-xs bg-[#E9C46A] hover:bg-amber-400 text-[#2D2424] border-2 border-[#2D2424] font-black uppercase tracking-tight flex items-center justify-center gap-2 transition-all shadow-[2px_2px_0px_0px_#2D2424] active:translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 text-[#E63946]" />
                Preguntar más detalles a Santi el Tutor AI
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#F1FAEE] px-6 py-4 flex justify-end gap-3 border-t-4 border-[#2D2424]">
          {!isSubmitted ? (
            <button
              id="btn-question-submit"
              onClick={handleSubmit}
              disabled={selectedIdx === null}
              className="bg-[#2D2424] hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl border-2 border-[#2D2424] shadow-[3px_3px_0px_0px_#2D2424] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#2D2424] transition-all disabled:opacity-45"
            >
              Responder
            </button>
          ) : (
            <button
              id="btn-question-continue"
              onClick={handleContinue}
              className="bg-[#2A9D8F] hover:bg-[#207a6f] text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl border-2 border-[#2D2424] shadow-[3px_3px_0px_0px_#2D2424] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#2D2424] transition-all flex items-center gap-2"
            >
              Continuar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
