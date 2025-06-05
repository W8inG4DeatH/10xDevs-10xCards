# Specyfikacja architektury systemu autentykacji - 10xDevs-10xCards

## 1. PRZEGLĄD ARCHITEKTURY

System autentykacji zostanie zbudowany w oparciu o Supabase Auth zintegrowaną z Astro 5. Architektura obejmuje następujące warstwy:

- **Warstwa prezentacji**: Strony Astro SSR + komponenty React dla interakcji
- **Warstwa middleware**: Astro middleware do weryfikacji sesji i ochrony tras
- **Warstwa API**: Endpointy Astro API do obsługi operacji autentykacji
- **Warstwa danych**: Supabase Auth + PostgreSQL z RLS (Row Level Security)

## 2. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 2.1 Struktura stron i routingu

#### Nowe strony do utworzenia:

- `/src/pages/auth/login.astro` - strona logowania
- `/src/pages/auth/register.astro` - strona rejestracji
- `/src/pages/auth/forgot-password.astro` - strona odzyskiwania hasła
- `/src/pages/auth/reset-password.astro` - strona resetowania hasła (z tokenem)
- `/src/pages/auth/logout.astro` - endpoint wylogowania (przekierowanie)

#### Modyfikacje istniejących stron:

- `/src/pages/index.astro` - dodanie obsługi stanu autentykacji
- `/src/pages/generate.astro` - bez zmian (dostępna dla wszystkich)
- `/src/layouts/Layout.astro` - dodanie nawigacji z przyciskami auth

#### Przyszłe strony wymagające autentykacji:

- `/src/pages/my-flashcards.astro` - lista fiszek użytkownika (US-005, US-006, US-007)
- `/src/pages/study-session.astro` - sesja nauki z algorytmem powtórek (US-008)

### 2.2 Komponenty React (client-side)

#### Nowe komponenty do utworzenia:

**`/src/components/auth/LoginForm.tsx`**

- Formularz logowania z polami email i password
- Walidacja client-side (format email, długość hasła)
- Obsługa błędów i komunikatów sukcesu
- Stan loading podczas logowania
- Przekierowanie po udanym logowaniu

**`/src/components/auth/RegisterForm.tsx`**

- Formularz rejestracji z polami email, password, confirmPassword
- Walidacja client-side (zgodność haseł, format email)
- Obsługa błędów rejestracji
- Stan loading podczas rejestracji
- Komunikat o konieczności weryfikacji email

**`/src/components/auth/ForgotPasswordForm.tsx`**

- Formularz z polem email
- Wysyłanie linku resetowania hasła
- Komunikat o wysłaniu emaila

**`/src/components/auth/ResetPasswordForm.tsx`**

- Formularz z nowymi hasłami (password, confirmPassword)
- Walidacja zgodności haseł
- Obsługa tokenu resetowania z URL

**`/src/components/auth/AuthButton.tsx`**

- Komponenty przycisku login/logout w nawigacji
- Wyświetlanie stanu zalogowanego użytkownika
- Dropdown z opcjami konta (opcjonalnie)

#### Modyfikacje istniejących komponentów:

**`/src/components/GenerationView.tsx`**

- Dodanie warunkowego wyświetlania komunikatu o potrzebie logowania dla zapisywania fiszek do kolekcji
- Bez zmian w funkcjonalności generowania (dostępne dla wszystkich zgodnie z US-003)
- Dodanie informacji o możliwości zarządzania fiszkami po zalogowaniu

### 2.3 Layout i nawigacja

#### Modyfikacje `/src/layouts/Layout.astro`:

- Dodanie nawigacji z przyciskami autentykacji w prawym górnym rogu
- Przekazywanie stanu użytkownika do komponentów React
- Obsługa dark/light mode z kontekstem użytkownika

