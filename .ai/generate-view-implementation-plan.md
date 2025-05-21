# Plan implementacji widoku Generowanie Fiszek

## 1. Przegląd

Widok Generowania Fiszek umożliwia użytkownikom wprowadzenie tekstu, który zostaje przetworzony przez API w celu automatycznego wygenerowania propozycji fiszek. Użytkownik może przeglądać wygenerowane propozycje i podejmować decyzje o ich zaakceptowaniu, edycji lub odrzuceniu, a następnie zapisać zaakceptowane fiszki do swojej kolekcji.

## 2. Routing widoku

Widok powinien być dostępny pod ścieżką: `/generate`

## 3. Struktura komponentów

```
GenerationPageLayout
├── TextInputForm
│   └── GenerationLoader (warunkowy)
├── ErrorDisplay (warunkowy)
├── FlashcardList (warunkowy)
│   ├── FlashcardItem 1
│   │   └── FlashcardEditor (warunkowy)
│   ├── FlashcardItem 2
│   │   └── FlashcardEditor (warunkowy)
│   └── ...
└── ActionBar (warunkowy)
```

## 4. Szczegóły komponentów

### GenerationPageLayout

- Opis komponentu: Główny komponent layoutu zawierający całą stronę generowania fiszek
- Główne elementy: Container opakowujący wszystkie komponenty podrzędne, nagłówek strony, responsywny układ
- Obsługiwane interakcje: Brak bezpośrednich interakcji na tym poziomie
- Obsługiwana walidacja: Brak walidacji na tym poziomie
- Typy: Brak specyficznych typów
- Propsy: Brak

### TextInputForm

- Opis komponentu: Formularz zawierający pole tekstowe do wprowadzenia treści oraz przycisk do generowania fiszek
- Główne elementy: Textarea z licznikiem znaków, przycisk "Generuj fiszki", informacje pomocnicze
- Obsługiwane interakcje:
  - Wprowadzanie tekstu (onChange)
  - Wysłanie formularza (onSubmit)
  - Resetowanie formularza (opcjonalnie)
- Obsługiwana walidacja:
  - Minimalna długość tekstu: 1000 znaków
  - Maksymalna długość tekstu: 10000 znaków
  - Walidacja w czasie rzeczywistym
- Typy:
  - `NewGenerationSessionInput`
- Propsy:
  - `onSubmit: (text: string) => Promise<void>`
  - `isLoading: boolean`
  - `error: string | null`

### GenerationLoader

- Opis komponentu: Wskaźnik ładowania wyświetlany podczas komunikacji z API
- Główne elementy: Animowany spinner, opcjonalnie informacja o szacowanym czasie oczekiwania
- Obsługiwane interakcje: Brak
- Obsługiwana walidacja: Brak
- Typy: Brak specyficznych typów
- Propsy:
  - `isVisible: boolean`

### FlashcardList

- Opis komponentu: Kontener wyświetlający listę wygenerowanych fiszek
- Główne elementy: Lista elementów FlashcardItem, nagłówek listy, opcjonalne komunikaty informacyjne
- Obsługiwane interakcje: Brak bezpośrednich interakcji na tym poziomie
- Obsługiwana walidacja: Brak
- Typy:
  - `FlashcardWithDecision[]`
- Propsy:
  - `flashcards: FlashcardWithDecision[]`
  - `onApprove: (id: string) => void`
  - `onReject: (id: string) => void`
  - `onEdit: (id: string) => void`
  - `editingCardId: string | null`

### FlashcardItem

- Opis komponentu: Pojedyncza fiszka z opcjami zatwierdzenia, edycji lub odrzucenia
- Główne elementy: Karta z przednią i tylną stroną fiszki, przyciski akcji (zatwierdź/edytuj/odrzuć), wizualne oznaczenie statusu
- Obsługiwane interakcje:
  - Zatwierdzenie fiszki (onClick)
  - Odrzucenie fiszki (onClick)
  - Edycja fiszki (onClick)
  - Przełączanie widoku przód/tył (onClick)
