import type { APIRoute } from "astro";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

// GET handler - fetch flashcards for study session
export const GET: APIRoute = async ({ locals, url }) => {
  try {
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const limitValue = Math.min(Math.max(limit, 1), 50); // Between 1 and 50

    // Fetch approved flashcards for study
    const { data: flashcards, error } = await locals.supabase
      .from("flashcards")
      .select("id, front, back, source, created_at")
      .eq("user_id", DEFAULT_USER_ID)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(limitValue);

    if (error) {
      throw new Error(`Failed to fetch flashcards for study: ${error.message}`);
    }

    // Shuffle the flashcards for random study order
    const shuffledFlashcards = flashcards ? shuffleArray([...flashcards]) : [];

    return new Response(JSON.stringify(shuffledFlashcards), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching flashcards for study:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};

// Helper function to shuffle array (Fisher-Yates algorithm)
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Disable prerendering for this API route
export const prerender = false;