```astro
---
import { AuthButton } from "../components/auth/AuthButton";
// ... inne importy

interface Props {
  title?: string;
  requireAuth?: boolean; // Opcjonalne wymaganie logowania
}

const { title = "10x Cards", requireAuth = false } = Astro.props;
const user = Astro.locals.user; // Z middleware

// Przekierowanie jeśli strona wymaga autentykacji
if (requireAuth && !user) {
  return Astro.redirect("/auth/login");
}
---

<!doctype html>
<html lang="en">
  <head>
    <!-- head content -->
  </head>
  <body>
    <header class="border-b bg-white/50 backdrop-blur">
      <nav class="container mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center gap-6">
          <a href="/" class="text-xl font-bold">10x Cards</a>
          <a href="/generate" class="text-gray-600 hover:text-gray-900">Generate</a>
          {
            user && (
              <>
                <a href="/my-flashcards" class="text-gray-600 hover:text-gray-900">
                  My Flashcards
                </a>
                <a href="/study-session" class="text-gray-600 hover:text-gray-900">
                  Study Session
                </a>
              </>
            )
          }
        </div>
        <AuthButton client:load user={user} />
      </nav>
    </header>
    <main>
      <slot />
    </main>
  </body>
</html>
```

### 2.4 Obsługa błędów i walidacji

#### Typy błędów do obsługi:

- **Błędy walidacji**: Format email, słabe hasło, niezgodność haseł
- **Błędy autentykacji**: Niepoprawne dane logowania, konto nieaktywne
- **Błędy sieciowe**: Brak połączenia, timeout API
- **Błędy tokenów**: Nieważny/wygasły token resetowania

#### Komunikaty użytkownika:

- Toast notifications dla sukcesu/błędów
- Inline validation w formularzach
- Loading states dla wszystkich operacji async
- Redirect messages po operacjach

## 3. LOGIKA BACKENDOWA

### 3.1 Middleware Astro

**`/src/middleware/index.ts`**

- Weryfikacja sesji Supabase dla każdego żądania
- Ustawianie kontekstu użytkownika w `Astro.locals`
- Obsługa refresh tokenów
- Ochrona tras wymagających autentykacji

```typescript
import { defineMiddleware } from "astro:middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../db/database.types";

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  // Pobierz sesję z ciasteczek lub headers
  const authHeader = context.request.headers.get("Authorization");
  const accessToken = authHeader?.replace("Bearer ", "");

  if (accessToken) {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    context.locals.user = user;
    context.locals.supabase = supabase;
  } else {
    context.locals.user = null;
    context.locals.supabase = supabase;
  }

  return next();
});
```

### 3.2 Endpointy API

#### `/src/pages/api/auth/login.ts`

```typescript
import type { APIRoute } from "astro";
import { supabaseClient } from "../../../db/supabase.client";

export const POST: APIRoute = async ({ request }) => {
  const { email, password } = await request.json();

  // Walidacja danych wejściowych
  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email and password required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      user: data.user,
      session: data.session,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
```

#### `/src/pages/api/auth/register.ts`

- Rejestracja nowego użytkownika
- Walidacja formatu email i siły hasła
- Wysyłanie emaila weryfikacyjnego

#### `/src/pages/api/auth/forgot-password.ts`

- Wysyłanie linku resetowania hasła
- Walidacja istnienia konta

#### `/src/pages/api/auth/reset-password.ts`

- Resetowanie hasła z tokenem
- Walidacja tokenu i nowego hasła

#### `/src/pages/api/auth/logout.ts`

- Wylogowanie użytkownika
- Czyszczenie sesji

### 3.3 Modele danych i typy

#### Rozszerzenie `/src/types.ts`:

```typescript
// Typy autentykacji
export interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user?: AuthUser;
  session?: any;
  error?: string;
}

// Rozszerzenie typów Astro
declare global {
  namespace App {
    interface Locals {
      user: AuthUser | null;
      supabase: SupabaseClient<Database>;
    }
  }
}
```

### 3.4 Usługi autentykacji