- Obsługiwana walidacja: Brak
- Typy:
  - `FlashcardWithDecision`
- Propsy:
  - `flashcard: FlashcardWithDecision`
  - `onApprove: () => void`
  - `onReject: () => void`
  - `onEdit: () => void`
  - `isEditing: boolean`

### FlashcardEditor

- Opis komponentu: Edytor do modyfikacji treści fiszki
- Główne elementy: Formularze do edycji przedniej i tylnej strony fiszki, przyciski zapisu i anulowania
- Obsługiwane interakcje:
  - Zmiana tekstu przedniej/tylnej strony (onChange)
  - Zapisanie zmian (onSubmit)
  - Anulowanie edycji (onClick)
- Obsługiwana walidacja:
  - Niepuste pola przedniej i tylnej strony
- Typy:
  - `GeneratedFlashcard`
- Propsy:
  - `flashcard: GeneratedFlashcard`
  - `onSave: (data: {front: string, back: string}) => void`
  - `onCancel: () => void`

### ActionBar

- Opis komponentu: Pasek akcji z przyciskiem zapisu zatwierdzonych fiszek
- Główne elementy: Przycisk "Zapisz zatwierdzone fiszki", licznik zatwierdzonych fiszek
- Obsługiwane interakcje:
  - Zapisanie zatwierdzonych fiszek (onClick)
- Obsługiwana walidacja:
  - Przynajmniej jedna fiszka musi być zatwierdzona aby przycisk był aktywny
- Typy: Brak specyficznych typów
- Propsy:
  - `approvedCount: number`
  - `onSave: () => Promise<void>`
  - `isLoading: boolean`

### ErrorDisplay

- Opis komponentu: Komponent do wyświetlania błędów API lub walidacji
- Główne elementy: Alert z komunikatem błędu, przycisk zamknięcia, opcjonalnie przycisk ponowienia próby
- Obsługiwane interakcje:
  - Zamknięcie komunikatu (onClick)
  - Ponowienie próby (onClick)
- Obsługiwana walidacja: Brak
- Typy: Brak specyficznych typów
- Propsy:
  - `error: string | null`
  - `onDismiss: () => void`
  - `onRetry: () => void (opcjonalnie)`

## 5. Typy

### Istniejące typy (z types.ts)

```typescript
// Z pliku types.ts
export type FlashcardSource = "AI" | "MANUAL";
export type FlashcardStatus = "draft" | "approved" | "rejected";
export interface GeneratedFlashcard {
  front: string;
  back: string;
}
export interface FlashcardGenerationResponse {
  session_id: number;
  generated_flashcards: GeneratedFlashcard[];
  created_at: string;
}
export type NewGenerationSessionInput = Pick<CreateGenerationSessionCommand, "session_input">;
export type NewFlashcardInput = Omit<CreateFlashcardCommand, "user_id">;
```

### Nowe typy (do zdefiniowania)

```typescript
// Rozszerzony model fiszki dla UI z decyzjami użytkownika
export interface FlashcardWithDecision extends GeneratedFlashcard {
  id: string; // Tymczasowe ID dla zarządzania w UI
  status: FlashcardStatus; // Status decyzji: "draft", "approved" lub "rejected"
  isEditing?: boolean; // Flaga wskazująca czy fiszka jest w trybie edycji
}

// Model dla zapisania zatwierdzonych fiszek
export interface FlashcardSubmissionViewModel {
  session_id: number;
  flashcards: Array<{
    front: string;
    back: string;
    source: FlashcardSource; // Zawsze "AI" w tym przypadku
  }>;
}

// Stan generowania fiszek
export interface GenerationSessionViewModel {
  isGenerating: boolean;
  error: string | null;
  sessionId: number | null;
  inputText: string;
  generatedAt: string | null;
}
```

