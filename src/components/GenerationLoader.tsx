import React from "react";

interface GenerationLoaderProps {
  isVisible: boolean;
}

export function GenerationLoader({ isVisible }: GenerationLoaderProps) {
  if (!isVisible) return null;

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <div className="h-12 w-12 rounded-full border-4 border-t-transparent border-primary animate-spin"></div>
      <p className="text-sm text-gray-500 dark:text-gray-400">Generating flashcards... This may take a moment.</p>
    </div>
  );
}
