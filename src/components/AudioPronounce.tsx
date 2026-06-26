import React, { useState } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";

interface AudioPronounceProps {
  text: string;
  size?: "sm" | "md" | "lg";
  autoPlay?: boolean;
}

export default function AudioPronounce({ text, size = "md", autoPlay = false }: AudioPronounceProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const speakNativeFallback = (phrase: string) => {
    try {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = "es-ES"; // Castilian Spanish
      
      // Try to find a Spanish voice
      const voices = window.speechSynthesis.getVoices();
      const esVoice = voices.find(v => v.lang.startsWith("es"));
      if (esVoice) utterance.voice = esVoice;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech synthesis failed", e);
      setIsPlaying(false);
    }
  };

  const handlePronounce = async () => {
    if (isPlaying || isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/spanish/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("TTS endpoint returned error status");
      }

      const data = await response.json();
      if (!data.audio) {
        throw new Error("No audio payload returned from server");
      }

      // Play the raw 16-bit PCM little-endian audio at 24000Hz
      const binaryString = window.atob(data.audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 24000 });
      const buffer = audioCtx.createBuffer(1, float32Array.length, 24000);
      buffer.copyToChannel(float32Array, 0);

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      
      source.onended = () => {
        setIsPlaying(false);
        audioCtx.close();
      };

      setIsPlaying(true);
      setIsLoading(false);
      source.start(0);
    } catch (error) {
      console.warn("Express TTS API not active or failed. Using browser SpeechSynthesis fallback:", error);
      setIsLoading(false);
      speakNativeFallback(text);
    }
  };

  // Autoplay if requested
  React.useEffect(() => {
    if (autoPlay && text) {
      const timer = setTimeout(() => {
        handlePronounce();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [text, autoPlay]);

  const sizeClasses = {
    sm: "p-2 text-xs rounded-xl",
    md: "p-3 text-sm rounded-2xl",
    lg: "p-4 text-base rounded-2xl"
  };

  return (
    <button
      id={`btn-pronounce-${text.replace(/\s+/g, "-").toLowerCase()}`}
      onClick={handlePronounce}
      disabled={isLoading}
      className={`${sizeClasses[size]} flex items-center gap-2 font-black transition-all duration-200 border-2 border-[#2D2424] focus:outline-none shadow-[2.5px_2.5px_0px_0px_#2D2424] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#2D2424]
        ${isPlaying 
          ? "bg-[#2A9D8F] text-white" 
          : "bg-white text-[#2D2424] hover:bg-yellow-50"
        } disabled:opacity-80 disabled:cursor-wait`}
      title="Pronounce phrase"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-[#E63946]" />
      ) : isPlaying ? (
        <Volume2 className="w-4 h-4 text-white" />
      ) : (
        <Volume2 className="w-4 h-4 text-[#2D2424]" />
      )}
      <span className="sr-only">Pronunciar</span>
    </button>
  );
}