**`/src/lib/auth.service.ts`**

- Centralna logika autentykacji
- Walidacja danych
- Obsługa błędów
- Helpers dla komponentów

```typescript
import { supabaseClient } from "../db/supabase.client";
import type { LoginRequest, RegisterRequest, ForgotPasswordRequest } from "../types";

export class AuthService {
  static async login(credentials: LoginRequest) {
    const { data, error } = await supabaseClient.auth.signInWithPassword(credentials);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async register(userData: RegisterRequest) {
    if (userData.password !== userData.confirmPassword) {
      throw new Error("Passwords do not match");
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async forgotPassword(request: ForgotPasswordRequest) {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(request.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  static async logout() {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  }
}
```

## 4. SYSTEM AUTENTYKACJI Z SUPABASE

### 4.1 Konfiguracja Supabase Auth

#### Ustawienia Supabase:

- **Email confirmation**: Włączone (wymagana weryfikacja emaila)
- **Password requirements**: Minimum 8 znaków
- **Session timeout**: 1 godzina (configurable)
- **Refresh token rotation**: Włączone
- **JWT Secret**: Współdzielony między Supabase a aplikacją

#### Konfiguracja redirect URLs:

- `http://localhost:3000/auth/callback` (development)
- `https://yourdomain.com/auth/callback` (production)
- `http://localhost:3000/auth/reset-password` (reset password)

### 4.2 Row Level Security (RLS)

#### Polityki bezpieczeństwa dla tabel:

**Tabela `flashcards`:**

```sql
-- Użytkownicy mogą czytać tylko swoje fiszki
CREATE POLICY "Users can read own flashcards" ON flashcards
  FOR SELECT USING (user_id = auth.uid());

-- Użytkownicy mogą tworzyć fiszki tylko dla siebie
CREATE POLICY "Users can create own flashcards" ON flashcards
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Użytkownicy mogą edytować tylko swoje fiszki
CREATE POLICY "Users can update own flashcards" ON flashcards
  FOR UPDATE USING (user_id = auth.uid());

-- Użytkownicy mogą usuwać tylko swoje fiszki
CREATE POLICY "Users can delete own flashcards" ON flashcards
  FOR DELETE USING (user_id = auth.uid());
```

**Tabela `generation_sessions`:**

```sql
-- Podobne polityki dla sesji generowania
CREATE POLICY "Users can read own sessions" ON generation_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own sessions" ON generation_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());
```

### 4.3 Obsługa sesji i tokenów

#### Client-side session management:

- Automatyczne odświeżanie tokenów
- Przechowywanie sesji w localStorage/cookies
- Obsługa wygaśnięcia sesji
- Synchronizacja stanu między kartami przeglądarki

#### Server-side session validation:

- Weryfikacja JWT na każde żądanie API
- Walidacja uprawnień użytkownika
- Obsługa refresh tokenów
- Secure cookie configuration

## 5. SCENARIUSZE UŻYCIA I PRZEPŁYWY

### 5.1 Rejestracja nowego użytkownika (US-001)

1. Użytkownik wchodzi na `/auth/register`
2. Wypełnia formularz (email, hasło, potwierdzenie hasła)
3. Client-side walidacja
4. POST do `/api/auth/register`
5. Supabase tworzy konto i wysyła email weryfikacyjny
6. Przekierowanie na stronę z informacją o weryfikacji
7. Użytkownik klika link w emailu
8. Automatyczne przekierowanie na `/auth/login`

### 5.2 Logowanie użytkownika (US-002)

1. Użytkownik wchodzi na `/auth/login`
2. Wypełnia dane logowania
3. POST do `/api/auth/login`
4. Supabase weryfikuje dane
5. Zwrócenie sesji i tokenu
6. Przekierowanie na stronę główną lub żądaną stronę
7. Middleware ustawia kontekst użytkownika

### 5.3 Odzyskiwanie hasła (US-004)

