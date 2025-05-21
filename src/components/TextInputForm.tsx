import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

interface TextInputFormProps {
  onSubmit: (text: string) => Promise<void>;
  isLoading: boolean;
  inputText: string;
  setInputText: (text: string) => void;
}

export function TextInputForm({ onSubmit, isLoading, inputText, setInputText }: TextInputFormProps) {
  const [localValidationError, setLocalValidationError] = useState<string | null>(null);
  const minLength = 1000;
  const maxLength = 10000;
  const charCount = inputText.length;

  // Validate text length in real-time
  useEffect(() => {
    if (charCount < minLength && charCount > 0) {
      setLocalValidationError(`Text is too short. Minimum ${minLength} characters required.`);
    } else if (charCount > maxLength) {
      setLocalValidationError(`Text is too long. Maximum ${maxLength} characters allowed.`);
    } else {
      setLocalValidationError(null);
    }
  }, [charCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (charCount < minLength || charCount > maxLength) {
      return; // Don't submit if validation fails
    }

    await onSubmit(inputText);
  };

  // Determine if the submit button should be disabled
  const isSubmitDisabled = isLoading || charCount < minLength || charCount > maxLength;

  // Determine the character count color
  const getCounterColor = () => {
    if (charCount < minLength || charCount > maxLength) {
      return "text-red-500 dark:text-red-400";
    }
    return "text-gray-500 dark:text-gray-400";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="input-text">Enter your text</Label>
        <Textarea
          id="input-text"
          value={inputText}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputText(e.target.value)}
          disabled={isLoading}
          className={`min-h-[200px] ${localValidationError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
          placeholder="Paste your text here (minimum 1000 characters)..."
        />
        <div className="flex justify-between">
          <div>
            {localValidationError && <p className="text-sm text-red-500 dark:text-red-400">{localValidationError}</p>}
          </div>
          <p className={`text-sm ${getCounterColor()}`}>
            {charCount}/{maxLength} characters
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitDisabled} className="min-w-[150px]">
          {isLoading ? "Generating..." : "Generate Flashcards"}
        </Button>
      </div>
    </form>
  );
}
