import type { APIRoute } from "astro";
import { z } from "zod";

// Disable prerendering for this API endpoint
export const prerender = false;

// Input validation schema
const updatePasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long"),
  token: z.string().min(1, "Reset token is required"),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const formData = await request.formData();
    const password = formData.get("password")?.toString();
    const token = formData.get("token")?.toString();

    // Validate input
    const result = updatePasswordSchema.safeParse({ password, token });
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

    // Update password with Supabase
    const { error } = await locals.supabase.auth.updateUser({
      password: result.data.password,
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
        message: "Password updated successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Password update error:", err);
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
