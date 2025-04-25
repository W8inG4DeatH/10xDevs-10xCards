/* API Endpoint Implementation Plan: POST /flashcards/generate */

# API Endpoint Implementation Plan: POST /flashcards/generate

## 1. Przegląd punktu końcowego
This endpoint is designed to generate flashcard suggestions using AI. It accepts a large block of text as input, creates a new generation session in the database, and returns a list of generated flashcards along with session details. The endpoint ensures that only authenticated users can access this functionality and leverages Supabase for database interactions.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **Struktura URL:** `/flashcards/generate`
- **Parametry URL:** None
- **Nagłówki:**
  - `Authorization: Bearer <JWT Token>` (wymagany)
- **Request Body:**
  - **Wymagane:**
    - `session_input` (string) – zawiera tekst wejściowy, na podstawie którego mają być wygenerowane fiszki.
  - **Opcjonalne:** None

## 3. Wykorzystywane typy
- **DTOs i Command Modele:**
  - `CreateGenerationSessionCommand` (używany do tworzenia nowej sesji generowania)
  - `GenerationSessionDTO` (używany do mapowania danych sesji generowania z bazy)
  - Możliwe odwołanie do modelu `FlashcardDTO` dla wynikowych fiszek, jeśli jest wymagane szersze mapowanie.

## 4. Szczegóły odpowiedzi
- **Status Code:**
  - `201 Created` – dla pomyślnego utworzenia sesji generowania i zwrócenia wyników AI.
  - `400 Bad Request` – w przypadku nieprawidłowych danych wejściowych lub problemów z walidacją.
  - `401 Unauthorized` – gdy użytkownik nie jest uwierzytelniony.
  - `500 Internal Server Error` – dla błędów po stronie serwera.
- **Response Body (przykładowa struktura):**
  ```json
  {
    "session_id": 1,
    "generated_flashcards": [
      { "front": "Generated Question 1", "back": "Generated Answer 1" },
      { "front": "Generated Question 2", "back": "Generated Answer 2" }
    ],
    "created_at": "ISO8601 timestamp"
  }
  ```

## 5. Przepływ danych
1. Klient wysyła żądanie POST do `/flashcards/generate` z `session_input` w treści oraz tokenem JWT w nagłówku.
2. Warstwa middleware w Astro weryfikuje token JWT i ustawia aktualnego użytkownika w kontekście (przy użyciu Supabase i RLS).
3. Endpoint waliduje dane wejściowe używając np. Zod, aby upewnić się, że `session_input` jest dostarczony oraz spełnia przyjęte wymagania.
4. Logika biznesowa (usługa) przejmuje:
   - Wywołanie zewnętrznego API AI (Openrouter.ai) na podstawie `session_input`.
   - Przetwarzanie odpowiedzi z usługi AI oraz mapowanie wyników na strukturę fiszek.
5. Nowa sesja generowania zostaje zapisana w bazie danych przy użyciu polecenia `CreateGenerationSessionCommand`.
6. Endpoint zwraca odpowiedź w formacie JSON z identyfikatorem sesji, listą wygenerowanych fiszek oraz znacznikiem czasu utworzenia.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie i autoryzacja:**
  - Endpoint wymaga tokena JWT. Dostęp jest chroniony za pomocą mechanizmu Supabase Auth i RLS, który gwarantuje, że użytkownicy mogą modyfikować tylko własne dane.
- **Walidacja danych:**
  - Dane wejściowe są walidowane pod kątem obecności i formatu `session_input`, aby zabezpieczyć aplikację przed potencjalnymi atakami, takimi jak injection.
- **Bezpieczna komunikacja:**
  - Upewnienie się, że połączenia do zewnętrznych usług, takich jak API AI, są szyfrowane oraz, że dane wrażliwe są bezpiecznie przechowywane i przesyłane.

## 7. Obsługa błędów
- **Błędy Walidacji:**
  - Jeśli `session_input` jest pusty lub nie spełnia wymagań, zwracany będzie błąd `400 Bad Request` z odpowiednim komunikatem.
- **Błędy uwierzytelniania:**
  - Brak lub nieprawidłowy token JWT skutkuje odpowiedzią `401 Unauthorized`.
- **Błędy zewnętrzne:**
  - Problemy z połączeniem lub nieprawidłową odpowiedzią z usługi AI skutkują błędem `500 Internal Server Error` oraz logowaniem szczegółów błędu.
- **Logowanie:**
  - Wszelkie błędy serwera oraz krytyczne informacje diagnostyczne powinny być logowane zgodnie z przyjętymi zasadami wewnętrznymi.

## 8. Rozważania dotyczące wydajności
- **Optymalizacja zapytań do bazy:**
  - Używanie indeksów na polach takich jak `user_id` oraz `created_at` gwarantuje szybką selekcję danych przy tworzeniu sesji.
- **Przetwarzanie odpowiedzi AI:**
  - W przypadku dłuższego czasu odpowiedzi z usługi AI, rozważyć mechanizm asynchroniczny lub obsługę kolejkowania zadań.
- **Caching:**
  - Rozważyć cache dla podobnych zapytań lub wyników, aby zminimalizować obciążenie zewnętrznego API, jeśli to możliwe.

## 9. Etapy wdrożenia
1. **Definicja Specyfikacji:**
   - Przejrzeć szczegółowo dokumentację API (`api-plan.md`) oraz zasoby bazy danych (`db-plan.md`).
2. **Utworzenie nowej trasy:**
   - Utworzyć plik w katalogu `./src/pages/api/flashcards/generate.ts`.
3. **Walidacja Danych:**
   - Zaimplementować walidację danych wejściowych z użyciem Zod.
4. **Uwierzytelnianie:**
   - Upewnić się, że middleware poprawnie weryfikuje token JWT oraz ustawia kontekst użytkownika.
5. **Implementacja Logiki Biznesowej:**
   - Wyodrębnić logikę generowania fiszek do dedykowanej usługi (np. `src/lib/services/flashcardGenerationService.ts`).
   - Zaimplementować wywołanie zewnętrznego API (Openrouter.ai) oraz przetwarzanie odpowiedzi.
6. **Operacje na Bazie Danych:**
   - Utworzyć nową sesję generowania w bazie danych przy pomocy Supabase oraz odpowiednich modeli.
7. **Obsługa Błędów i Logowanie:**
   - Zaimplementować mechanizm wychwytywania błędów oraz odpowiednie logowanie.
8. **Testy End-to-End:**
   - Napisać testy integracyjne, aby zweryfikować poprawne działanie endpointu, w tym przypadki brzegowe i błędne dane wejściowe.
9. **Dokumentacja:**
   - Zaktualizować dokumentację API, aby zawierała szczegółowy opis nowego endpointu i przykłady użycia.
10. **Przegląd Kodu i Wdrożenie:**
    - Przeprowadzić code review, wdrożyć na środowisku testowym i ostatecznie na produkcji.

/* End of API Endpoint Implementation Plan */ 