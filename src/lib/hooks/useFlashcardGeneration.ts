import { useState } from "react";
import type { FlashcardGenerationResponse } from "../../types";

export function useFlashcardGeneration() {
  const [inputText, setInputText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<FlashcardGenerationResponse | null>(null);

  const generateFlashcards = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_input: inputText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "An error occurred while generating flashcards");
      }

      const data = await response.json();
      setSessionData(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const resetGeneration = () => {
    setInputText("");
    setSessionData(null);
    setError(null);
  };

  return {
    inputText,
    setInputText,
    isGenerating,
    error,
    sessionData,
    generateFlashcards,
    resetGeneration,
  };
}
