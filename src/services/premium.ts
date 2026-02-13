import { supabase } from "@/config/supabase";
import { stripeService } from "@/services/stripe";

export const checkPremiumStatus = async (userId: string): Promise<boolean> => {
  try {
    // 1. Try Stripe subscription status first (source of truth)
    const subscriptionData = await stripeService.getSubscriptionStatus();
    const hasActiveSubscription = ["active", "trialing"].includes(
      subscriptionData.status
    );

    if (hasActiveSubscription) {
      // Sync to profile table if needed
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium")
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

    // 2. Fall back to profile table (handles legacy / webhook-synced state)
    const { data, error } = await supabase
      .from("profiles")
      .select("is_premium, subscription_end")
      .eq("id", userId)
      .single();

    if (error) throw error;
    if (!data) return false;

    // Check subscription hasn't expired
    if (data.subscription_end && new Date(data.subscription_end) > new Date()) {
      return true;
    }

    // Auto-downgrade if premium but subscription expired
    if (
      data.is_premium &&
      (!data.subscription_end || new Date(data.subscription_end) <= new Date())
    ) {
      await supabase
        .from("profiles")
        .update({
          is_premium: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      return false;
    }

    return data.is_premium ?? false;
  } catch (error) {
    console.error("Error checking premium status:", error);
    // On network/auth failure, fall back to profile table only
    try {
      const { data } = await supabase
        .from("profiles")
        .select("is_premium, subscription_end")
        .eq("id", userId)
        .single();

      if (
        data?.subscription_end &&
        new Date(data.subscription_end) > new Date()
      ) {
        return true;
      }
      return data?.is_premium ?? false;
    } catch {
      return false;
    }
  }
};

export const initiatePremiumCheckout = async (
  priceId: string
): Promise<void> => {
  try {
    const result = await stripeService.createCheckoutSession(priceId);

    if (result.url) {
      // Direct redirect is the smoothest UX
      window.location.href = result.url;
    } else {
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
