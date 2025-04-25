import { z } from "zod";
import type { APIRoute } from "astro";
import { GenerationService } from "../../../lib/generation.service";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";
import type { NewGenerationSessionInput } from "../../../types";

// Schema for input validation
const GenerationRequestSchema = z.object({
  session_input: z.string().min(10, "Input text must be at least 10 characters long"),
});

// Define the POST handler
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request data
    const validationResult = GenerationRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation error",
          details: validationResult.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Extract validated data
    const validatedData = validationResult.data as NewGenerationSessionInput;

    // Initialize the generation service with supabase client
    const generationService = new GenerationService(locals.supabase);

    // Process the generation request
    // Note: Using DEFAULT_USER_ID instead of auth as mentioned in instructions
    const result = await generationService.generateFlashcards(validatedData.session_input, DEFAULT_USER_ID);

    // Return successful response
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error processing generation request:", error);

    // Return error response
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
