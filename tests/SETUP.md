# Instrukcje Konfiguracji Środowiska Testowego

## ✅ Środowisko Testowe Zostało Skonfigurowane

Środowisko testowe dla projektu 10xDevs-10xCards zostało pomyślnie przygotowane zgodnie z wymaganiami z tech stacku. Poniżej znajdziesz instrukcje dotyczące uruchamiania i korzystania z testów.

## 🛠️ Co zostało skonfigurowane

### 1. Testy Jednostkowe i Integracyjne (Vitest)
- ✅ Vitest z konfiguracją TypeScript
- ✅ React Testing Library
- ✅ MSW (Mock Service Worker) do mockowania API
- ✅ Faker.js do generowania danych testowych
- ✅ Happy DOM jako środowisko testowe
- ✅ Pokrycie kodu (c8) z progami 80%

### 2. Testy E2E (Playwright)
- ✅ Playwright z konfiguracją multi-browser
- ✅ Testy na Chromium, Firefox, WebKit
- ✅ Testy mobilne (Pixel 5, iPhone 12)
- ✅ Axe-core do testów dostępności
- ✅ Automatyczne screenshoty i nagrania przy błędach

### 3. Struktura Katalogów
```
tests/
├── unit/           # Testy jednostkowe
├── integration/    # Testy integracyjne
├── e2e/           # Testy end-to-end
├── mocks/         # MSW handlers
├── setup/         # Pliki konfiguracyjne
├── fixtures/      # Dane testowe
└── README.md      # Dokumentacja
```

### 4. Pliki Konfiguracyjne
- ✅ `vitest.config.ts` - Konfiguracja Vitest
- ✅ `playwright.config.ts` - Konfiguracja Playwright
- ✅ `tests/setup/vitest.setup.ts` - Setup dla Vitest
- ✅ `tests/mocks/server.ts` - Serwer MSW
- ✅ `tests/mocks/handlers.ts` - Handlery API

### 5. Przykładowe Testy
- ✅ `tests/unit/utils.test.ts` - Przykład testów jednostkowych
- ✅ `tests/integration/auth.test.tsx` - Przykład testów integracyjnych
- ✅ `tests/e2e/auth.spec.ts` - Przykład testów E2E

## 🚀 Uruchamianie Testów

### Testy Jednostkowe i Integracyjne

```bash
# Uruchom testy w trybie watch
npm run test

# Uruchom testy raz
npm run test:run

# Uruchom testy z interfejsem UI
npm run test:ui

# Uruchom testy z pokryciem kodu
npm run test:coverage

# Uruchom testy w trybie watch
npm run test:watch
```

### Testy E2E

**UWAGA**: Przed uruchomieniem testów E2E, uruchom serwer deweloperski w osobnym terminalu:

```bash
# Terminal 1 - uruchom serwer dev
npm run dev

# Terminal 2 - uruchom testy E2E
npm run test:e2e

# Inne opcje testów E2E
npm run test:e2e:ui      # Z interfejsem UI
npm run test:e2e:headed  # Z widoczną przeglądarką
npm run test:e2e:debug   # W trybie debug
```

### Wszystkie Testy

```bash
# Uruchom wszystkie testy (jednostkowe + E2E)
# UWAGA: Wymaga uruchomionego serwera dev
npm run test:all
```

## 📊 Pokrycie Kodu

Raporty pokrycia kodu są generowane w katalogu `coverage/` po uruchomieniu:

```bash
npm run test:coverage
```

### Progi Pokrycia
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## 🎭 Mockowanie API

API jest mockowane przy użyciu MSW. Handlery są zdefiniowane w `tests/mocks/handlers.ts` i obejmują:

- Supabase Auth (login, register, logout)
- Supabase Database (CRUD operations)
- OpenRouter AI (chat completions)
- Symulacje błędów i timeoutów

## 🧪 Przykłady Testów

### Test Jednostkowy
```typescript
import { describe, it, expect } from 'vitest';

describe('myFunction', () => {
  it('should return expected result', () => {
    expect(myFunction('input')).toBe('expected output');
  });
});
```

### Test Integracyjny
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('should handle user interaction', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);
  
  await user.click(screen.getByRole('button'));
  expect(screen.getByText('Expected text')).toBeInTheDocument();
});
```

### Test E2E
```typescript
import { test, expect } from '@playwright/test';

test('should complete user flow', async ({ page }) => {
  await page.goto('/');
  await page.click('button[data-testid="start-button"]');
  await expect(page.locator('h1')).toContainText('Welcome');
});
```

## 🔧 Konfiguracja CI/CD

Środowisko jest gotowe do integracji z GitHub Actions. Przykładowa konfiguracja:

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:run
      - run: npx playwright install
      - run: npm run test:e2e
```

## 📝 Następne Kroki

1. **Dodaj testy dla istniejących komponentów**:
   - Skopiuj komponenty z `src/components` i napisz dla nich testy
   - Użyj przykładów z `tests/integration/auth.test.tsx`

2. **Dodaj testy dla API endpoints**:
   - Testuj endpointy z `src/pages/api`
   - Użyj MSW do mockowania Supabase

3. **Dodaj testy E2E dla głównych przepływów**:
   - Rejestracja i logowanie
   - Generowanie fiszek
   - Zarządzanie fiszkami

4. **Skonfiguruj CI/CD**:
   - Dodaj GitHub Actions workflow
   - Skonfiguruj automatyczne uruchamianie testów

## 🐛 Rozwiązywanie Problemów

### Testy jednostkowe nie działają
```bash
# Sprawdź konfigurację
npm run test -- --reporter=verbose

# Sprawdź czy wszystkie zależności są zainstalowane
npm install
```

### Testy E2E nie działają
```bash
# Upewnij się, że serwer dev jest uruchomiony
npm run dev

# Sprawdź czy Playwright jest zainstalowany
npx playwright install

# Uruchom testy w trybie debug
npm run test:e2e:debug
```

### MSW nie przechwytuje requestów
- Sprawdź czy handlery są poprawnie zdefiniowane w `tests/mocks/handlers.ts`
- Upewnij się, że serwer MSW jest uruchomiony w setup

## 📚 Dokumentacja

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/)

## ✨ Podsumowanie

Środowisko testowe zostało w pełni skonfigurowane i jest gotowe do użycia. Wszystkie narzędzia są zintegrowane i działają zgodnie z najlepszymi praktykami testowania aplikacji React/Astro.

**Status**: ✅ GOTOWE DO UŻYCIA 