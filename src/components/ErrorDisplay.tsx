import React from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { XCircle } from "lucide-react";

interface ErrorDisplayProps {
  error: string | null;
  onDismiss: () => void;
  onRetry?: () => void;
}

export function ErrorDisplay({ error, onDismiss, onRetry }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="my-4">
      <XCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{error}</p>
        <div className="flex gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={onDismiss}>
            Dismiss
          </Button>
          {onRetry && (
            <Button variant="default" size="sm" onClick={onRetry}>
              Try Again
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
