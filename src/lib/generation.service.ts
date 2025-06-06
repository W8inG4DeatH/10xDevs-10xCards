import { createHash } from "crypto";
import type { CreateGenerationSessionCommand, FlashcardGenerationResponse, GeneratedFlashcard } from "../types";
import type { SupabaseClient } from "../db/supabase.client";
import type { Database } from "../db/database.types";

type Json = Database["public"]["Tables"]["generation_sessions"]["Row"]["session_output"];

export class GenerationService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Generates flashcards based on provided text input
   * @param sessionInput The text input to generate flashcards from
   * @param userId The user ID to associate with the generation session
   * @returns The generated flashcards and session details
   */
  async generateFlashcards(sessionInput: string, userId: string): Promise<FlashcardGenerationResponse> {
    try {
      // Generate a hash for the session input to identify similar requests
      const inputHash = this.generateInputHash(sessionInput);

      // Prepare generation session data
      const sessionData: CreateGenerationSessionCommand = {
        user_id: userId,
        session_input: sessionInput,
        session_output: null, // Will be updated after AI generation
      };

      // Call AI service to generate flashcards
      const generatedFlashcards = await this.callAIService(sessionInput);

      // Update session data with generated output
      sessionData.session_output = {
        inputHash,
        flashcards: generatedFlashcards.map((card) => ({
          front: card.front,
          back: card.back,
        })),
      } as unknown as Json;

      // Save generation session to database
      const { data: session, error } = await this.supabase
        .from("generation_sessions")
        .insert(sessionData)
        .select("id, created_at")
        .single();

      if (error) {
        throw new Error(`Failed to save generation session: ${error.message}`);
      }

      // Return formatted response
      return {
        session_id: session.id,
        generated_flashcards: generatedFlashcards,
        created_at: session.created_at,
      };
    } catch (error) {
      console.error("Error generating flashcards:", error);
      throw error;
    }
  }

  /**
   * Generates a hash for the input text to identify similar requests
   * @param input The input text to hash
   * @returns MD5 hash of the input
   */
  private generateInputHash(input: string): string {
    return createHash("md5").update(input).digest("hex");
  }

  /**
   * AI service for generating flashcards using OpenRouter API
   * @param input The text input to generate flashcards from
   * @returns Array of generated flashcards
   */
  private async callAIService(input: string): Promise<GeneratedFlashcard[]> {
    try {
      const apiKey = import.meta.env.OPENROUTER_API_KEY;

      if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not configured");
      }

      const prompt = `Based on the following text, generate educational flashcards. Create questions and answers that help understand the key concepts.

Text: "${input}"

Generate 3-5 flashcards in the following JSON format:
[
  {
    "front": "Question about the concept",
    "back": "Clear and concise answer"
  }
]

Make sure the questions are specific and the answers are informative but concise. Focus on the most important concepts from the text.`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3002",
          "X-Title": "10x FlashCards Generator",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No content received from AI service");
      }

      // Try to extract JSON from the response
      let flashcards: GeneratedFlashcard[];
      try {
        // Look for JSON array in the response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          flashcards = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: try to parse the entire content as JSON
          flashcards = JSON.parse(content);
        }
      } catch {
        console.error("Failed to parse AI response as JSON:", content);
        // Fallback to a single flashcard with the raw content
        flashcards = [
          {
            front: "Generated question from input",
            back: content.trim(),
          },
        ];
      }

      // Validate and ensure we have valid flashcard objects
      const validFlashcards = flashcards
        .filter((card) => card && typeof card.front === "string" && typeof card.back === "string")
        .slice(0, 10); // Limit to max 10 cards

      if (validFlashcards.length === 0) {
        throw new Error("No valid flashcards generated from AI response");
      }

      return validFlashcards;
    } catch (error) {
      console.error("Error calling AI service:", error);
      throw new Error(
        `Failed to generate flashcards from AI service: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
