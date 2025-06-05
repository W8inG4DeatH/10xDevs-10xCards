import React from "react";
import type { User } from "@supabase/supabase-js";
import { Button } from "../ui/button";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";

interface AuthButtonProps {
  user: User | null;
}

export function AuthButton({ user }: AuthButtonProps) {
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <a href="/auth/login">
          <Button variant="outline" size="sm">
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <UserIcon className="h-4 w-4" />
        <span>{user.email}</span>
      </div>
      <a href="/api/auth/logout">
        <Button variant="outline" size="sm">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </a>
    </div>
  );
}
