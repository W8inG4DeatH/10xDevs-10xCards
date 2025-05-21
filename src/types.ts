// src/types.ts

import type { Database } from "./db/database.types";

/**
 * Possible values for flashcard source as defined in the API plan.
 */
export type FlashcardSource = "AI" | "MANUAL";

/**
 * Possible values for flashcard status as defined in the API plan.
 */
export type FlashcardStatus = "draft" | "approved" | "rejected";

// ------------------------------
// User DTOs and Command Models
// ------------------------------

/**
 * Data Transfer Object for a user.
 * Excludes sensitive fields like password.
 */
export interface UserDTO {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

/**
 * Command model for updating user profile information.
 * All fields are optional.
 */
export interface UpdateUserCommand {
  email?: string;
  password?: string;
}

// ------------------------------
// Flashcard DTOs and Command Models
// ------------------------------

/**
 * Data Transfer Object for a flashcard.
 * Direct mapping from the database model.
 */
export type FlashcardDTO = Database["public"]["Tables"]["flashcards"]["Row"];

/**
 * Command model for creating a new flashcard.
 * Auto-generated fields (id, created_at, updated_at) are omitted.
 */
export type CreateFlashcardCommand = Omit<
  Database["public"]["Tables"]["flashcards"]["Insert"],
  "id" | "created_at" | "updated_at"
>;

/**
 * Command model for updating an existing flashcard.
 * Partial update is allowed.
 */
export type UpdateFlashcardCommand = Partial<Database["public"]["Tables"]["flashcards"]["Update"]>;

/**
 * Command model for batch creation of flashcards.
 * Useful for AI-generated flashcards (full and edited).
 */
export interface BatchCreateFlashcardsCommand {
  flashcards: CreateFlashcardCommand[];
}

// ------------------------------
// Generation Session DTOs and Command Models
// ------------------------------

/**
 * Data Transfer Object for a generation session.
 * Direct mapping from the database model.
 */
export type GenerationSessionDTO = Database["public"]["Tables"]["generation_sessions"]["Row"];

/**
 * Command model for creating a new generation session.
 * Auto-generated fields (id, created_at, updated_at) are omitted.
 */
export type CreateGenerationSessionCommand = Omit<
  Database["public"]["Tables"]["generation_sessions"]["Insert"],
  "id" | "created_at" | "updated_at"
>;

/**
 * Command model for updating an existing generation session.
 * Partial update is allowed.
 */
export type UpdateGenerationSessionCommand = Partial<Database["public"]["Tables"]["generation_sessions"]["Update"]>;

// ----------------------------------------------
// API additional types for endpoint payloads
// ----------------------------------------------

/**
 * API Input type for creating a new flashcard via the endpoint.
 * This type omits the user_id field, which is set from the authenticated context.
 */
export type NewFlashcardInput = Omit<CreateFlashcardCommand, "user_id">;

/**
 * Simplified flashcard structure returned by the AI generation endpoint.
 */
export interface GeneratedFlashcard {
  front: string;
  back: string;
}

/**
 * API Response type for the POST /flashcards/generate endpoint.
 * Returns the generation session ID, a list of generated flashcards (with front and back fields), and the creation timestamp.
 */
export interface FlashcardGenerationResponse {
  session_id: number;
  generated_flashcards: GeneratedFlashcard[];
  created_at: string;
}

/**
 * API Input type for creating a new generation session via flashcard generation.
 * Only the session_input is provided by the client; the user_id is added automatically server-side.
 */
export type NewGenerationSessionInput = Pick<CreateGenerationSessionCommand, "session_input">;

// ----------------------------------------------
// Frontend types for flashcard generation view
// ----------------------------------------------

/**
 * Rozszerzony model fiszki dla UI z decyzjami użytkownika
 */
export interface FlashcardWithDecision extends GeneratedFlashcard {
  id: string; // Tymczasowe ID dla zarządzania w UI
  status: FlashcardStatus; // Status decyzji: "draft", "approved" lub "rejected"
  isEditing?: boolean; // Flaga wskazująca czy fiszka jest w trybie edycji
}

/**
 * Model dla zapisania zatwierdzonych fiszek
 */
export interface FlashcardSubmissionViewModel {
  session_id: number;
  flashcards: {
    front: string;
    back: string;
    source: FlashcardSource; // Zawsze "AI" w tym przypadku
  }[];
}

/**
 * Stan generowania fiszek
 */
export interface GenerationSessionViewModel {
  isGenerating: boolean;
  error: string | null;
  sessionId: number | null;
  inputText: string;
  generatedAt: string | null;
}
