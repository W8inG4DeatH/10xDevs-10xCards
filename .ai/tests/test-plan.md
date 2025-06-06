# Kompleksowy Plan Testów dla Projektu "10xDevs-10xCards"

**Wersja dokumentu:** 2.0
**Data utworzenia:** 2024-07-26
**Data ostatniej aktualizacji:** 2024-12-19
**Autor:** [Doświadczony Inżynier QA]

---

### 1. Wprowadzenie i cele testowania

Niniejszy dokument określa strategię, zakres, zasoby i harmonogram działań testowych dla aplikacji **10xDevs-10xCards**. Projekt, oparty na nowoczesnym stosie technologicznym (Astro, React, Supabase, OpenRouter.ai), ma na celu usprawnienie procesu tworzenia fiszek edukacyjnych z wykorzystaniem sztucznej inteligencji.

**Główne cele testowania:**

- **Weryfikacja funkcjonalna:** Zapewnienie, że wszystkie funkcje aplikacji działają zgodnie z dokumentacją wymagań produktu (PRD) i historyjkami użytkowników (User Stories).
- **Zapewnienie jakości:** Identyfikacja, udokumentowanie i śledzenie defektów w celu podniesienia ogólnej jakości i stabilności produktu.
- **Weryfikacja bezpieczeństwa:** Sprawdzenie, czy dane użytkowników są bezpieczne, a system autoryzacji i dostępu do danych działa poprawnie, ze szczególnym uwzględnieniem polityk RLS w Supabase.
- **Ocena użyteczności i wydajności:** Upewnienie się, że aplikacja jest intuicyjna, responsywna i działa wydajnie pod oczekiwanym obciążeniem.
- **Weryfikacja integracji:** Potwierdzenie poprawnej komunikacji z usługami zewnętrznymi, takimi jak Supabase i OpenRouter.ai.

### 2. Zakres testów

#### 2.1. Funkcjonalności w zakresie testów

- **Moduł uwierzytelniania i autoryzacji:**
  - Rejestracja użytkownika (z weryfikacją email).
  - Logowanie i wylogowywanie.
  - Mechanizm resetowania hasła.
  - Ochrona tras i API dla niezalogowanych użytkowników.
  - Prawidłowe działanie polityk bezpieczeństwa na poziomie wiersza (RLS).
- **Rdzeń aplikacji - Generowanie fiszek AI:**
  - Formularz wprowadzania tekstu (walidacja długości 1000-10000 znaków).
  - Proces generowania (komunikacja z API, obsługa stanu ładowania).
  - Wyświetlanie i interakcja z listą wygenerowanych fiszek.
  - Funkcjonalność akceptacji, odrzucenia i edycji propozycji.
  - Zapisywanie zatwierdzonych fiszek w bazie danych.
- **Zarządzanie fiszkami (CRUD):**
  - Ręczne tworzenie, odczyt, aktualizacja i usuwanie fiszek przez zalogowanego użytkownika.
- **Interfejs użytkownika (UI/UX):**
  - Responsywność na różnych urządzeniach (desktop, tablet, mobile).
  - Zgodność z projektem UI i spójność wizualna komponentów Shadcn/ui.
  - Dostępność (WCAG).

#### 2.2. Funkcjonalności poza zakresem testów

- Zaawansowane algorytmy Spaced Repetition (testowana będzie jedynie podstawowa integracja).
- Testy obciążeniowe na dużą skalę (przekraczające oczekiwany ruch dla MVP).
- Aplikacje mobilne (testy ograniczają się do widoku przeglądarki mobilnej).
- Funkcje wymienione jako "Out of Scope" w pliku `README.md`.
- Szczegółowa ocena jakości merytorycznej treści generowanych przez modele LLM (skupiamy się na poprawności technicznej integracji).

### 3. Typy testów do przeprowadzenia

1.  **Testy jednostkowe (Unit Tests):**

    - **Cel:** Weryfikacja poprawności działania izolowanych fragmentów kodu.
    - **Zakres:** Funkcje pomocnicze (`src/lib/utils.ts`), logika hooków React (`useFlashcardGeneration.ts`, `useFlashcardReview.ts`), usługi (`GenerationService.ts`, `OpenRouterService.ts` z użyciem MSW), walidacja Zod w endpointach API.
    - **Narzędzia:** Vitest, MSW do mockowania API, Faker.js do generowania danych testowych.