1. Użytkownik klika "Forgot password" na `/auth/login`
2. Przekierowanie na `/auth/forgot-password`
3. Wpisuje email i wysyła żądanie
4. POST do `/api/auth/forgot-password`
5. Supabase wysyła email z linkiem resetowania
6. Użytkownik klika link (przekierowanie na `/auth/reset-password?token=...`)
7. Wypełnia nowe hasło
8. POST do `/api/auth/reset-password`
9. Przekierowanie na `/auth/login` z komunikatem sukcesu

### 5.4 Ochrona tras wymagających autentykacji

1. Użytkownik próbuje wejść na chronioną stronę (np. `/my-flashcards`)
2. Middleware sprawdza sesję
3. Jeśli brak sesji - przekierowanie na `/auth/login`
4. Po logowaniu - przekierowanie z powrotem na żądaną stronę
5. Jeśli sesja ważna - normalny dostęp

### 5.5 Integracja z funkcjonalnością fiszek

#### Generowanie fiszek (US-003) - dostępne dla wszystkich:

- **WAŻNE**: Zgodnie z późniejszymi wymaganiami w PRD, generowanie fiszek MOŻE być używane przez niezalogowanych użytkowników
- Obecna funkcjonalność w `/generate` pozostaje bez zmian
- Niezalogowani użytkownicy mogą generować fiszki, ale nie mogą ich zapisywać na stałe
- Dodanie subtelnego komunikatu o korzyściach z logowania (możliwość zapisania, zarządzania, sesji nauki)

#### Zapisywanie fiszek - wymaga logowania:

- Fiszki generowane przez niezalogowanych użytkowników nie są zapisywane do bazy danych
- Po zalogowaniu użytkownik może zapisywać wygenerowane fiszki
- Dostęp do zapisanych fiszek tylko przez własne konto

#### Zarządzanie fiszkami (US-005, US-006, US-007) - wymaga logowania:

- Edycja fiszek tylko dla właściciela
- Usuwanie fiszek tylko dla właściciela
- Ręczne tworzenie fiszek tylko dla zalogowanych

#### Sesja nauki (US-008) - wymaga logowania:

- Algorytm spaced repetition dostępny tylko dla zalogowanych
- Sesje nauki personalizowane dla każdego użytkownika

## 6. BEZPIECZEŃSTWO

### 6.1 Walidacja i sanityzacja danych

- **Client-side**: Format email, siła hasła, zgodność haseł
- **Server-side**: Dodatkowa walidacja wszystkich danych
- **SQL Injection**: Użycie Supabase SDK (parametryzowane zapytania)
- **XSS**: Sanityzacja wszystkich inputów użytkownika

### 6.2 Zarządzanie sesjami

- **JWT**: Krótki czas życia (1h), automatyczne odświeżanie
- **Refresh tokens**: Bezpieczne przechowywanie, rotacja
- **Secure cookies**: HttpOnly, Secure, SameSite
- **Logout**: Czyszczenie tokenów client i server-side

### 6.3 Ochrona przed atakami

- **Rate limiting**: Ograniczenie prób logowania
- **CSRF**: Tokeny CSRF dla formularzy
- **Brute force**: Tymczasowe blokowanie po niepowodzeniach
- **Password strength**: Wymagania co do siły hasła

### 6.4 Row Level Security (RLS)

- **Dostęp do danych**: Tylko właściciel może zarządzać swoimi fiszkami (US-009)
- **Izolacja użytkowników**: Brak dostępu do danych innych użytkowników
- **Automatyczna autoryzacja**: RLS automatycznie filtruje dane na poziomie bazy

## 7. INTEGRACJA Z ISTNIEJĄCĄ FUNKCJONALNOŚCIĄ

### 7.1 Kompatybilność z istniejącymi funkcjami

