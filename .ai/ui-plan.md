# Architektura UI dla 10xDevs-10xCards

## 1. Przegląd struktury UI

Ogólny zarys interfejsu uwzględnia rozdzielenie na widoki odpowiadające głównym funkcjonalnościom: uwierzytelnienie, generowanie fiszek, zarządzanie fiszkami, panel użytkownika i sesja nauki. Całość opiera się na technologii Astro, React, TypeScript oraz Tailwind CSS, przy użyciu komponentów z shadcn/ui. Struktura została przemyślana tak, aby zapewnić intuicyjną nawigację, dostępność, responsywność i bezpieczeństwo, zgodnie z wymaganiami PRD i API.

## 2. Lista widoków

### Widok Uwierzytelnienia (Authentication Page)
- Ścieżka widoku: `/login` oraz `/register`
- Główny cel: Umożliwienie użytkownikowi rejestracji i logowania poprzez Supabase Auth lub dedykowane formularze.
- Kluczowe informacje do wyświetlenia: Formularze z polami na e-mail i hasło, komunikaty o błędach walidacji, link do rejestracji lub odzyskiwania hasła.
- Kluczowe komponenty widoku: Komponent formularza uwierzytelnienia, pola tekstowe, przycisk submit, komponenty wyświetlające błędy/komunikaty.
- UX, dostępność i bezpieczeństwo: Zapewnienie przejrzystych komunikatów o błędach, poprawna walidacja pól, zgodność z WCAG AA, szyfrowanie danych wejściowych, ochrona przed atakami CSRF.

### Widok Generowania Fiszek (Flashcards Generation Page)
- Ścieżka widoku: `/generate`
- Główny cel: Użytkownik wprowadza tekst, który zostaje przetworzony przez API do generowania propozycji fiszek i możliwa jest ich rewizja (zaakceptuj, edytuj, odrzuć).
- Kluczowe informacje do wyświetlenia: Pole tekstowe dla wprowadzenia długiego tekstu, loader podczas komunikacji z API, lista wygenerowanych fiszek.
- Kluczowe komponenty widoku: Formularz tekstowy, przycisk generowania, lista fiszek z opcjami akceptacji, edycji lub odrzucania dla każdej fiszki, komponent loadera (skeleton), komunikaty o błędach.
- UX, dostępność i bezpieczeństwo: Intuicyjny interfejs umożliwiający łatwe wprowadzanie tekstu, walidacja 1000-10000 znaków, informowanie o postępie, responsywność i dostępność dla użytkowników korzystających z czytników ekranu.

### Widok Zarządzania Fiszkami (Flashcards List/Management Page)
- Ścieżka widoku: `/flashcards`
- Główny cel: Przegląd, edycja i usuwanie fiszek użytkownika pobranych z API.
- Kluczowe informacje do wyświetlenia: Lista fiszek, statusy (draft, approved, rejected), przyciski akcji (edycja, usunięcie), podgląd treści fiszki.
- Kluczowe komponenty widoku: Lista (np. karty fiszek), modal edycji fiszek, przyciski akcji, mechanizmy paginacji i filtrowania.
- UX, dostępność i bezpieczeństwo: Jasne oznaczenia statusów, potwierdzenie akcji usunięcia, dostępność m.in. dla osób korzystających z klawiatury, odpowiednia walidacja danych przed edycją.

### Panel Użytkownika (User Panel)
- Ścieżka widoku: `/profile`
- Główny cel: Zarządzanie danymi profilowymi oraz ustawieniami konta użytkownika.
- Kluczowe informacje do wyświetlenia: Adres e-mail, opcje zmiany hasła, ustawienia prywatności i opcje usunięcia konta wraz z danymi.
- Kluczowe komponenty widoku: Formularze edycji danych, przyciski potwierdzenia zmian, sekcja informacyjna o koncie.
- UX, dostępność i bezpieczeństwo: Bezpieczna edycja danych, potwierdzanie krytycznych operacji (np. usunięcie konta), zgodność z zasadami bezpieczeństwa i ochrony danych.

### Widok Sesji Nauki (Study Session Page)
- Ścieżka widoku: `/study`
- Główny cel: Umożliwienie użytkownikowi nauki metodą spaced repetition przy użyciu fiszek.
- Kluczowe informacje do wyświetlenia: Treść fiszek (przód i tył), przyciski oceny przyswojenia fiszki, wskaźnik postępu sesji.
- Kluczowe komponenty widoku: Komponent prezentacji fiszek, przyciski interakcji, wskaźnik postępu, mechanizm oceny.
- UX, dostępność i bezpieczeństwo: Intuicyjny interfejs do szybkiej interakcji, możliwość pracy klawiaturowej, czytelne przyciski, ochrona danych sesji.

## 3. Mapa podróży użytkownika

1. Użytkownik wchodzi na stronę i trafia do widoku uwierzytelnienia (/login lub /register).
2. Po uwierzytelnieniu, użytkownik jest przekierowywany na stronę główną, gdzie może wybrać opcję generowania fiszek.
3. Użytkownik przechodzi do widoku generowania fiszek (/generate), gdzie wprowadza długi tekst i wysyła go do API.
4. Po otrzymaniu wyników, użytkownik przegląda wygenerowane fiszki, może akceptować, edytować lub odrzucać poszczególne fiszki.
5. Następnie użytkownik przechodzi do widoku zarządzania fiszkami (/flashcards), gdzie zobaczy wszystkie zapisane fiszki i może dokonać dalszych edycji lub usunięć.
6. Użytkownik może również odwiedzić panel użytkownika (/profile) w celu aktualizacji danych osobowych lub zmiany ustawień.
7. W przypadku rozpoczęcia sesji nauki, użytkownik wybiera widok nauki (/study), gdzie przeprowadza interaktywną sesję spaced repetition.
8. W każdym z widoków dostępne są mechanizmy powiadomień (toasty, alerty) informujące o błędach i sukcesach operacji.

## 4. Układ i struktura nawigacji

- Główna nawigacja będzie umieszczona w górnej belce (topbar) przy użyciu komponentów z shadcn/ui.
- Elementy nawigacji będą zawierały odnośniki do:
  - Flashcards Generation (/generate)
  - Flashcards List/Management (/flashcards)
  - Study Session (/study)
  - User Panel (/profile)
- Uwierzytelnienie oraz opcje wylogowania zostaną dostępne w ramach nawigacji na widoku profilowym lub jako osobny przycisk po zalogowaniu.
- Nawigacja będzie responsywna, dostosowując się do mniejszych ekranów za pomocą Tailwind CSS.

## 5. Kluczowe komponenty

- Formularz uwierzytelnienia: Odpowiedzialny za przyjmowanie danych logowania i rejestracji.
- Flashcard Card: Reprezentuje pojedynczą fiszkę z akcjami akceptacji, edycji i usunięcia.
- Flashcard Edit Modal: Modal do edycji szczegółów fiszki z walidacją i potwierdzeniem zmian.
- Loader/Spinner: Informuje użytkownika o oczekiwaniu na odpowiedź API.
- Toast Notifications: Komponent do informowania użytkownika o sukcesach, błędach i innych ważnych zdarzeniach.
- Navigation Menu (Topbar): Element nawigacji umożliwiający łatwy dostęp do wszystkich głównych widoków.
- Pagination Component: Umożliwia przeglądanie listy fiszek ze wsparciem dla paginacji i filtrów. 
