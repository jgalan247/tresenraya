import React from "react";
import { CellState, CategoryType } from "../types";
import { CATEGORIES } from "../data";
import { BookOpen, Compass, Sliders, MessageSquare, Headphones, HelpCircle } from "lucide-react";

interface TicTacToeBoardProps {
  board: CellState[];
  onCellClick: (index: number) => void;
  disabled: boolean;
  userSymbol: "X" | "O";
  winningLine: number[] | null;
}

const ICON_MAP: Record<string, any> = {
  BookOpen,
  Compass,
  Sliders,
  MessageSquare,
  Headphones
};

export default function TicTacToeBoard({
  board,
  onCellClick,
  disabled,
  userSymbol,
  winningLine
}: TicTacToeBoardProps) {
  
  return (
    <div className="relative w-full max-w-[420px] mx-auto">
      {/* The 3x3 Grid with black borders and flat shadows */}
      <div id="tictactoe-grid" className="grid grid-cols-3 gap-4 bg-[#2D2424] p-4 rounded-[28px] border-4 border-[#2D2424] shadow-[8px_8px_0px_0px_#2D2424]">
        {board.map((cell, index) => {
          const categoryInfo = CATEGORIES.find((c) => c.value === cell.category) || CATEGORIES[0];
          const CategoryIcon = ICON_MAP[categoryInfo.icon] || HelpCircle;
          
          const isWinningCell = winningLine?.includes(index);
          const hasSymbol = cell.symbol !== null;

          return (
            <button
              id={`grid-cell-${index}`}
              key={index}
              onClick={() => onCellClick(index)}
              disabled={disabled || hasSymbol}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-between p-2.5 transition-all duration-200 relative focus:outline-none border-2 border-[#2D2424]
                ${hasSymbol 
                  ? cell.symbol === "X"
                    ? "bg-[#E63946] text-white shadow-[3px_3px_0px_0px_#2D2424]"
                    : "bg-[#457B9D] text-white shadow-[3px_3px_0px_0px_#2D2424]"
                  : "bg-[#F1FAEE] hover:bg-[#E9C46A]/20 hover:scale-[1.02] text-[#2D2424] shadow-[4px_4px_0px_0px_#2D2424] active:translate-y-0.5 active:translate-x-0.5 active:shadow-[1px_1px_0px_0px_#2D2424]"
                }
                ${isWinningCell ? "ring-4 ring-[#E9C46A] ring-offset-4 animate-bounce" : ""}
                ${disabled && !hasSymbol ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
              `}
              title={hasSymbol ? `Claimed by ${cell.symbol}` : `Category: ${categoryInfo.label}`}
            >
              {/* Category Name & Small Icon (Top) */}
              {!hasSymbol && (
                <div className="w-full flex items-center justify-between text-[9px] font-black tracking-wider uppercase text-[#2D2424]/70">
                  <span className="truncate">{categoryInfo.label}</span>
                  <CategoryIcon className="w-3.5 h-3.5 text-[#2D2424] shrink-0 ml-1" />
                </div>
              )}

              {/* Center Value (X, O, or Category Visual) */}
              <div className="flex-1 flex items-center justify-center">
                {cell.symbol === "X" ? (
                  <span className="text-6xl font-black text-white drop-shadow-[3px_3px_0px_#2D2424] animate-fade-in font-sans">X</span>
                ) : cell.symbol === "O" ? (
                  <span className="text-6xl font-black text-white drop-shadow-[3px_3px_0px_#2D2424] animate-fade-in font-sans">O</span>
                ) : (
                  <div className={`p-2 rounded-xl bg-white border-2 border-[#2D2424] text-[#2D2424] shadow-[2px_2px_0px_0px_#2D2424] transition-transform duration-200 group-hover:scale-110`}>
                    <CategoryIcon className="w-6 h-6" />
                  </div>
                )}
              </div>

              {/* Bottom description / Status */}
              <div className="text-[9px] text-center font-black uppercase tracking-tight truncate text-[#2D2424]/60 max-w-full">
                {hasSymbol ? "Reclamada" : categoryInfo.desc}
              </div>

              {/* Little index bubble for alignment reference */}
              <span className="absolute bottom-1 right-2 text-[10px] font-black text-[#2D2424]/40 select-none font-mono">
                {index + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
