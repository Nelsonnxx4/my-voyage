import { ref, computed } from "vue";
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

// ─── Module-level shared state so all callers share the same reactive refs ───
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
const planLoaded = ref(false);

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

const getCurrentUserId = async (userId?: string): Promise<string> => {
  if (userId) return userId;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No user authenticated");
  return user.id;
};

const loadUserPlan = async (userId?: string) => {
  // Skip if already loaded and not forcing a refresh
  if (planLoaded.value && !userId) return;

  loading.value = true;
  error.value = null;

  try {
    const currentUserId = await getCurrentUserId(userId);
    const isUserPremium = await checkPremiumStatus(currentUserId);

    if (isUserPremium) {
      setPremiumPlan();
    } else {
      setFreePlan();
    }

    planLoaded.value = true;
  } catch (err) {
    error.value = err as Error;
    console.error("Error loading user plan:", err);
    setFreePlan();
  } finally {
    loading.value = false;
  }
};

const checkStatus = async (userId?: string) => {
  // Force a fresh check (ignore planLoaded cache)
  planLoaded.value = false;
  await loadUserPlan(userId);
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

// ─── Exported composable ─────────────────────────────────────────────────────
export const usePremium = (userId?: string) => {
  // Reactive computed refs — NOT unwrapped .value snapshots
  const limits = computed(() => userPlan.value);
  const isPremium = computed(() => userPlan.value.isPremium);

  return {
    // Return computed refs so callers stay reactive
    isPremium,
    limits,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    checkStatus: () => checkStatus(userId),
    upgradeUser,
    manageBilling,
    loadUserPlan: () => loadUserPlan(userId),
    // Expose raw setters for post-payment optimistic updates
    setPremiumPlan,
    setFreePlan,
  };
};
