import React from "react";
import { FlashcardItem } from "./FlashcardItem";
import type { FlashcardWithDecision } from "../types";

interface FlashcardListProps {
  flashcards: FlashcardWithDecision[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (id: string) => void;
  editingCardId: string | null;
  onSaveEdit: (id: string, data: { front: string; back: string }) => void;
  onCancelEdit: () => void;
}

export function FlashcardList({
  flashcards,
  onApprove,
  onReject,
  onEdit,
  editingCardId,
  onSaveEdit,
  onCancelEdit,
}: FlashcardListProps) {
  if (flashcards.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No flashcards generated yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Generated Flashcards</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Review the generated flashcards below. You can approve, edit, or reject each one.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {flashcards.map((flashcard) => (
          <FlashcardItem
            key={flashcard.id}
            flashcard={flashcard}
            onApprove={() => onApprove(flashcard.id)}
            onReject={() => onReject(flashcard.id)}
            onEdit={() => onEdit(flashcard.id)}
            isEditing={editingCardId === flashcard.id}
            onSaveEdit={(data) => onSaveEdit(flashcard.id, data)}
            onCancelEdit={onCancelEdit}
          />
        ))}
      </div>
    </div>
  );
}
