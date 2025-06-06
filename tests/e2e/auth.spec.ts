import { test, expect } from "@playwright/test";
import { testUsers } from "../fixtures/users";

test.describe("Authentication E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto("/");
  });

  test("should display login page correctly", async ({ page }) => {
    await page.goto("/auth/login");

    // Check if login form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Check page title
    await expect(page).toHaveTitle(/Login/);
  });

  test("should handle login flow", async ({ page }) => {
    await page.goto("/auth/login");

    // Fill in login form
    await page.fill('input[type="email"]', testUsers.validUser.email);
    await page.fill('input[type="password"]', testUsers.validUser.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation or success message
    // This would depend on your actual implementation
    await page.waitForURL("**/dashboard", { timeout: 5000 });

    // Verify successful login
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test("should handle login with invalid credentials", async ({ page }) => {
    await page.goto("/auth/login");

    // Fill in login form with invalid credentials
    await page.fill('input[type="email"]', "invalid@example.com");
    await page.fill('input[type="password"]', "wrongpassword");

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText("Invalid credentials");
  });

  test("should navigate to registration page", async ({ page }) => {
    await page.goto("/auth/login");

    // Click on register link
    await page.click('a[href="/auth/register"]');

    // Verify navigation to registration page
    await expect(page).toHaveURL(/.*\/auth\/register/);
    await expect(page).toHaveTitle(/Register/);
  });

  test("should handle registration flow", async ({ page }) => {
    await page.goto("/auth/register");

    // Fill in registration form
    await page.fill('input[name="email"]', testUsers.validUser.email);
    await page.fill('input[name="password"]', testUsers.validUser.password);
    await page.fill('input[name="confirmPassword"]', testUsers.validUser.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success message or redirect
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test("should handle password reset flow", async ({ page }) => {
    await page.goto("/auth/login");

    // Click forgot password link
    await page.click('a[href="/auth/forgot-password"]');

    // Verify navigation to forgot password page
    await expect(page).toHaveURL(/.*\/auth\/forgot-password/);

    // Fill in email
    await page.fill('input[type="email"]', testUsers.validUser.email);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test("should protect authenticated routes", async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto("/dashboard");

    // Should redirect to login page
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  test("should handle logout", async ({ page }) => {
    // First login (this would need to be implemented based on your auth flow)
    await page.goto("/auth/login");
    await page.fill('input[type="email"]', testUsers.validUser.email);
    await page.fill('input[type="password"]', testUsers.validUser.password);
    await page.click('button[type="submit"]');

    // Wait for successful login
    await page.waitForURL("**/dashboard", { timeout: 5000 });

    // Click logout button
    await page.click('[data-testid="logout-button"]');

    // Verify redirect to login page
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });
});
