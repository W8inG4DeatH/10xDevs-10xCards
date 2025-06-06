import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "../db/supabase.client";

// Public paths - Auth API endpoints & Server-Rendered Astro Pages
const PUBLIC_PATHS = [
  // Home page
  "/",
  // Server-Rendered Astro Pages
  "/auth/login",
  "/auth/register",
  "/auth/signup", // Alias for register
  "/auth/reset-password",
  "/auth/forgot-password",
  "/auth/logout",
  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
  "/api/auth/update-password",
  "/api/auth/logout",
];

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServerClient({
    headers: context.request.headers,
    cookies: context.cookies,
  });

  // Set supabase client on locals for use in API routes
  context.locals.supabase = supabase;

  // IMPORTANT: Always get user session first before any other operations
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Set user on locals if authenticated
  context.locals.user = user;

  // Skip auth check for public paths
  if (PUBLIC_PATHS.includes(context.url.pathname)) {
    return next();
  }

  // Redirect to login for protected routes if not authenticated
  if (!user) {
    return context.redirect("/auth/login");
  }

  return next();
});
