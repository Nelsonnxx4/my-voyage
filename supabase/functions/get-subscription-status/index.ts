import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the user from the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("PROJECT_URL") ?? "",
      Deno.env.get("ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get subscription status with more details
    const { data: subscription } = await supabaseClient
      .from("subscriptions")
      .select("status, current_period_end, price_id")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing", "past_due"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // If no subscription found, check profile for legacy premium status
    if (!subscription) {
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("is_premium, subscription_end")
        .eq("id", user.id)
        .single();

      if (
        profile?.is_premium &&
        profile.subscription_end &&
        new Date(profile.subscription_end) > new Date()
      ) {
        return new Response(
          JSON.stringify({
            status: "active",
            current_period_end: profile.subscription_end,
            isLegacy: true,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        status: subscription?.status || "inactive",
        current_period_end: subscription?.current_period_end,
        price_id: subscription?.price_id,
        cancel_at_period_end: subscription.cancel_at_period_end,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error getting subscription status:", error);
    return new Response(
      JSON.stringify({
        status: "inactive",
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }
});
