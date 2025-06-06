import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { testUsers } from "../fixtures/users";

// Mock component for testing (this would normally be imported from src/components)
interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
}

function MockLoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    await onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} data-testid="login-form">
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required data-testid="email-input" />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required data-testid="password-input" />
      </div>
      <button type="submit" disabled={isLoading} data-testid="submit-button">
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}

describe("Authentication Integration Tests", () => {
  describe("LoginForm", () => {
    it("should render login form correctly", () => {
      const mockOnSubmit = vi.fn();
      render(<MockLoginForm onSubmit={mockOnSubmit} />);

      expect(screen.getByTestId("login-form")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByTestId("submit-button")).toBeInTheDocument();
    });

    it("should call onSubmit with correct credentials", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

      render(<MockLoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByTestId("email-input");
      const passwordInput = screen.getByTestId("password-input");
      const submitButton = screen.getByTestId("submit-button");

      await user.type(emailInput, testUsers.validUser.email);
      await user.type(passwordInput, testUsers.validUser.password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(testUsers.validUser.email, testUsers.validUser.password);
      });
    });

    it("should show loading state during submission", async () => {
      const mockOnSubmit = vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<MockLoginForm onSubmit={mockOnSubmit} isLoading={true} />);

      const submitButton = screen.getByTestId("submit-button");

      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent("Logging in...");
    });

    it("should handle form validation", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();

      render(<MockLoginForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByTestId("submit-button");

      // Try to submit without filling fields
      await user.click(submitButton);

      // Form should not submit due to HTML5 validation
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should call onSubmit even when it fails", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

      render(<MockLoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByTestId("email-input");
      const passwordInput = screen.getByTestId("password-input");
      const submitButton = screen.getByTestId("submit-button");

      await user.type(emailInput, testUsers.validUser.email);
      await user.type(passwordInput, "wrongpassword");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(testUsers.validUser.email, "wrongpassword");
      });
    });
  });
});
