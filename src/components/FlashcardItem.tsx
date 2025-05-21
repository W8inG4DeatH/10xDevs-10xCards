import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { FlashcardEditor } from "./FlashcardEditor";
import { Check, X, Edit, RefreshCw } from "lucide-react";
import type { FlashcardWithDecision } from "../types";

interface FlashcardItemProps {
  flashcard: FlashcardWithDecision;
  onApprove: () => void;
  onReject: () => void;
  onEdit: () => void;
  isEditing: boolean;
  onSaveEdit: (data: { front: string; back: string }) => void;
  onCancelEdit: () => void;
}

export function FlashcardItem({
  flashcard,
  onApprove,
  onReject,
  onEdit,
  isEditing,
  onSaveEdit,
  onCancelEdit,
}: FlashcardItemProps) {
  const [flipped, setFlipped] = useState(false);

  // Handle card flip
  const handleFlip = () => {
    setFlipped(!flipped);
  };

  // Status-based styling
  const getCardStyles = () => {
    if (flashcard.status === "approved") {
      return "border-green-500 dark:border-green-700";
    } else if (flashcard.status === "rejected") {
      return "border-gray-300 dark:border-gray-700 opacity-60";
    }
    return "";
  };

  // Keyboard handler for card content
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleFlip();
    }
  };

  // Render card content based on edit mode
  if (isEditing) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-gray-100 dark:bg-gray-800 py-2 px-4">
          <h3 className="text-sm font-medium">Editing Flashcard</h3>
        </CardHeader>
        <CardContent className="p-0">
          <FlashcardEditor flashcard={flashcard} onSave={onSaveEdit} onCancel={onCancelEdit} />
        </CardContent>
      </Card>
    );
  }

  // Render normal card (not in edit mode)
  return (
    <Card className={`overflow-hidden transition-all duration-300 ${getCardStyles()}`}>
      <CardContent className="p-0">
        <div
          className="min-h-[150px] p-4 cursor-pointer flex items-center justify-center"
          onClick={handleFlip}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          aria-label={`Flashcard: ${flipped ? "showing back" : "showing front"}`}
        >
          <div className="text-center">
            {flipped ? (
              <div>
                <div className="text-xs text-gray-500 mb-2">BACK</div>
                <p>{flashcard.back}</p>
              </div>
            ) : (
              <div>
                <div className="text-xs text-gray-500 mb-2">FRONT</div>
                <p>{flashcard.front}</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-2 text-center bg-gray-50 dark:bg-gray-800">
          <Button variant="ghost" size="sm" onClick={handleFlip}>
            <RefreshCw className="h-4 w-4 mr-1" />
            <span>Flip Card</span>
          </Button>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between p-2 bg-gray-100 dark:bg-gray-800">
        {flashcard.status === "draft" ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={onReject}
            >
              <X className="h-4 w-4 mr-1" />
              <span>Reject</span>
            </Button>

            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-1" />
              <span>Edit</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-green-950"
              onClick={onApprove}
            >
              <Check className="h-4 w-4 mr-1" />
              <span>Approve</span>
            </Button>
          </>
        ) : (
          <div className="w-full text-center">
            {flashcard.status === "approved" ? (
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                <Check className="h-4 w-4 inline mr-1" />
                Approved
              </span>
            ) : (
              <span className="text-gray-500 text-sm font-medium">
                <X className="h-4 w-4 inline mr-1" />
                Rejected
              </span>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