- **Generowanie fiszek**: Pozostaje dostępne dla wszystkich (zgodnie z US-003)
- **Zapisywanie fiszek**: Wymaga logowania (dla przyszłych funkcji zarządzania)
- **Istniejące API**: Dodanie middleware autentykacji bez breaking changes
- **Komponenty UI**: Rozszerzenie bez modyfikacji istniejących

### 7.2 Migracja danych

- **DEFAULT_USER_ID**: Stopniowe usuwanie z development
- **Istniejące fiszki**: Migracja do systemu użytkowników (jeśli dotyczy)
- **Sesje generowania**: Powiązanie z użytkownikami

### 7.3 Fallback i compatibility

- **Graceful degradation**: Aplikacja działa bez logowania dla podstawowych funkcji
- **Progressive enhancement**: Dodatkowe funkcje dla zalogowanych użytkowników
- **API versioning**: Zachowanie kompatybilności z istniejącymi endpointami

## 8. IMPLEMENTACJA USER STORIES

### 8.1 Mapowanie User Stories na funkcjonalności

**US-001: Rejestracja konta**

- ✅ Formularz rejestracyjny (email, hasło)
- ✅ Weryfikacja danych i aktywacja konta
- ✅ Potwierdzenie rejestracji i automatyczne logowanie

**US-002: Logowanie do aplikacji**

- ✅ Poprawne dane logowania → przekierowanie do widoku generowania
- ✅ Błędne dane → komunikat o błędzie
- ✅ Bezpieczne przechowywanie danych logowania

**US-003: Generowanie fiszek przy użyciu AI**

- ✅ **UWAGA**: To User Story ma sprzeczne wymagania w PRD - opis mówi o "zalogowanym użytkowniku", ale końcowe wymagania określają, że generowanie MOŻE być używane bez logowania
- ✅ **PRZYJĘTE ROZWIĄZANIE**: Generowanie dostępne dla wszystkich, zapisywanie wymaga logowania
- ✅ Pole tekstowe 1000-10000 znaków
- ✅ Komunikacja z API LLM i wyświetlanie propozycji
- ✅ Obsługa błędów API
- ✅ Opcjonalne zapisywanie dla zalogowanych użytkowników

**US-004: Przegląd i zatwierdzanie propozycji fiszek**

- ✅ Lista wygenerowanych fiszek (dostępna dla wszystkich)
- ✅ Przyciski zatwierdzenia, edycji, odrzucenia (dostępne dla wszystkich)
- ✅ Zapis zatwierdzonych fiszek do bazy (tylko dla zalogowanych)

**US-005: Edycja fiszek**

- ✅ Lista zapisanych fiszek (wymaga logowania)
- ✅ Tryb edycji dla każdej fiszki
- ✅ Zapisywanie zmian w bazie danych

**US-006: Usuwanie fiszek**

- ✅ Opcja usunięcia przy każdej fiszce (wymaga logowania)
- ✅ Potwierdzenie operacji
- ✅ Trwałe usunięcie z bazy danych

**US-007: Ręczne tworzenie fiszek**

- ✅ Przycisk dodania nowej fiszki (wymaga logowania)
- ✅ Formularz z polami "Przód" i "Tył"
- ✅ Zapisanie i wyświetlenie na liście

**US-008: Sesja nauki z algorytmem powtórek**

- ✅ Widok "Sesja nauki" (wymaga logowania)
- ✅ Przygotowanie sesji przez algorytm
- ✅ Wyświetlanie przodu/tyłu fiszki
- ✅ Ocena przyswojenia przez użytkownika

**US-009: Bezpieczny dostęp i autoryzacja**

- ✅ Dostęp tylko do własnych fiszek
- ✅ Brak dostępu do fiszek innych użytkowników
- ✅ RLS na poziomie bazy danych

### 8.2 Rozwiązanie sprzeczności w wymaganiach

**Zidentyfikowana sprzeczność**:

