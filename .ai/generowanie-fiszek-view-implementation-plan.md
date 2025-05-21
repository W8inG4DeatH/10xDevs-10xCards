# Plan implementacji widoku Generowanie fiszek

## 1. Przegląd
Widok Generowania fiszek umożliwia zalogowanemu użytkownikowi wprowadzenie długiego tekstu, który następnie zostanie wysłany do API generującego propozycje fiszek. Użytkownik może przeglądać, zatwierdzać, edytować lub odrzucać wygenerowane fiszki. Głównym celem widoku jest przyspieszenie procesu tworzenia materiałów edukacyjnych poprzez wsparcie AI.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/generate`.

## 3. Struktura komponentów
- **FlashcardsGenerationPage**: Główny kontener widoku, integrujący logikę formularza wprowadzania tekstu, wywołanie API oraz prezentację wyników.
- **TextAreaInput**: Komponent pola tekstowego, w którym użytkownik wprowadza tekst (z obsługą walidacji długości 1000-10000 znaków).
- **Button**: Przycisk wyzwalający akcję generowania fiszek.
- **Loader**: Komponent wyświetlający stan ładowania (np. skeleton loader) podczas komunikacji z API.
- **FlashcardsList**: Lista wyświetlająca wygenerowane fiszki.
- **FlashcardItem**: Komponent reprezentujący pojedynczą fiszkę, umożliwiający akcje akceptacji, edycji i odrzucenia.

## 4. Szczegóły komponentów
### FlashcardsGenerationPage
- **Opis**: Główny komponent widoku odpowiedzialny za gromadzenie stanu, walidację tekstu, integrację z API oraz wyświetlanie listy fiszek.
- **Główne elementy**:
  - Formularz z komponentem `TextAreaInput`.
  - Przycisk `Generate` wywołujący akcję wysyłania tekstu do API.
  - Komponent `Loader` wyświetlany podczas wywołania API.
  - Komponent `FlashcardsList` prezentujący wynik generacji.
- **Obsługiwane interakcje**:
  - Wprowadzenie tekstu i jego walidacja (1000-10000 znaków).
  - Kliknięcie przycisku generowania.
  - Aktualizacja stanu widoku w zależności od odpowiedzi API.
- **Walidacja**:
  - Sprawdzenie długości tekstu przed wywołaniem API.
  - Obsługa błędów zwracanych przez API.
- **Typy**:
  - `FlashcardGenerationResponse` (z polami: session_id, generated_flashcards, created_at).
  - `GeneratedFlashcard` (z polami: front, back).

### TextAreaInput
- **Opis**: Komponent pola tekstowego z informacją o liczbie wprowadzonych znaków.
- **Główne elementy**:
  - Pole tekstowe z obsługą zdarzenia `onChange`.
  - Wyświetlanie aktualnej liczby znaków oraz komunikaty o błędzie w razie niewłaściwej długości.
- **Obsługiwane interakcje**:
  - Zmiana zawartości pola (onChange).
- **Walidacja**:
  - Minimalna długość: 1000 znaków
  - Maksymalna długość: 10000 znaków
- **Typy**: String dla tekstu wejściowego.
- **Props**:
  - `value`: string
  - `onChange`: funkcja aktualizująca stan tekstu
  - `errorMessage` (opcjonalnie): string

### FlashcardsList
- **Opis**: Komponent listy, który renderuje kolekcję fiszek przy użyciu komponentu `FlashcardItem`.
- **Główne elementy**:
  - Pętla mapująca dane (array `GeneratedFlashcard` lub rozszerzony model z dodatkowym statusem) na komponenty `FlashcardItem`.
- **Obsługiwane interakcje**:
  - Kliknięcia przycisków akcji w poszczególnych fiszkach (akceptacja, edycja, odrzucenie).
- **Typy**:
  - Tablica obiektów typu `FlashcardViewModel` (rozszerzenie `GeneratedFlashcard` o pole statusu np. 'pending', 'accepted', 'rejected').
- **Props**:
  - `flashcards`: lista fiszek
  - `onAction`: callback do obsługi zmian statusu fiszki

### FlashcardItem
- **Opis**: Komponent pojedynczej fiszki, prezentujący przód i tył oraz umożliwiający zmianę stanu fiszki przez użytkownika.
- **Główne elementy**:
  - Wyświetlanie zawartości `front` i `back` fiszki.
  - Przycisk do zatwierdzenia (Accept).
  - Przycisk do edycji, który przełącza tryb edycji umożliwiając modyfikację treści.
  - Przycisk do odrzucenia (Reject).
- **Obsługiwane interakcje**:
  - Zmiana stanu fiszki na 'accepted' po kliknięciu przycisku.
  - Edycja treści fizycznej fiszki i zapis zmian.
  - Odrzucenie fiszki z widoku.
- **Walidacja**:
  - Opcjonalna walidacja dla edytowanych treści
- **Typy**:
  - `GeneratedFlashcard` lub `FlashcardViewModel` z dodatkowym polem statusu
- **Props**:
  - `flashcard`: obiekt fiszki
  - `onAccept`, `onEdit`, `onReject`: funkcje obsługujące akcje

## 5. Typy
- **GeneratedFlashcard**: `{ front: string; back: string; }`
- **FlashcardGenerationResponse**: `{ session_id: number; generated_flashcards: GeneratedFlashcard[]; created_at: string; }`
- **FlashcardViewModel** (rozszerzenie GeneratedFlashcard): `{ front: string; back: string; status: 'pending' | 'accepted' | 'rejected'; }`

## 6. Zarządzanie stanem
- Użycie hooków React (`useState`, `useEffect`) do zarządzania stanem:
  - Stan dla tekstu wejściowego
  - Stan dla listy wygenerowanych fiszek (tablica `FlashcardViewModel`)
  - Stan ładowania (boolean)
  - Stan błędów (string lub obiekt błędu)
- Opcjonalnie, stworzenie customowego hooka `useFlashcardsGenerator` do enkapsulacji logiki wywołania API i aktualizacji stanu.

## 7. Integracja API
- **Endpoint**: POST `/generation-sessions`
- **Żądanie**: Wysyłka obiektu `{ session_input: string }` z walidowanym tekstem (1000-10000 znaków).
- **Odpowiedź**: Obiekt `FlashcardGenerationResponse` zawierający `session_id`, tablicę `generated_flashcards` oraz `created_at`.
- **Obsługa błędów**:
  - Połączenie powinno obsługiwać odpowiedzi błędów (np. 400, 401, 500) i aktualizować stan interfejsu odpowiednim komunikatem.

## 8. Interakcje użytkownika
- Wprowadzenie tekstu do pola `TextAreaInput`.
- Kliknięcie przycisku `Generate`:
  - Walidacja długości tekstu
  - Wyświetlenie komponentu `Loader` podczas komunikacji z API
  - Po otrzymaniu odpowiedzi, wyświetlenie listy fiszek w `FlashcardsList`
- Akcje w `FlashcardItem`:
  - Akceptacja: oznaczenie fiszki jako zaakceptowanej
  - Edycja: umożliwienie modyfikacji treści fiszki z aktualizacją stanu
  - Odrzucenie: usunięcie lub oznaczenie fiszki jako odrzuconej

## 9. Warunki i walidacja
- Walidacja pola tekstowego:
  - Minimalna długość: 1000 znaków
  - Maksymalna długość: 10000 znaków
- Przed wysłaniem żądania API, weryfikacja poprawności danych wejściowych.
- Walidacja odpowiedzi API, weryfikacja obecności `session_id` oraz struktury `generated_flashcards`.

## 10. Obsługa błędów
- Wyświetlanie komunikatów o błędach, gdy:
  - Tekst nie spełnia kryteriów długości
  - Wystąpił błąd w komunikacji z API (np. błąd serwera, brak odpowiedzi, błędna autoryzacja)
- Mechanizm ponownego wywołania akcji generowania w przypadku błędu.

## 11. Kroki implementacji
1. Utworzyć nową stronę Astro pod ścieżką `/generate` (np. `./src/pages/generate.astro`).
2. Stworzyć główny komponent Reactowy `FlashcardsGenerationPage` w folderze `./src/components`.
3. Zaimplementować komponent `TextAreaInput` z walidacją długości tekstu.
4. Dodać przycisk `Generate`, który wywołuje funkcję wysyłającą żądanie do endpointa POST `/generation-sessions`.
5. Podczas wysyłania żądania, pokazać komponent `Loader`.
6. Po otrzymaniu odpowiedzi, przekształcić dane na tablicę obiektów typu `FlashcardViewModel` i przekazać do komponentu `FlashcardsList`.
7. Utworzyć komponent `FlashcardItem` umożliwiający akcje akceptacji, edycji oraz odrzucenia fiszki.
8. Zaimplementować obsługę stanów i błędów przy użyciu hooków React (`useState`, `useEffect` lub custom hook `useFlashcardsGenerator`).
9. Przeprowadzić testy integracji z API, walidację danych wejściowych oraz interakcje użytkownika.
10. Zapewnić responsywność i dostępność widoku (np. wsparcie dla czytników ekranu, czytelne komunikaty błędów). 
