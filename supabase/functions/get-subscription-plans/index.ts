import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FREE_PLAN = {
  id: "free",
  name: "Free/Basic",
  description: "Everything you need to get started with travel journaling.",
  featured: false,
  features: [
    "Up to 10 voyage entries",
    "1 image per voyage",
    "2 pinned locations",
    "Social sharing",
  ],
  prices: [
    {
      id: "",
      amount: 0,
      currency: "usd",
      interval: "forever",
      intervalCount: null,
    },
  ],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const products = await stripe.products.list({
      active: true,
      expand: ["data.default_price"],
    });

    const formattedProducts = products.data.map((product) => {
      const defaultPrice = product.default_price as Stripe.Price;

      return {
        id: product.id,
        name: product.name,
        description: product.description || "",
        featured: product.metadata.featured === "true",
        features: product.metadata.features
          ? product.metadata.features.split(",").map((f: string) => f.trim())
          : [],
        prices: [
          {
            id: defaultPrice?.id ?? "",
            amount: (defaultPrice?.unit_amount ?? 0) / 100,
            currency: defaultPrice?.currency ?? "usd",
            interval: defaultPrice?.recurring?.interval ?? null,
            intervalCount: defaultPrice?.recurring?.interval_count ?? null,
          },
        ],
      };
    });

    // Always prepend the free plan so the frontend always has it
    const allProducts = [FREE_PLAN, ...formattedProducts];

    return new Response(JSON.stringify({ products: allProducts }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
