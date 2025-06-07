import { useEffect, useState } from "react";
import type { FlashcardGenerationResponse, FlashcardStatus, FlashcardWithDecision } from "../../types";

export function useFlashcardReview(sessionData: FlashcardGenerationResponse | null) {
  const [flashcards, setFlashcards] = useState<FlashcardWithDecision[]>([]);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Initialize flashcards from session data
  useEffect(() => {
    if (sessionData && sessionData.generated_flashcards) {
      const mappedCards = sessionData.generated_flashcards.map((card, index) => ({
        ...card,
        id: `card-${index}`,
        status: "draft" as FlashcardStatus,
      }));
      setFlashcards(mappedCards);
    }
  }, [sessionData]);

  // Flashcard status management methods
  const approveFlashcard = (id: string) => {
    setFlashcards((cards) =>
      cards.map((card) => (card.id === id ? { ...card, status: "approved" as FlashcardStatus } : card))
    );
  };

  const rejectFlashcard = (id: string) => {
    setFlashcards((cards) =>
      cards.map((card) => (card.id === id ? { ...card, status: "rejected" as FlashcardStatus } : card))
    );
  };

  const editFlashcard = (id: string) => {
    setEditingCardId(id);
  };

  const saveEditedFlashcard = (id: string, data: { front: string; back: string }) => {
    setFlashcards((cards) =>
      cards.map((card) => (card.id === id ? { ...card, ...data, status: "approved" as FlashcardStatus } : card))
    );
    setEditingCardId(null);
  };

  const cancelEdit = () => {
    setEditingCardId(null);
  };

  // Save approved flashcards to database
  const saveApprovedFlashcards = async () => {
    if (!sessionData) return;

    const approvedCards = flashcards.filter((card) => card.status === "approved");
    if (approvedCards.length === 0) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch("/api/flashcards/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flashcards: approvedCards.map((card) => ({
            front: card.front,
            back: card.back,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save flashcards");
      }

      // Success - could redirect to My Flashcards page
      const result = await response.json();
      // Successfully saved flashcards - could be logged to analytics instead
      if (result.count > 0) {
        // Flashcards were saved successfully
      }

      // Optionally redirect to My Flashcards
      // window.location.href = "/my-flashcards";
    } catch (err) {
      if (err instanceof Error) {
        setSaveError(err.message);
      } else {
        setSaveError("An unknown error occurred");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const approvedCount = flashcards.filter((card) => card.status === "approved").length;

  return {
    flashcards,
    editingCardId,
    approvedCount,
    isSaving,
    saveError,
    approveFlashcard,
    rejectFlashcard,
    editFlashcard,
    saveEditedFlashcard,
    cancelEdit,
    saveApprovedFlashcards,
  };
}
