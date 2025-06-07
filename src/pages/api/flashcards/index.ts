import type { APIRoute } from "astro";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

// GET handler - fetch user's flashcards
export const GET: APIRoute = async ({ locals, url }) => {
  try {
    const status = url.searchParams.get("status") || "approved";

    // Fetch flashcards from database
    const { data: flashcards, error } = await locals.supabase
      .from("flashcards")
      .select("id, front, back, source, status, created_at, updated_at")
      .eq("user_id", DEFAULT_USER_ID)
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch flashcards: ${error.message}`);
    }

    return new Response(JSON.stringify(flashcards || []), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching flashcards:", error);

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

// POST handler - create new flashcard
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { front, back, source = "MANUAL", status = "approved" } = body;

    if (!front || !back) {
      return new Response(
        JSON.stringify({
          error: "Validation error",
          message: "Both front and back are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Insert flashcard into database
    const { data: flashcard, error } = await locals.supabase
      .from("flashcards")
      .insert({
        user_id: DEFAULT_USER_ID,
        front,
        back,
        source,
        status,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create flashcard: ${error.message}`);
    }

    return new Response(JSON.stringify(flashcard), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error creating flashcard:", error);

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
