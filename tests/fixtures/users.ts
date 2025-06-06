export const testUsers = {
  validUser: {
    email: "test@example.com",
    password: "TestPassword123!",
    name: "Test User",
  },

  invalidUser: {
    email: "invalid-email",
    password: "123",
    name: "",
  },

  existingUser: {
    email: "existing@example.com",
    password: "ExistingPassword123!",
    name: "Existing User",
  },

  adminUser: {
    email: "admin@example.com",
    password: "AdminPassword123!",
    name: "Admin User",
    role: "admin",
  },
} as const;

export const testFlashcards = [
  {
    front: "What is React?",
    back: "A JavaScript library for building user interfaces",
  },
  {
    front: "What is TypeScript?",
    back: "A typed superset of JavaScript that compiles to plain JavaScript",
  },
  {
    front: "What is Astro?",
    back: "A modern static site generator that builds fast websites",
  },
] as const;
