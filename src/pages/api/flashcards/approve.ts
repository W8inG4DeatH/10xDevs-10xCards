import type { APIRoute } from "astro";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

// POST handler - approve generated flashcards
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { flashcards } = body;

    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Validation error",
          message: "Flashcards array is required and cannot be empty",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate flashcard structure
    for (const card of flashcards) {
      if (!card.front || !card.back) {
        return new Response(
          JSON.stringify({
            error: "Validation error",
            message: "Each flashcard must have both front and back content",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Insert approved flashcards into database
    const flashcardsToInsert = flashcards.map((card) => ({
      user_id: DEFAULT_USER_ID,
      front: card.front,
      back: card.back,
      source: "AI",
      status: "approved",
    }));

    const { data: insertedFlashcards, error } = await locals.supabase
      .from("flashcards")
      .insert(flashcardsToInsert)
      .select();

    if (error) {
      throw new Error(`Failed to approve flashcards: ${error.message}`);
    }

    return new Response(
      JSON.stringify({
        message: "Flashcards approved successfully",
        count: insertedFlashcards?.length || 0,
        flashcards: insertedFlashcards,
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error approving flashcards:", error);

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

// Disable prerendering for this API route
export const prerender = false;
