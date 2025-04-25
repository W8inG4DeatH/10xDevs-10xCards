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
   * Mock AI service for generating flashcards
   * @param input The text input to generate flashcards from
   * @returns Array of generated flashcards
   */
  private async callAIService(input: string): Promise<GeneratedFlashcard[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      // Mock flashcard generation based on input
      // In a real implementation, this would call an external AI API
      const wordCount = input.split(/\s+/).length;
      const flashcardCount = Math.min(Math.max(3, Math.floor(wordCount / 50)), 10);

      const mockFlashcards: GeneratedFlashcard[] = [];

      // Generate mock flashcards based on input length
      for (let i = 1; i <= flashcardCount; i++) {
        mockFlashcards.push({
          front: `Generated Question ${i} based on: ${input.substring(0, 20)}...`,
          back: `Generated Answer ${i}: This is a simulated response for the question.`,
        });
      }

      return mockFlashcards;
    } catch (error) {
      console.error("Error calling AI service:", error);
      throw new Error("Failed to generate flashcards from AI service");
    }
  }
}
