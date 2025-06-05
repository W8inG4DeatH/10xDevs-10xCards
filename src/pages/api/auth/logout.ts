import type { APIRoute } from "astro";

// Disable prerendering for this API endpoint
export const prerender = false;

export const GET: APIRoute = async ({ locals, redirect }) => {
  try {
    // Sign out with Supabase
    const { error } = await locals.supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return new Response(
        JSON.stringify({
          error: error.message,
          success: false,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Redirect to login page after successful logout
    return redirect("/auth/login");
  } catch (err) {
    console.error("Logout error:", err);
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
