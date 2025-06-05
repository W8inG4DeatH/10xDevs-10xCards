import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient, parseCookieHeader, type CookieOptionsWithName } from "@supabase/ssr";
import type { AstroCookies } from "astro";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

// Default user ID for development (remove in production)
export const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000000";

// Client-side Supabase client (for components)
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Cookie options for server-side client
export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

// Server-side Supabase client factory
export const createSupabaseServerClient = (context: { headers: Headers; cookies: AstroCookies }) => {
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookieOptions,
    cookies: {
      getAll() {
        const cookies = parseCookieHeader(context.headers.get("Cookie") ?? "");
        return cookies.map((cookie) => ({
          name: cookie.name,
          value: cookie.value ?? "",
        }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });
};

// Alternative server instance creator for API routes (keeping backward compatibility)
export const createSupabaseServerInstance = createSupabaseServerClient;

export type { SupabaseClient };
