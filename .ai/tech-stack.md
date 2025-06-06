Frontend - Astro z React dla komponentów interaktywnych:

- Astro 5 pozwala na tworzenie szybkich, wydajnych stron i aplikacji z minimalną ilością JavaScript
- React 19 zapewni interaktywność tam, gdzie jest potrzebna
- TypeScript 5 dla statycznego typowania kodu i lepszego wsparcia IDE
- Tailwind 4 pozwala na wygodne stylowanie aplikacji
- Shadcn/ui zapewnia bibliotekę dostępnych komponentów React, na których oprzemy UI

Backend - Supabase jako kompleksowe rozwiązanie backendowe:

- Zapewnia bazę danych PostgreSQL
- Zapewnia SDK w wielu językach, które posłużą jako Backend-as-a-Service
- Jest rozwiązaniem open source, które można hostować lokalnie lub na własnym serwerze
- Posiada wbudowaną autentykację użytkowników

AI - Komunikacja z modelami przez usługę Openrouter.ai:

- Dostęp do szerokiej gamy modeli (OpenAI, Anthropic, Google i wiele innych), które pozwolą nam znaleźć rozwiązanie zapewniające wysoką efektywność i niskie koszta
- Pozwala na ustawianie limitów finansowych na klucze API

Testing - Kompleksowe rozwiązanie testowe:

- Vitest jako framework do testów jednostkowych i integracyjnych z wbudowanym wsparciem dla TypeScript
- React Testing Library do testowania komponentów React z użyciem @testing-library/user-event
- MSW (Mock Service Worker) do mockowania API w testach izolowanych
- Faker.js do generowania danych testowych
- Playwright do testów End-to-End na trzech silnikach przeglądarek (Chromium, Firefox, WebKit)
- @axe-core/playwright do automatycznych testów dostępności (WCAG)
- c8 do analizy pokrycia kodu (wbudowane w Vitest)
- codecov do raportowania pokrycia kodu w pipeline CI/CD

CI/CD i Hosting:

- Github Actions do tworzenia pipeline'ów CI/CD
- DigitalOcean do hostowania aplikacji za pośrednictwem obrazu docker