## 6. Zarządzanie stanem

### useFlashcardGeneration (custom hook)

```typescript
function useFlashcardGeneration() {
  const [inputText, setInputText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<FlashcardGenerationResponse | null>(null);

  const generateFlashcards = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_input: inputText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Wystąpił błąd podczas generowania fiszek");
      }

      const data = await response.json();
      setSessionData(data);
    } catch (err) {
      setError(err.message || "Wystąpił nieznany błąd");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetGeneration = () => {
    setInputText("");
    setSessionData(null);
    setError(null);
  };

  return {
    inputText,
    setInputText,
    isGenerating,
    error,
    sessionData,
    generateFlashcards,
    resetGeneration,
  };
}
```

### useFlashcardReview (custom hook)

```typescript
function useFlashcardReview(sessionData: FlashcardGenerationResponse | null) {
  const [flashcards, setFlashcards] = useState<FlashcardWithDecision[]>([]);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Inicjalizacja fiszek z danych sesji
  useEffect(() => {
    if (sessionData && sessionData.generated_flashcards) {
      const mappedCards = sessionData.generated_flashcards.map((card, index) => ({
        ...card,
        id: `card-${index}`,
        status: "draft" as FlashcardStatus,
      }));
      setFlashcards(mappedCards);
    }
  }, [sessionData]);

  // Metody zarządzania statusem fiszek
  const approveFlashcard = (id: string) => {
    setFlashcards((cards) =>
      cards.map((card) => (card.id === id ? { ...card, status: "approved" as FlashcardStatus } : card))
    );
  };

  const rejectFlashcard = (id: string) => {
    setFlashcards((cards) =>
      cards.map((card) => (card.id === id ? { ...card, status: "rejected" as FlashcardStatus } : card))
    );
  };

  const editFlashcard = (id: string) => {
    setEditingCardId(id);
  };

  const saveEditedFlashcard = (id: string, data: { front: string; back: string }) => {
    setFlashcards((cards) =>
      cards.map((card) => (card.id === id ? { ...card, ...data, status: "approved" as FlashcardStatus } : card))
    );
    setEditingCardId(null);
  };

  const cancelEdit = () => {
    setEditingCardId(null);
  };

  // Zapisywanie zatwierdzonych fiszek do bazy danych
  const saveApprovedFlashcards = async () => {
    if (!sessionData) return;

    const approvedCards = flashcards.filter((card) => card.status === "approved");
    if (approvedCards.length === 0) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionData.session_id,
          flashcards: approvedCards.map((card) => ({
            front: card.front,
            back: card.back,
            source: "AI" as FlashcardSource,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Wystąpił błąd podczas zapisywania fiszek");
      }

      // Sukces - można dodać dodatkową obsługę, np. przekierowanie lub komunikat
    } catch (err) {
      setSaveError(err.message || "Wystąpił nieznany błąd");
    } finally {
      setIsSaving(false);
    }
  };

  const approvedCount = flashcards.filter((card) => card.status === "approved").length;

  return {
    flashcards,
    editingCardId,
    approvedCount,
    isSaving,
    saveError,
    approveFlashcard,
    rejectFlashcard,
    editFlashcard,
    saveEditedFlashcard,
    cancelEdit,
    saveApprovedFlashcards,
  };
}
```

## 7. Integracja API

### Generowanie fiszek

- Endpoint: `POST /api/flashcards/generate`
- Żądanie:
  ```typescript
  {
    session_input: string; // Tekst wprowadzony przez użytkownika
  }
  ```
- Odpowiedź:
  ```typescript
  {
    session_id: number; // ID sesji generowania
    generated_flashcards: {
      // Lista wygenerowanych fiszek
      front: string; // Przednia strona fiszki
      back: string; // Tylna strona fiszki
    }
    [];
    created_at: string; // Data utworzenia (ISO8601)
  }
  ```