2.  **Testy integracyjne (Integration Tests):**

    - **Cel:** Sprawdzenie współpracy pomiędzy różnymi modułami.
    - **Zakres:**
      - **Komponenty React:** Testowanie całych widoków (np. `GenerationView.tsx`) i ich interakcji z komponentami podrzędnymi.
      - **API:** Testowanie endpointów API (`/api/**`) w izolacji, weryfikując ich interakcje z klientem Supabase i poprawność zwracanych odpowiedzi.
    - **Narzędzia:** React Testing Library, @testing-library/user-event, Supertest dla API, MSW do mockowania zewnętrznych usług.

3.  **Testy End-to-End (E2E):**

    - **Cel:** Symulacja rzeczywistych przepływów użytkownika w aplikacji.
    - **Zakres:** Pełne ścieżki użytkownika, np.:
      - Rejestracja -> Logowanie -> Wygenerowanie fiszek -> Edycja -> Zapisanie -> Wylogowanie.
      - Próba dostępu do chronionej strony bez logowania.
      - Proces resetowania hasła.
    - **Narzędzia:** Playwright z testami na Chromium, Firefox i WebKit, @axe-core/playwright do testów dostępności.

4.  **Testy bezpieczeństwa (Security Tests):**

    - **Cel:** Identyfikacja i weryfikacja potencjalnych luk bezpieczeństwa.
    - **Zakres:**
      - **Testowanie polityk RLS:** Kluczowy priorytet. Weryfikacja, czy użytkownik A nie ma dostępu do danych użytkownika B.
      - **Kontrola dostępu:** Sprawdzenie, czy chronione API i strony są niedostępne dla niezalogowanych użytkowników.
      - **Sanityzacja danych:** Weryfikacja zabezpieczeń przed atakami typu XSS w polach, gdzie wyświetlany jest tekst od użytkownika.

5.  **Testy wydajności (Performance Tests):**

    - **Cel:** Ocena szybkości i responsywności aplikacji.
    - **Zakres:**
      - Czas odpowiedzi API (szczególnie `/api/flashcards/generate`).
      - Metryki front-endowe (LCP, FCP, TTI, CLS, FID) - Core Web Vitals.
      - Obciążenie bazy danych przy operacjach CRUD.
      - Analiza bundle size i optymalizacja ładowania.
    - **Narzędzia:** Lighthouse (zintegrowany z Playwright), Web Vitals API, Lighthouse CI, WebPageTest dla pogłębionej analizy.

6.  **Testy wizualne (Visual Regression Tests):**

    - **Cel:** Wykrywanie niezamierzonych zmian w wyglądzie interfejsu użytkownika.
    - **Zakres:**
      - Komponenty UI w różnych stanach (Storybook stories).
      - Kluczowe widoki aplikacji w różnych rozdzielczościach.
      - Responsywność komponentów Shadcn/ui.
    - **Narzędzia:** Storybook, Chromatic do automatycznego porównywania screenshotów.

7.  **Testy zgodności (Compatibility Tests):**
    - **Cel:** Zapewnienie poprawnego działania na różnych platformach.
    - **Zakres:** Testowanie na najnowszych wersjach przeglądarek: Chrome, Firefox, Safari, Edge oraz na różnych rozdzielczościach ekranu (mobilnych, tabletowych, desktopowych).
    - **Narzędzia:** Playwright z testami cross-browser, BrowserStack dla dodatkowej weryfikacji na urządzeniach mobilnych.

### 4. Scenariusze testowe dla kluczowych funkcjonalności

