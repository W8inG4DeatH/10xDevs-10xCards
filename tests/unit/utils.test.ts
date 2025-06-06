import { describe, it, expect } from "vitest";

// Example utility function to test (this would normally be imported from src/lib/utils.ts)
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Additional check for consecutive dots
  if (email.includes("..")) return false;
  return emailRegex.test(email);
}

describe("Utility Functions", () => {
  describe("formatDate", () => {
    it("should format date correctly", () => {
      const testDate = new Date("2024-01-15");
      const formatted = formatDate(testDate);
      expect(formatted).toBe("January 15, 2024");
    });

    it("should handle different dates", () => {
      const testDate = new Date("2023-12-25");
      const formatted = formatDate(testDate);
      expect(formatted).toBe("December 25, 2023");
    });
  });

  describe("validateEmail", () => {
    it("should validate correct email addresses", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user.name@domain.co.uk")).toBe(true);
      expect(validateEmail("test+tag@example.org")).toBe(true);
    });

    it("should reject invalid email addresses", () => {
      expect(validateEmail("invalid-email")).toBe(false);
      expect(validateEmail("test@")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
      expect(validateEmail("test..test@example.com")).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(validateEmail("")).toBe(false);
      expect(validateEmail(" ")).toBe(false);
      expect(validateEmail("test @example.com")).toBe(false);
    });
  });
});