- US-003 w opisie: "Jako zalogowany użytkownik chcę wkleić kawałek tekstu..."
- Późniejsze wymagania: "Użytkownik MOŻE korzystać z tworzenia reguł "ad-hoc" bez logowania"

**Przyjęte rozwiązanie**:

1. **Generowanie fiszek dostępne dla wszystkich** - zgodnie z późniejszymi wymaganiami
2. **Zapisywanie wymaga logowania** - logiczna konsekwencja dla zarządzania danymi
3. **Progressive enhancement** - dodatkowe funkcje po zalogowaniu

**Implementacja**:

- Strona `/generate` dostępna bez logowania
- Generowanie i przeglądanie propozycji bez logowania
- Przycisk "Zapisz zatwierdzone fiszki" widoczny tylko dla zalogowanych
- Komunikat zachęcający do logowania dla dodatkowych funkcji

## 9. METRYKI I MONITORING

### 9.1 Metryki biznesowe

- Liczba rejestracji użytkowników
- Współczynnik konwersji (rejestracja → aktywny użytkownik)
- Liczba logowań dziennie/tygodniowo
- Odsetek użytkowników korzystających z funkcji wymagających logowania
- Statystyki generowania i akceptacji fiszek (zgodnie z metrykami sukcesu z PRD)

### 9.2 Metryki techniczne

- Czas odpowiedzi endpointów autentykacji
- Liczba błędów autentykacji
- Współczynnik sukcesu logowania
- Wykorzystanie refresh tokenów

### 9.3 Bezpieczeństwo

- Nieudane próby logowania
- Podejrzane aktywności (wielokrotne próby z tego samego IP)
- Wykorzystanie funkcji reset hasła
- Sesje wygasłe/odświeżone

## 10. WNIOSKI I REKOMENDACJE

### 10.1 Kluczowe decyzje architektoniczne

1. **Supabase Auth**: Wybór zapewnia pełną funkcjonalność z minimalnym nakładem pracy
2. **SSR + Client components**: Optymalna równowaga między wydajnością a interaktywnością
3. **Middleware-based protection**: Centralne zarządzanie autentykacją
4. **Progressive enhancement**: Zachowanie funkcjonalności dla niezalogowanych (US-003)

### 10.2 Potencjalne wyzwania

1. **Session synchronization**: Między kartami przeglądarki
2. **Token refresh**: Obsługa edge cases z wygasłymi tokenami
3. **Email delivery**: Konfiguracja i monitoring emaili weryfikacyjnych
4. **Mobile compatibility**: Przygotowanie na przyszłe aplikacje mobilne

### 10.3 Zgodność z wymaganiami PRD

✅ **Wszystkie User Stories mogą być zrealizowane** na podstawie tej architektury
✅ **Rozwiązana sprzeczność** dotycząca dostępności generowania fiszek
✅ **Zachowana kompatybilność** z istniejącą funkcjonalnością generowania fiszek
✅ **Bezpieczeństwo danych** zgodne z RODO i wymaganiami US-009
✅ **Skalowalność** zapewniona przez Supabase i architekturę mikrousług
✅ **Metryki sukcesu** mogą być zbierane zgodnie z wymaganiami
✅ **Progressive enhancement** - aplikacja działa bez logowania, więcej funkcji po zalogowaniu

### 10.4 Kolejne kroki implementacji

1. **Faza 1**: Middleware i podstawowe endpointy autentykacji
2. **Faza 2**: Komponenty UI i strony autentykacji
3. **Faza 3**: Integracja z istniejącymi funkcjami (fiszki, generowanie)
4. **Faza 4**: Nowe funkcje wymagające autentykacji (my-flashcards, study-session)
5. **Faza 5**: Testowanie, optymalizacja i monitoring

Ta architektura zapewnia pełną implementację wymagań autentykacji przy zachowaniu kompatybilności z istniejącą funkcjonalnością aplikacji do tworzenia i zarządzania fiszkami edukacyjnymi.