| ID Scenariusza | Funkcjonalność                 | Opis Scenariusza                                                                                | Oczekiwany Rezultat                                                                                                                | Priorytet     |
| :------------- | :----------------------------- | :---------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- | :------------ |
| **AUTH-001**   | Rejestracja                    | Użytkownik podaje poprawny email i hasło, a następnie przechodzi proces rejestracji.            | Konto zostaje utworzone, użytkownik otrzymuje email weryfikacyjny i może się zalogować.                                            | **Krytyczny** |
| **AUTH-002**   | Rejestracja - Negatywny        | Użytkownik próbuje się zarejestrować z niepoprawnym formatem emaila lub zbyt krótkim hasłem.    | Formularz wyświetla błędy walidacji, rejestracja jest niemożliwa.                                                                  | Wysoki        |
| **AUTH-003**   | Logowanie                      | Zarejestrowany użytkownik loguje się przy użyciu poprawnych danych.                             | Użytkownik zostaje pomyślnie zalogowany i przekierowany na stronę główną. Interfejs jest dostosowany dla zalogowanego użytkownika. | **Krytyczny** |
| **AUTH-004**   | Dostęp do chronionych tras     | Niezalogowany użytkownik próbuje uzyskać dostęp do strony `/my-flashcards`.                     | Użytkownik zostaje przekierowany na stronę logowania (`/auth/login`).                                                              | **Krytyczny** |
| **AUTH-005**   | Resetowanie hasła              | Użytkownik przechodzi pełną ścieżkę resetowania hasła (prośba, email, ustawienie nowego hasła). | Użytkownik może zalogować się przy użyciu nowego hasła.                                                                            | Wysoki        |
| **GEN-001**    | Generowanie fiszek             | Zalogowany użytkownik wkleja tekst (1000-10000 znaków) i klika "Generate Flashcards".           | Wyświetla się loader, a następnie lista wygenerowanych propozycji fiszek.                                                          | **Krytyczny** |
| **GEN-002**    | Generowanie fiszek - Walidacja | Użytkownik próbuje wygenerować fiszki z tekstu o nieprawidłowej długości.                       | Wyświetlany jest błąd walidacji, przycisk generowania jest nieaktywny.                                                             | Wysoki        |
| **GEN-003**    | Zarządzanie propozycjami       | Użytkownik akceptuje 2 fiszki, odrzuca 1 i edytuje 1, a następnie klika "Save".                 | Tylko zaakceptowane i edytowane fiszki (3) są zapisywane w bazie danych. `ActionBar` pokazuje poprawną liczbę zatwierdzonych kart. | **Krytyczny** |
| **GEN-004**    | Błąd API generowania           | Podczas generowania fiszek występuje błąd po stronie serwera/API OpenRouter.                    | Aplikacja wyświetla czytelny komunikat o błędzie, zachowując wprowadzony tekst.                                                    | Wysoki        |
| **SEC-001**    | Izolacja danych (RLS)          | Użytkownik A tworzy fiszki. Użytkownik B loguje się na swoje konto.                             | Użytkownik B nie widzi fiszek użytkownika A i nie może uzyskać do nich dostępu przez API.                                          | **Krytyczny** |

### 5. Środowisko testowe

- **Środowisko lokalne:**
  - **Przeznaczenie:** Testy jednostkowe i integracyjne.
  - **Konfiguracja:** Uruchomienie projektu zgodnie z `README.md`, lokalna instancja Supabase (zgodnie z `supabase/config.toml`), mockowane klucze API.
- **Środowisko Staging/Testowe:**
  - **Przeznaczenie:** Testy E2E, bezpieczeństwa, wydajności i akceptacyjne.
  - **Konfiguracja:** Oddzielna instancja aplikacji na serwerze (np. DigitalOcean), dedykowana baza danych Supabase, dedykowane klucze API do OpenRouter z nałożonymi limitami. Środowisko powinno być jak najwierniejszą kopią środowiska produkcyjnego.
- **Środowisko produkcyjne:**
  - **Przeznaczenie:** Testy typu "smoke" po wdrożeniu nowej wersji.
  - **Konfiguracja:** Środowisko produkcyjne dostępne dla końcowych użytkowników.

### 6. Narzędzia do testowania

#### 6.1. Framework testowy i biblioteki podstawowe

- **Framework do testów jednostkowych i integracyjnych:** Vitest
- **Środowisko DOM:** happy-dom (zintegrowane z Vitest)
- **Biblioteki do testowania komponentów:**
  - React Testing Library
  - @testing-library/jest-dom (dodatkowe matchery)
  - @testing-library/user-event (realistyczne symulacje interakcji)

#### 6.2. Testowanie API i mocki

- **Framework do testów API:** Supertest (dla testów integracyjnych API)
- **Mockowanie API:** MSW (Mock Service Worker) - dla izolowanych testów front-endu
- **Generowanie danych testowych:** Faker.js lub @mswjs/data

#### 6.3. Testy End-to-End

- **Framework do testów E2E:** Playwright
- **Środowiska przeglądarek:** Chromium, Firefox, WebKit (wszystkie wspierane przez Playwright)

#### 6.4. Testy wydajności i jakości

- **Metryki wydajności:**
  - Lighthouse (zintegrowane z Playwright)
  - Web Vitals API
  - Lighthouse CI (do automatyzacji w pipeline)
- **Analiza zewnętrzna:** WebPageTest (do szczegółowych analiz)

#### 6.5. Testy wizualne i komponentów

- **Testowanie komponentów w izolacji:** Storybook
- **Testy visual regression:** Chromatic (zintegrowane ze Storybook)
- **Testy dostępności:** @axe-core/playwright (zintegrowane z Playwright)

#### 6.6. Pokrycie kodu i raportowanie

- **Coverage:** c8 (wbudowane w Vitest)
- **Raportowanie coverage:** codecov (integracja z GitHub)

