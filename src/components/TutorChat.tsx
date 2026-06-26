import React, { useState, useRef, useEffect } from "react";
import { TutorMessage } from "../types";
import { MessageSquare, Send, Sparkles, Loader2, Bot, HelpCircle } from "lucide-react";

interface TutorChatProps {
  initialMessage?: string;
  onQuestionAsked?: (text: string) => void;
}

export default function TutorChat({ initialMessage, onQuestionAsked }: TutorChatProps) {
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "¡Hola, estudiante! I'm Santi, your personal AI Spanish coach. 🎓\n\nYou can play the Tic-Tac-Toe board to challenge yourself, or ask me anything here! Feel free to ask about grammar rules (like 'Ser vs Estar'), translations, or local slangs. ¿Qué quieres aprender hoy?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const SUGGESTIONS = [
    { label: "Ser vs Estar", prompt: "Explain the difference between Ser and Estar with simple examples." },
    { label: "¿Qué tal?", prompt: "What does '¿Qué tal?' mean and when should I use it?" },
    { label: "Subjuntivo", prompt: "Explain how to use the Subjunctive mood in Spanish in simple terms." },
    { label: "¡Mola mucho!", prompt: "What country uses the slang 'Mola mucho' and what does it mean?" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialMessage) {
      // If parent triggers a message (e.g. explaining a question)
      const newMsg: TutorMessage = {
        id: `explanation-${Date.now()}`,
        sender: "bot",
        text: initialMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMsg]);
    }
  }, [initialMessage]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: TutorMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/spanish/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error("Tutor chat failed");
      }

      const data = await response.json();
      const botMsg: TutorMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: TutorMessage = {
        id: `error-${Date.now()}`,
        sender: "system",
        text: "¡Lo siento! I had some trouble connecting to my linguistic brain. Make sure your Gemini API key is active. In the meantime, feel free to try again!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="tutor-chat-widget" className="bg-white rounded-3xl border-4 border-[#2D2424] p-6 shadow-[8px_8px_0px_0px_#2D2424] text-[#2D2424] flex flex-col h-[520px]">
      <div className="flex items-center gap-2.5 pb-4 border-b-2 border-[#2D2424]">
        <div className="w-10 h-10 rounded-xl bg-[#F1FAEE] text-[#2D2424] border-2 border-[#2D2424] flex items-center justify-center font-bold relative shadow-[2px_2px_0px_0px_#2D2424]">
          <Bot className="w-5 h-5" />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#2A9D8F] rounded-full border-2 border-[#2D2424]" />
        </div>
        <div>
          <h3 className="font-black text-slate-900 flex items-center gap-1 uppercase tracking-tight">
            Entrenador Santi
            <Sparkles className="w-4 h-4 text-[#E63946] fill-[#E63946]" />
          </h3>
          <p className="text-[10px] text-[#2D2424]/60 font-black uppercase tracking-wider">AI Spanish Tutor & Coach</p>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-grow overflow-y-auto my-4 space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed shadow-[3px_3px_0px_0px_#2D2424] border-2 border-[#2D2424] font-bold
                ${msg.sender === "user"
                  ? "bg-[#457B9D] text-white rounded-tr-none"
                  : msg.sender === "system"
                  ? "bg-[#E63946] text-white rounded-tl-none"
                  : "bg-[#F1FAEE] text-[#2D2424] rounded-tl-none"
                }`}
            >
              {msg.text}
            </div>
            <span className="text-[9px] text-[#2D2424]/60 font-black uppercase tracking-wider mt-1.5 px-1">
              {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-[#2D2424]/60 text-xs py-2 px-1 font-bold">
            <Loader2 className="w-4 h-4 animate-spin text-[#2A9D8F]" />
            <span>Santi está escribiendo...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length === 1 && (
        <div className="mb-4">
          <p className="text-[10px] font-black text-[#2D2424]/60 uppercase tracking-widest mb-2 flex items-center gap-1">
            <HelpCircle className="w-4 h-4" /> Temas recomendados
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((sug, idx) => (
              <button
                id={`btn-sug-${idx}`}
                key={idx}
                onClick={() => handleSend(sug.prompt)}
                className="text-xs bg-[#E9C46A] hover:bg-amber-400 text-[#2D2424] px-3 py-1.5 rounded-xl border-2 border-[#2D2424] font-black uppercase tracking-tight shadow-[2px_2px_0px_0px_#2D2424] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#2D2424] transition-all"
              >
                {sug.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Send Message Input */}
      <form
        id="tutor-chat-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputValue);
        }}
        className="flex gap-2"
      >
        <input
          id="tutor-chat-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Pregúntale a Santi..."
          disabled={isLoading}
          className="flex-grow bg-[#F1FAEE] text-[#2D2424] rounded-xl px-4 py-3 text-sm border-2 border-[#2D2424] focus:outline-none focus:bg-white font-bold"
        />
        <button
          id="btn-tutor-chat-submit"
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="bg-[#E63946] hover:bg-[#d0323e] text-white border-2 border-[#2D2424] rounded-xl p-3 flex items-center justify-center shadow-[3px_3px_0px_0px_#2D2424] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#2D2424] transition-all disabled:opacity-45"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
