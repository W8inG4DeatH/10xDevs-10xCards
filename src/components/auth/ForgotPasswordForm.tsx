import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | undefined>();

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const emailError = validateEmail(email);

    if (emailError) {
      setValidationError(emailError);
      return;
    }

    // Clear validation error and any previous errors
    setValidationError(undefined);
    setError(null);
    setIsLoading(true);

    try {
      // Submit to API
      const formData = new FormData();
      formData.append("email", email);

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Failed to send reset email");
        return;
      }

      // Success - show success state
      setSuccess(true);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Clear validation error on change
    if (validationError) {
      setValidationError(undefined);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Check Your Email</CardTitle>
          <CardDescription className="text-center">We&apos;ve sent you a password reset link</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              If an account with the email <strong>{email}</strong> exists, you will receive a password reset link
              shortly.
            </AlertDescription>
          </Alert>

          <div className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Didn&apos;t receive an email? Check your spam folder or try again.
            </p>

            <div className="flex flex-col gap-2">
              <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
                Send Another Email
              </Button>

              <a href="/auth/login" className="w-full">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sign In
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        <CardDescription>Enter your email address and well send you a link to reset your password</CardDescription>
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
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              disabled={isLoading}
              className={validationError ? "border-destructive focus-visible:ring-destructive" : ""}
              placeholder="Enter your email address"
              autoComplete="email"
            />
            {validationError && <p className="text-sm text-destructive">{validationError}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !email.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Reset Link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/auth/login"
            className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
