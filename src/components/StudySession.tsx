import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
// import { Progress } from "./ui/progress";
import { RefreshCw, CheckCircle, XCircle, RotateCcw } from "lucide-react";

interface StudyFlashcard {
  id: number;
  front: string;
  back: string;
  source: string;
  created_at: string;
}

export default function StudySession() {
  const [flashcards, setFlashcards] = useState<StudyFlashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [studiedCards, setStudiedCards] = useState(0);

  // Fetch flashcards for study
  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/flashcards/study?limit=20");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch flashcards for study");
      }

      const data = await response.json();

      if (data.length === 0) {
        throw new Error("No flashcards available for study. Please generate and approve some flashcards first.");
      }

      setFlashcards(data);
      setCurrentIndex(0);
      setIsFlipped(false);
      setSessionComplete(false);
      setStudiedCards(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (loading || sessionComplete) return;

      switch (event.key) {
        case " ":
        case "Enter":
          event.preventDefault();
          if (!isFlipped) {
            setIsFlipped(true);
          }
          break;
        case "1":
          if (isFlipped) handleDifficulty();
          break;
        case "2":
          if (isFlipped) handleDifficulty();
          break;
        case "3":
          if (isFlipped) handleDifficulty();
          break;
        case "4":
          if (isFlipped) handleDifficulty();
          break;
      }
    },
    [isFlipped, loading, sessionComplete]
  );

  useEffect(() => {
    fetchFlashcards();
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  const getCurrentCard = () => flashcards[currentIndex];

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
    }
  };

  const handleDifficulty = () => {
    if (!isFlipped) return;

    const nextIndex = currentIndex + 1;
    setStudiedCards((prev) => prev + 1);

    if (nextIndex >= flashcards.length) {
      setSessionComplete(true);
    } else {
      setCurrentIndex(nextIndex);
      setIsFlipped(false);
    }
  };

  const restartSession = () => {
    fetchFlashcards();
  };

  const progress = flashcards.length > 0 ? (currentIndex / flashcards.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg">Loading study session...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        {error.includes("No flashcards available") && (
          <div className="text-center">
            <Button onClick={() => (window.location.href = "/generate")} className="bg-blue-600 hover:bg-blue-700">
              Generate Flashcards
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold">Session Complete!</h2>
          <p className="text-gray-600">
            You studied {studiedCards} flashcard{studiedCards !== 1 ? "s" : ""} in this session.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={restartSession} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Study Again
          </Button>
          <Button onClick={() => (window.location.href = "/my-flashcards")}>View All Flashcards</Button>
        </div>
      </div>
    );
  }

  const currentCard = getCurrentCard();

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>
            {currentIndex + 1} of {flashcards.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Flashcard */}
      <Card className="max-w-2xl mx-auto min-h-[400px]">
        <CardHeader className="text-center">
          <div className="flex justify-between items-center">
            <span
              className={`text-xs px-2 py-1 rounded ${
                currentCard.source === "AI" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
              }`}
            >
              {currentCard.source}
            </span>
            <span className="text-sm text-gray-500">
              Card {currentIndex + 1}/{flashcards.length}
            </span>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex items-center justify-center text-center p-8">
          <div className="space-y-4 w-full">
            {!isFlipped ? (
              <>
                <CardTitle className="text-sm text-gray-500 uppercase tracking-wide">Question</CardTitle>
                <p className="text-xl leading-relaxed">{currentCard.front}</p>
                <Button onClick={handleFlip} className="mt-6" size="lg">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Show Answer
                </Button>
              </>
            ) : (
              <>
                <CardTitle className="text-sm text-gray-500 uppercase tracking-wide">Answer</CardTitle>
                <p className="text-xl leading-relaxed mb-8">{currentCard.back}</p>

                <div className="space-y-4">
                  <p className="text-sm text-gray-600">How well did you know this?</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleDifficulty()}
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Again (1)
                    </Button>
                    <Button
                      onClick={() => handleDifficulty()}
                      variant="outline"
                      className="border-orange-200 text-orange-700 hover:bg-orange-50"
                    >
                      Hard (2)
                    </Button>
                    <Button
                      onClick={() => handleDifficulty()}
                      variant="outline"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      Good (3)
                    </Button>
                    <Button
                      onClick={() => handleDifficulty()}
                      variant="outline"
                      className="border-green-200 text-green-700 hover:bg-green-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Easy (4)
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Keyboard shortcuts info */}
      <div className="text-center text-sm text-gray-500 space-y-1">
        <p>⌨️ Keyboard shortcuts:</p>
        <p>
          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Space</kbd> or{" "}
          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd> to flip card
        </p>
        {isFlipped && (
          <p>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">1</kbd> Again,
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">2</kbd> Hard,
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">3</kbd> Good,
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">4</kbd> Easy
          </p>
        )}
      </div>
    </div>
  );
}
