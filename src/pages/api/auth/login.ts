import type { APIRoute } from "astro";
import { z } from "zod";

// Disable prerendering for this API endpoint
export const prerender = false;

// Input validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    // Validate input
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errors = result.error.errors.map((err) => err.message).join(", ");
      return new Response(
        JSON.stringify({
          error: errors,
          success: false,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Sign in with Supabase
    const { data, error } = await locals.supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });

    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
          success: false,
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return success response with user info
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Login error:", err);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
        success: false,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
