async function globalTeardown() {
  console.log("Starting global teardown for E2E tests...");

  // Clean up test database or other global resources
  // For example, clean up test data, close connections, etc.

  console.log("Global teardown completed");
}

export default globalTeardown;
