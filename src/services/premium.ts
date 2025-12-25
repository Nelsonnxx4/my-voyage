import { supabase } from "@/config/supabase";
import type { UserProfile } from "@/types/user";
import { stripeService } from "@/services/stripe";

export const upgradeToPremium = async (): Promise<UserProfile> => {
  throw new Error("Use initiatePremiumCheckout for Stripe subscriptions");
};

export const checkPremiumStatus = async (userId: string): Promise<boolean> => {
  try {
    const subscriptionData = await stripeService.getSubscriptionStatus();
    const hasActiveSubscription = ["active", "trialing"].includes(
      subscriptionData.status
    );

    if (hasActiveSubscription) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium, subscription_tier")
        .eq("id", userId)
        .single();

      if (!profile?.is_premium) {
        await supabase
          .from("profiles")
          .update({
            is_premium: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
      }
      return true;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("is_premium, subscription_end")
      .eq("id", userId)
      .single();

    if (error) throw error;

    // Check if subscription hasn't expired
    if (data.subscription_end && new Date(data.subscription_end) > new Date()) {
      return true;
    }

    // If premium but subscription ended, downgrade
    if (
      data.is_premium &&
      (!data.subscription_end || new Date(data.subscription_end) <= new Date())
    ) {
      await supabase
        .from("profiles")
        .update({
          is_premium: false,
          subscription_tier: "free",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      return false;
    }

    return data.is_premium;
  } catch (error) {
    console.error("Error checking premium status:", error);
    return false;
  }
};

export const initiatePremiumCheckout = async (
  priceId: string
): Promise<void> => {
  try {
    const result = await stripeService.createCheckoutSession(priceId);

    if (result.url) {
      // Redirect directly if URL is provided
      window.location.href = result.url;
    } else {
      // Use Stripe.js redirect
      await stripeService.redirectToCheckout(result.sessionId);
    }
  } catch (error) {
    console.error("Checkout initiation failed:", error);
    throw error;
  }
};

export const manageSubscription = async (): Promise<void> => {
  try {
    const portalUrl = await stripeService.createCustomerPortalSession();
    window.location.href = portalUrl;
  } catch (error) {
    console.error("Failed to create customer portal:", error);
    throw error;
  }
};

export const getSubscriptionDetails = async (userId: string) => {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data;
};
