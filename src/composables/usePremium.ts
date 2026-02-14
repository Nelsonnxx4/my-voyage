import { ref } from "vue";
import { supabase } from "@/config/supabase";
import {
  checkPremiumStatus,
  initiatePremiumCheckout,
  manageSubscription,
} from "@/services/premium";

export interface PlanLimits {
  maxImagesPerEntry: number;
  maxVoyageEntries: number;
  maxPinnedLocations: number;
  canExportPdf: boolean;
  canShareSocial: boolean;
  isPremium: boolean;
}

export interface PremiumFeatures {
  isPremium: boolean;
  loading: boolean;
  error: Error | null;
  limits: PlanLimits;
  checkStatus: () => Promise<void>;
  upgradeUser: (priceId: string) => Promise<void>;
  loadUserPlan: () => Promise<void>;
  manageBilling: () => Promise<void>;
  setPremiumPlan: () => void;
}

export const usePremium = (userId?: string): PremiumFeatures => {
  const userPlan = ref<PlanLimits>({
    maxImagesPerEntry: 1,
    maxVoyageEntries: 10,
    maxPinnedLocations: 2,
    canExportPdf: false,
    canShareSocial: true,
    isPremium: false,
  });

  const loading = ref(false);
  const error = ref<Error | null>(null);

  const getCurrentUserId = async (): Promise<string> => {
    if (userId) return userId;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("No user authenticated");
    }
    return user.id;
  };

  const setPremiumPlan = () => {
    userPlan.value = {
      maxImagesPerEntry: 8,
      maxVoyageEntries: 50,
      maxPinnedLocations: 8,
      canExportPdf: true,
      canShareSocial: true,
      isPremium: true,
    };
  };

  const setFreePlan = () => {
    userPlan.value = {
      maxImagesPerEntry: 1,
      maxVoyageEntries: 10,
      maxPinnedLocations: 2,
      canExportPdf: false,
      canShareSocial: true,
      isPremium: false,
    };
  };

  const loadUserPlan = async () => {
    loading.value = true;
    error.value = null;

    try {
      const currentUserId = await getCurrentUserId();
      const isUserPremium = await checkPremiumStatus(currentUserId);

      if (isUserPremium) {
        setPremiumPlan();
      } else {
        setFreePlan();
      }
    } catch (err) {
      error.value = err as Error;
      console.error("Error loading user plan:", err);
      setFreePlan();
    } finally {
      loading.value = false;
    }
  };

  const checkStatus = async () => {
    await loadUserPlan();
  };

  const upgradeUser = async (priceId: string) => {
    loading.value = true;
    error.value = null;

    try {
      await initiatePremiumCheckout(priceId);
    } catch (err) {
      error.value = err as Error;
      console.error("Error initiating premium checkout", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const manageBilling = async () => {
    loading.value = true;
    error.value = null;

    try {
      await manageSubscription();
    } catch (err) {
      error.value = err as Error;
      console.error("Error managing subscription:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Return plain getters so `limits` satisfies `PlanLimits` (not ComputedRef<PlanLimits>).
  // Callers use: limits.maxVoyageEntries, limits.canExportPdf directly.
  return {
    get isPremium() {
      return userPlan.value.isPremium;
    },
    get loading() {
      return loading.value;
    },
    get error() {
      return error.value;
    },
    get limits() {
      return userPlan.value;
    },
    checkStatus,
    upgradeUser,
    manageBilling,
    loadUserPlan,
  };
};
