import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

// Default user ID for development (remove in production)
export const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000000";

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type { SupabaseClient };
