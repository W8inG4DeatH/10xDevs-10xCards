import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";

interface Flashcard {
  id: number;
  front: string;
  back: string;
  source: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function MyFlashcardsView() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/flashcards?status=approved");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch flashcards");
      }

      const data = await response.json();
      setFlashcards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleCard = (cardId: number) => {
    const newFlippedCards = new Set(flippedCards);
    if (newFlippedCards.has(cardId)) {
      newFlippedCards.delete(cardId);
    } else {
      newFlippedCards.add(cardId);
    }
    setFlippedCards(newFlippedCards);
  };

  useEffect(() => {
    fetchFlashcards();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg">Loading your flashcards...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="mb-6">
        <AlertDescription>Error loading flashcards: {error}</AlertDescription>
      </Alert>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">No flashcards yet</h2>
        <p className="text-gray-600 mb-6">Generate some flashcards and approve them to see them here.</p>
        <Button onClick={() => (window.location.href = "/generate")} className="bg-blue-600 hover:bg-blue-700">
          Generate Flashcards
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          You have {flashcards.length} approved flashcard{flashcards.length !== 1 ? "s" : ""}
        </p>
        <Button onClick={() => (window.location.href = "/generate")} variant="outline">
          Generate More
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {flashcards.map((card) => {
          const isFlipped = flippedCards.has(card.id);
          return (
            <Card
              key={card.id}
              className="cursor-pointer transition-all hover:shadow-lg min-h-[200px]"
              onClick={() => toggleCard(card.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      card.source === "AI" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                    }`}
                  >
                    {card.source}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCard(card.id);
                    }}
                  >
                    {isFlipped ? "Show Question" : "Show Answer"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center text-center">
                <div className="space-y-2">
                  {!isFlipped ? (
                    <>
                      <CardTitle className="text-sm text-gray-500 uppercase tracking-wide">Question</CardTitle>
                      <p className="text-lg">{card.front}</p>
                    </>
                  ) : (
                    <>
                      <CardTitle className="text-sm text-gray-500 uppercase tracking-wide">Answer</CardTitle>
                      <p className="text-lg">{card.back}</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center pt-6">
        <Button onClick={fetchFlashcards} variant="outline" disabled={loading}>
          Refresh
        </Button>
      </div>
    </div>
  );
}