- Obsługa błędów:
  - 400 Bad Request - Nieprawidłowe dane wejściowe (np. zbyt krótki tekst)
  - 500 Internal Server Error - Problemy z usługą generowania

### Zapisywanie zatwierdzonych fiszek

- Endpoint: `POST /api/flashcards`
- Żądanie:
  ```typescript
  {
    session_id: number; // ID sesji generowania
    flashcards: {
      // Lista zatwierdzonych fiszek
      front: string; // Przednia strona fiszki
      back: string; // Tylna strona fiszki
      source: "AI"; // Źródło fiszki (zawsze "AI" w tym przypadku)
    }
    [];
  }
  ```
- Odpowiedź:
  - Status 201 Created z informacją o sukcesie
- Obsługa błędów:
  - 400 Bad Request - Nieprawidłowe dane fiszek
  - 401 Unauthorized - Użytkownik nie jest zalogowany
  - 500 Internal Server Error - Problemy z zapisem do bazy danych

## 8. Interakcje użytkownika

### Wprowadzanie tekstu i generowanie fiszek

1. Użytkownik wprowadza tekst w pole tekstowe
2. Walidacja tekstu odbywa się na bieżąco (licznik znaków, komunikaty o długości)
3. Po kliknięciu przycisku "Generuj fiszki":
   - Jeśli walidacja się nie powiedzie, wyświetlane są odpowiednie komunikaty
   - Jeśli walidacja przejdzie, pojawia się loader i następuje wywołanie API
   - Po zakończeniu generowania, wyświetlana jest lista fiszek lub komunikat o błędzie

### Przeglądanie i decydowanie o fiszkach

1. Użytkownik widzi listę wygenerowanych fiszek
2. Dla każdej fiszki użytkownik może:
   - Zatwierdzić fiszkę (zmiana statusu na "approved")
   - Odrzucić fiszkę (zmiana statusu na "rejected")
   - Edytować fiszkę (otwiera edytor)
3. Podczas edycji użytkownik może:
   - Zmodyfikować przednią i tylną stronę fiszki
   - Zapisać zmiany (automatycznie zmienia status na "approved")
   - Anulować edycję (powrót do poprzedniego stanu)
4. Fiszki zmieniają swój wygląd w zależności od statusu:
   - Draft: neutralny wygląd
   - Approved: pozytywne oznaczenie (np. zielona obwódka)
   - Rejected: negatywne oznaczenie (np. szara obwódka, przezroczystość)

### Zapisywanie zatwierdzonych fiszek

1. Pasek akcji pokazuje liczbę zatwierdzonych fiszek
2. Przycisk "Zapisz zatwierdzone fiszki" jest aktywny tylko gdy istnieje co najmniej jedna zatwierdzona fiszka
3. Po kliknięciu przycisku:
   - Pojawia się loader
   - Następuje wywołanie API zapisującego zatwierdzone fiszki
   - Po sukcesie wyświetlane jest potwierdzenie i opcjonalnie przekierowanie
   - W przypadku błędu wyświetlany jest komunikat z możliwością ponowienia próby

## 9. Warunki i walidacja

### Walidacja pola tekstowego

- Warunek: Tekst musi mieć od 1000 do 10000 znaków
- Komponenty: `TextInputForm`
- Wpływ na UI:
  - Przycisk "Generuj fiszki" jest nieaktywny, gdy tekst nie spełnia warunków
  - Licznik znaków zmienia kolor na czerwony, gdy tekst jest za krótki lub za długi
  - Komunikat o błędzie pojawia się pod polem tekstowym

### Walidacja edycji fiszek

- Warunek: Pola przedniej i tylnej strony fiszki nie mogą być puste
- Komponenty: `FlashcardEditor`
- Wpływ na UI:
  - Przycisk "Zapisz" jest nieaktywny, gdy którekolwiek z pól jest puste
  - Pola z błędem są oznaczone wizualnie (np. czerwona obwódka)
  - Komunikaty o błędach pojawią się pod odpowiednimi polami

