import React, { useState } from "react";
import { TextInputForm } from "./TextInputForm";
import { GenerationLoader } from "./GenerationLoader";
import { ErrorDisplay } from "./ErrorDisplay";
import { FlashcardList } from "./FlashcardList";
import { ActionBar } from "./ActionBar";
import { useFlashcardGeneration } from "../lib/hooks/useFlashcardGeneration";
import { useFlashcardReview } from "../lib/hooks/useFlashcardReview";

export function GenerationView() {
  // State for the text input form and flashcard generation
  const {
    inputText,
    setInputText,
    isGenerating,
    error: generationError,
    sessionData,
    generateFlashcards,
    resetGeneration,
  } = useFlashcardGeneration();

  // State for flashcard review (approve/reject/edit)
  const {
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
  } = useFlashcardReview(sessionData);

  // Combined error state
  const [dismissedError, setDismissedError] = useState(false);
  const activeError = dismissedError ? null : generationError || saveError;

  // Handle generation form submission
  const handleGenerateFlashcards = async () => {
    setDismissedError(false);
    await generateFlashcards();
  };

  // Handle error dismissal
  const handleDismissError = () => {
    setDismissedError(true);
  };

  // Handle save of edited flashcard
  const handleSaveEdit = (id: string, data: { front: string; back: string }) => {
    saveEditedFlashcard(id, data);
  };

  return (
    <div className="space-y-8">
      {/* Text input form (only visible when no flashcards have been generated) */}
      {!sessionData && (
        <TextInputForm
          onSubmit={handleGenerateFlashcards}
          isLoading={isGenerating}
          error={generationError}
          inputText={inputText}
          setInputText={setInputText}
        />
      )}

      {/* Loading indicator */}
      <GenerationLoader isVisible={isGenerating} />

      {/* Error display */}
      <ErrorDisplay
        error={activeError}
        onDismiss={handleDismissError}
        onRetry={generationError ? handleGenerateFlashcards : undefined}
      />

      {/* Flashcard list (only visible after generation) */}
      {sessionData && !isGenerating && (
        <>
          <FlashcardList
            flashcards={flashcards}
            onApprove={approveFlashcard}
            onReject={rejectFlashcard}
            onEdit={editFlashcard}
            editingCardId={editingCardId}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={cancelEdit}
          />

          {/* Back to input button */}
          <div className="flex justify-start mb-20">
            <button
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline"
              onClick={resetGeneration}
            >
              ← Back to text input
            </button>
          </div>

          {/* Action bar with save button */}
          <ActionBar approvedCount={approvedCount} onSave={saveApprovedFlashcards} isLoading={isSaving} />
        </>
      )}
    </div>
  );
}
