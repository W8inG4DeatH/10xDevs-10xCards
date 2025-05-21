import React, { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import type { GeneratedFlashcard } from "../types";

interface FlashcardEditorProps {
  flashcard: GeneratedFlashcard;
  onSave: (data: { front: string; back: string }) => void;
  onCancel: () => void;
}

export function FlashcardEditor({ flashcard, onSave, onCancel }: FlashcardEditorProps) {
  const [front, setFront] = useState(flashcard.front);
  const [back, setBack] = useState(flashcard.back);
  const [frontError, setFrontError] = useState<string | null>(null);
  const [backError, setBackError] = useState<string | null>(null);

  const validateFields = (): boolean => {
    let isValid = true;

    if (!front.trim()) {
      setFrontError("Front side cannot be empty");
      isValid = false;
    } else {
      setFrontError(null);
    }

    if (!back.trim()) {
      setBackError("Back side cannot be empty");
      isValid = false;
    } else {
      setBackError(null);
    }

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateFields()) {
      onSave({ front, back });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <div className="space-y-2">
        <Label htmlFor="card-front">Front Side</Label>
        <Textarea
          id="card-front"
          value={front}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFront(e.target.value)}
          className={frontError ? "border-red-500 focus-visible:ring-red-500" : ""}
          placeholder="Enter the front side of the flashcard"
        />
        {frontError && <p className="text-sm text-red-500">{frontError}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="card-back">Back Side</Label>
        <Textarea
          id="card-back"
          value={back}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBack(e.target.value)}
          className={backError ? "border-red-500 focus-visible:ring-red-500" : ""}
          placeholder="Enter the back side of the flashcard"
        />
        {backError && <p className="text-sm text-red-500">{backError}</p>}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!front.trim() || !back.trim()}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
