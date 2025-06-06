async function globalSetup() {
  console.log("Starting global setup for E2E tests...");

  // Setup test database or other global resources
  // For example, seed test data, authenticate test users, etc.

  // Wait for the dev server to be ready
  if (!process.env.CI) {
    console.log("Waiting for dev server to be ready...");
    // Additional setup logic if needed
  }

  console.log("Global setup completed");
}

export default globalSetup;