#### 6.7. Zarządzanie testami i CI/CD

- **System do zarządzania testami:** Linear (dla profesjonalnego zarządzania) lub GitHub Issues/Projects (dla prostszych projektów)
- **Automatyzacja (CI/CD):** GitHub Actions z następującymi krokami:
  - Testy jednostkowe i integracyjne (Vitest)
  - Testy E2E (Playwright)
  - Analiza wydajności (Lighthouse CI)
  - Raportowanie coverage (codecov)
  - Testy visual regression (Chromatic)

### 7. Harmonogram testów

Testowanie będzie procesem ciągłym, zintegrowanym z cyklem rozwoju oprogramowania (sprinty).

- **Faza 1: Testy w trakcie sprintu (ciągłe)**
  - Deweloperzy piszą testy jednostkowe dla nowych funkcji.
  - QA tworzy i automatyzuje testy integracyjne i E2E dla ukończonych historyjek.
- **Faza 2: Regresja przed wydaniem (2-3 dni przed końcem cyklu wydawniczego)**
  - Wykonanie pełnego zestawu zautomatyzowanych testów E2E.
  - Manualne testy eksploracyjne kluczowych ścieżek i nowych funkcji.
  - Testy bezpieczeństwa i zgodności.
- **Faza 3: Testy akceptacyjne (UAT)**
  - Prezentacja funkcji dla Product Ownera/klienta na środowisku Staging.
- **Faza 4: Testy "smoke" po wdrożeniu (ok. 1-2h po wdrożeniu na produkcję)**
  - Weryfikacja kluczowych funkcjonalności na środowisku produkcyjnym.

### 8. Kryteria akceptacji testów

#### 8.1. Kryteria wejścia (rozpoczęcia fazy testów regresyjnych)

- Wszystkie zaplanowane funkcje na dane wydanie są ukończone ("code complete").
- Build aplikacji jest stabilny i możliwy do wdrożenia na środowisku Staging.
- Wszystkie testy jednostkowe i integracyjne przechodzą pomyślnie w pipeline CI.

#### 8.2. Kryteria wyjścia (zakończenia testów i zgody na wdrożenie)

- 98% zaplanowanych przypadków testowych zakończonych sukcesem.
- Brak nierozwiązanych błędów o priorytecie **Krytycznym** lub **Blokującym**.
- Wszystkie zidentyfikowane luki bezpieczeństwa zostały naprawione.
- Dokumentacja testowa została zaktualizowana.

### 9. Role i odpowiedzialności

| Rola              | Odpowiedzialność                                                                                                                                                                                                                                 |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Deweloper**     | - Tworzenie i utrzymanie testów jednostkowych.<br>- Naprawa błędów zgłoszonych przez zespół QA.<br>- Uczestnictwo w analizie przyczyn źródłowych błędów.                                                                                         |
| **Inżynier QA**   | - Projektowanie i utrzymanie planu testów.<br>- Tworzenie, wykonywanie i automatyzacja testów integracyjnych, E2E i bezpieczeństwa.<br>- Zarządzanie procesem raportowania błędów.<br>- Komunikacja statusu jakości do zespołu i interesariuszy. |
| **Product Owner** | - Definiowanie kryteriów akceptacji dla historyjek użytkowników.<br>- Priorytetyzacja błędów.<br>- Uczestnictwo w testach akceptacyjnych (UAT).                                                                                                  |

### 10. Procedury raportowania błędów

Wszystkie zidentyfikowane błędy będą raportowane w systemie GitHub Issues zgodnie z poniższym szablonem:

- **Tytuł:** Krótki, zwięzły opis problemu, np. "[Logowanie] Błąd walidacji dla poprawnego adresu email".
- **Projekt/Moduł:** Obszar aplikacji, którego dotyczy błąd (np. `Authentication`, `Flashcard Generation`).
- **Kroki do odtworzenia:** Numerowana lista kroków potrzebnych do wywołania błędu.
- **Rezultat oczekiwany:** Co powinno się wydarzyć.
- **Rezultat aktualny:** Co faktycznie się wydarzyło.
- **Środowisko:** Gdzie błąd wystąpił (np. `Lokalne - Chrome 126`, `Staging - Firefox 127`).
- **Priorytet:** (Krytyczny, Wysoki, Średni, Niski) - jak pilna jest naprawa.
- **Waga/Severity:** (Blokujący, Poważny, Drobny, Trywialny) - jak duży jest wpływ błędu na działanie systemu.
- **Załączniki:** Zrzuty ekranu, nagrania wideo, logi z konsoli.
