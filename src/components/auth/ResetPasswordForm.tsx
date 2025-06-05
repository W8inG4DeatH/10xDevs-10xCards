import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface ResetPasswordFormProps {
  token?: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    return undefined;
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
    if (!confirmPassword) {
      return "Please confirm your password";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return undefined;
  };

  const getPasswordStrength = (password: string): { score: number; text: string; color: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/(?=.*[a-z])/.test(password)) score++;
    if (/(?=.*[A-Z])/.test(password)) score++;
    if (/(?=.*\d)/.test(password)) score++;
    if (/(?=.*[!@#$%^&*])/.test(password)) score++;

    if (score === 0) return { score, text: "", color: "" };
    if (score <= 2) return { score, text: "Weak", color: "text-red-500" };
    if (score <= 3) return { score, text: "Fair", color: "text-yellow-500" };
    if (score <= 4) return { score, text: "Good", color: "text-blue-500" };
    return { score, text: "Strong", color: "text-green-500" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(password, confirmPassword);

    if (passwordError || confirmPasswordError) {
      setValidationErrors({
        password: passwordError,
        confirmPassword: confirmPasswordError,
      });
      return;
    }

    // Clear validation errors and any previous errors
    setValidationErrors({});
    setError(null);
    setIsLoading(true);

    try {
      // Submit to API
      const formData = new FormData();
      formData.append("password", password);
      formData.append("token", token || "");

      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Failed to update password");
        return;
      }

      // Success - show success state
      setSuccess(true);
    } catch (err) {
      console.error("Reset password error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);

    // Clear password validation error on change
    if (validationErrors.password) {
      setValidationErrors((prev) => ({ ...prev, password: undefined }));
    }

    // Re-validate confirm password if it was entered
    if (confirmPassword && validationErrors.confirmPassword) {
      const confirmError = validateConfirmPassword(value, confirmPassword);
      if (!confirmError) {
        setValidationErrors((prev) => ({ ...prev, confirmPassword: undefined }));
      }
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);

    // Clear confirm password validation error on change
    if (validationErrors.confirmPassword) {
      setValidationErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  // Show error if no token is provided
  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Invalid Reset Link</CardTitle>
          <CardDescription className="text-center">This password reset link is invalid or has expired</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please request a new password reset link to continue.</AlertDescription>
          </Alert>

          <div className="mt-6 text-center">
            <a href="/auth/forgot-password" className="text-primary underline-offset-4 hover:underline font-medium">
              Request New Reset Link
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Password Reset Successful</CardTitle>
          <CardDescription className="text-center">Your password has been successfully updated</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              You can now sign in with your new password.
            </AlertDescription>
          </Alert>

          <div className="mt-6 text-center">
            <a href="/auth/login" className="w-full">
              <Button className="w-full">Sign In Now</Button>
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  const passwordStrength = getPasswordStrength(password);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                disabled={isLoading}
                className={
                  validationErrors.password ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"
                }
                placeholder="Enter your new password"
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>

            {password && passwordStrength.text && (
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength.score <= 2
                        ? "bg-red-500"
                        : passwordStrength.score <= 3
                          ? "bg-yellow-500"
                          : passwordStrength.score <= 4
                            ? "bg-blue-500"
                            : "bg-green-500"
                    }`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
                <span className={`text-sm ${passwordStrength.color}`}>{passwordStrength.text}</span>
              </div>
            )}

            {validationErrors.password && <p className="text-sm text-destructive">{validationErrors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                disabled={isLoading}
                className={
                  validationErrors.confirmPassword ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"
                }
                placeholder="Confirm your new password"
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="text-sm text-destructive">{validationErrors.confirmPassword}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Password...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