### Walidacja zapisu zatwierdzonych fiszek

- Warunek: Co najmniej jedna fiszka musi być zatwierdzona
- Komponenty: `ActionBar`
- Wpływ na UI:
  - Przycisk "Zapisz zatwierdzone fiszki" jest nieaktywny, gdy nie ma zatwierdzonych fiszek
  - Licznik zatwierdzonych fiszek pokazuje aktualną liczbę

## 10. Obsługa błędów

### Błędy walidacji formularza

- Szczegółowe komunikaty o błędach walidacji przy polu tekstowym
- Wizualne oznaczenie błędów (czerwone obwódki, ikony ostrzeżeń)
- Przyciski pozostają nieaktywne do momentu poprawienia błędów

### Błędy komunikacji z API podczas generowania

- Wyświetlenie komunikatu o błędzie w komponencie `ErrorDisplay`
- Opcja ponowienia próby bez konieczności ponownego wprowadzania tekstu
- Zachowanie wprowadzonego tekstu w przypadku błędu

### Błędy podczas zapisu fiszek

- Komunikat o błędzie w komponencie `ErrorDisplay` z opcją ponowienia próby
- Zachowanie stanu zatwierdzonych fiszek (nie są resetowane)
- Możliwość edycji fiszek mimo błędu zapisu

### Obsługa braku wyników generowania

- Komunikat sugerujący modyfikację tekstu wejściowego
- Opcja powrotu do edycji tekstu wejściowego
- Wskazówki jak poprawić tekst, aby uzyskać lepsze wyniki

## 11. Kroki implementacji

1. Utworzenie struktury plików i podstawowego routingu

   - Utworzenie pliku `src/pages/generate.astro`
   - Konfiguracja układu strony i importowanie wymaganych komponentów

2. Implementacja komponentów React

   - Utworzenie komponentu `TextInputForm.tsx` w `src/components`
   - Implementacja walidacji długości tekstu
   - Utworzenie komponentu `GenerationLoader.tsx`
   - Implementacja komponentów `FlashcardList.tsx` i `FlashcardItem.tsx`
   - Implementacja komponentu `FlashcardEditor.tsx`
   - Utworzenie komponentu `ActionBar.tsx`
   - Implementacja komponentu `ErrorDisplay.tsx`

3. Utworzenie custom hooks do zarządzania stanem

   - Implementacja `useFlashcardGeneration.ts` w `src/lib/hooks`
   - Implementacja `useFlashcardReview.ts` w `src/lib/hooks`

4. Integracja komponentów w widoku strony

   - Połączenie komponentów React w układzie strony
   - Implementacja przepływu danych i zdarzeń między komponentami

5. Integracja z API

   - Implementacja funkcji do komunikacji z API generowania fiszek
   - Implementacja funkcji do zapisywania zatwierdzonych fiszek

6. Implementacja obsługi błędów

   - Dodanie obsługi potencjalnych scenariuszy błędów
   - Implementacja komunikatów i mechanizmów odzyskiwania

7. Stylizacja komponentów z użyciem Tailwind i Shadcn/ui

   - Zastosowanie stylów zgodnych z wytycznymi projektu
   - Implementacja responsywnego układu dla różnych rozmiarów ekranu

8. Testowanie

   - Przeprowadzenie testów jednostkowych dla kluczowych komponentów
   - Sprawdzenie poprawności działania walidacji
   - Sprawdzenie scenariuszy błędów i odzyskiwania

9. Refaktoryzacja i optymalizacja

   - Przegląd i optymalizacja kodu
   - Usunięcie niepotrzebnych renderowań
   - Zastosowanie technik memoizacji dla komponentów listy

10. Dokumentacja
    - Uzupełnienie dokumentacji komponentów
    - Uzupełnienie komentarzy do kluczowych funkcji
