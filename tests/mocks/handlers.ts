import { http, HttpResponse } from "msw";
import { faker } from "@faker-js/faker";

// Mock data generators
const generateFlashcard = () => ({
  id: faker.string.uuid(),
  front: faker.lorem.sentence(),
  back: faker.lorem.paragraph(),
  created_at: faker.date.recent().toISOString(),
  updated_at: faker.date.recent().toISOString(),
  user_id: faker.string.uuid(),
});

const generateUser = () => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  created_at: faker.date.recent().toISOString(),
  updated_at: faker.date.recent().toISOString(),
});

// MSW Handlers for API mocking
export const handlers = [
  // Supabase Auth handlers
  http.post("*/auth/v1/token", async ({ request }) => {
    const body = await request.json();

    if (body.grant_type === "password") {
      return HttpResponse.json({
        access_token: faker.string.alphanumeric(32),
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: faker.string.alphanumeric(32),
        user: generateUser(),
      });
    }

    return HttpResponse.json({ error: "invalid_grant", error_description: "Invalid credentials" }, { status: 400 });
  }),

  http.post("*/auth/v1/signup", async () => {
    return HttpResponse.json({
      user: generateUser(),
      session: {
        access_token: faker.string.alphanumeric(32),
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: faker.string.alphanumeric(32),
      },
    });
  }),

  http.post("*/auth/v1/logout", async () => {
    return HttpResponse.json({}, { status: 204 });
  }),

  // Supabase Database handlers
  http.get("*/rest/v1/flashcards", async ({ request }) => {
    const url = new URL(request.url);
    const select = url.searchParams.get("select");

    if (select) {
      return HttpResponse.json([generateFlashcard(), generateFlashcard(), generateFlashcard()]);
    }

    return HttpResponse.json([]);
  }),

  http.post("*/rest/v1/flashcards", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        ...generateFlashcard(),
        ...body,
      },
      { status: 201 }
    );
  }),

  http.patch("*/rest/v1/flashcards", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      ...generateFlashcard(),
      ...body,
    });
  }),

  http.delete("*/rest/v1/flashcards", async () => {
    return HttpResponse.json({}, { status: 204 });
  }),

  // OpenRouter AI handlers
  http.post("https://openrouter.ai/api/v1/chat/completions", async ({ request }) => {
    const body = await request.json();

    // Simulate AI response for flashcard generation
    const mockFlashcards = Array.from({ length: 5 }, () => ({
      front: faker.lorem.sentence(),
      back: faker.lorem.paragraph(),
    }));

    return HttpResponse.json({
      id: faker.string.alphanumeric(32),
      object: "chat.completion",
      created: Date.now(),
      model: body.model || "gpt-3.5-turbo",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: JSON.stringify(mockFlashcards),
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 200,
        total_tokens: 300,
      },
    });
  }),

  // Error simulation handlers
  http.post("*/test/error", async () => {
    return HttpResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }),

  http.get("*/test/timeout", async () => {
    // Simulate timeout
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return HttpResponse.json({ message: "This should timeout" });
  }),
];
