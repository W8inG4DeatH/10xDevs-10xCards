import React from "react";
import { Button } from "./ui/button";
import { Save } from "lucide-react";

interface ActionBarProps {
  approvedCount: number;
  onSave: () => Promise<void>;
  isLoading: boolean;
}

export function ActionBar({ approvedCount, onSave, isLoading }: ActionBarProps) {
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-900 p-4 border-t shadow-md flex justify-between items-center">
      <div className="text-sm">
        <span className="font-medium">{approvedCount}</span> flashcard{approvedCount !== 1 ? "s" : ""} approved
      </div>

      <Button onClick={onSave} disabled={isLoading || approvedCount === 0} className="min-w-[200px]">
        {isLoading ? (
          <>
            <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin mr-2"></div>
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Approved Flashcards
          </>
        )}
      </Button>
    </div>
  );
}
