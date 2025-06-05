import type { APIRoute } from "astro";
import { z } from "zod";

// Disable prerendering for this API endpoint
export const prerender = false;

// Input validation schema
const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const formData = await request.formData();
    const email = formData.get("email")?.toString();

    // Validate input
    const result = resetPasswordSchema.safeParse({ email });
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

    // Send password reset email with Supabase
    const { error } = await locals.supabase.auth.resetPasswordForEmail(result.data.email, {
      redirectTo: `${new URL(request.url).origin}/auth/reset-password`,
    });

    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
          success: false,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Password reset email sent. Please check your inbox.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Password reset error:", err);
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
