<template>
  <!-- Plans Grid -->

  <div
    v-for="plan in plans"
    :key="plan.id"
    class="w-[80%] md:w-[60%] xl:w-[20%] md:min-h-[560px] relative bg-white border-2 rounded-2xl shadow-sm divide-y divide-gray-200 transition-all duration-300 hover:shadow-lg"
    :class="getPlanBorderClass(plan)"
  >
    <!-- Current Plan Badge -->
    <div
      v-if="isCurrentPlan(plan)"
      class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 text-xs font-bold rounded-full uppercase tracking-wide shadow-md"
    >
      Current Plan
    </div>

    <!-- Popular Badge -->
    <div
      v-else-if="plan.featured"
      class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-accent100 text-white px-4 py-1 text-xs font-bold rounded-full uppercase tracking-wide shadow-md"
    >
      Popular
    </div>

    <!-- Plan Content -->
    <div class="p-6">
      <h2 class="text-2xl font-bold text-gray-900">{{ plan.name }}</h2>
      <p class="mt-4 text-sm text-gray-500">{{ plan.description }}</p>

      <!-- Price -->
      <div class="mt-8">
        <span class="text-5xl font-extrabold text-gray-900">
          ${{ plan.prices[0].amount }}
        </span>
        <span class="text-base font-medium text-gray-500">
          /{{ plan.prices[0].interval || "one-time" }}
        </span>
      </div>

      <!-- Action Button -->
      <button
        v-if="shouldShowButton(plan)"
        @click="handlePlanSelection(plan)"
        :disabled="isLoadingPlan(plan) || isCurrentPlan(plan)"
        :class="getButtonClass(plan)"
        class="mt-8 block w-full py-3 px-6 border rounded-md text-center font-medium transition-all duration-200"
      >
        {{ getButtonText(plan) }}
      </button>

      <!-- No Button for Free Plan when user is Free -->
      <div
        v-else-if="plan.name === 'Free/Basic' && !isPremiumUser"
        class="mt-8 block w-full py-3 px-6 text-center text-normal text-accent100 italic"
      >
        You're on this plan
      </div>
    </div>

    <!-- Features -->
    <div class="pt-6 pb-8 px-6">
      <h3 class="text-xs font-medium text-gray-900 tracking-wide uppercase">
        What's included
      </h3>
      <ul class="mt-6 space-y-4">
        <li
          v-for="feature in plan.features"
          :key="feature"
          class="flex items-start"
        >
          <svg
            class="flex-shrink-0 h-5 w-5 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="ml-3 text-base text-gray-700">{{ feature }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { usePremium } from "@/composables/usePremium";
import { fetchSubscriptionPlans } from "@/services/fetchSubscriptionPlans";

import type { Plan } from "@/types/plans";

const router = useRouter();
const { upgradeUser, checkStatus } = usePremium();
const { user } = useAuth();

const plans = ref<Plan[]>([]);
const loadingPlans = ref(true);
const errorPlans = ref<string | null>(null);
const loadingPlan = ref<string | null>(null);
const showSuccess = ref(false);
const isPremiumUser = ref(false);

const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
// Load plans and check premium status
const loadPlans = async () => {
  try {
    loadingPlans.value = true;
    errorPlans.value = null;

    const products = await fetchSubscriptionPlans();
    plans.value = products;

    // Check if user is premium
    if (user.value) {
      await checkStatus();
      isPremiumUser.value = user.value.is_premium || false;
    }
  } catch (err: any) {
    errorPlans.value = err.message || "Failed to load plans";
    console.error("Error loading plans:", err);
  } finally {
    loadingPlans.value = false;
  }
};

onMounted(async () => {
  await loadPlans();

  if (router.currentRoute.value.query.success) {
    showSuccess.value = true;
    setTimeout(() => (showSuccess.value = false), 5000);
  }
});

const isCurrentPlan = (plan: Plan): boolean => {
  if (!user.value) return false;

  if (plan.name === "Free/Basic" && !isPremiumUser.value) {
    return true;
  }

  if (plan.name === "premium" && isPremiumUser.value) {
    return true;
  }

  return false;
};

const shouldShowButton = (plan: Plan): boolean => {
  if (plan.name === "Free/Basic" && !isPremiumUser.value) {
    return false;
  }

  return true;
};

// Check if plan is currently loading
const isLoadingPlan = (plan: Plan): boolean => {
  return loadingPlan.value === plan.id;
};

// Get button class based on plan state
const getButtonClass = (plan: Plan): string => {
  if (isCurrentPlan(plan)) {
    return "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300";
  }

  if (isLoadingPlan(plan)) {
    return "bg-gray-200 text-gray-600 cursor-wait border-gray-300";
  }

  if (plan.featured) {
    return "bg-accent100 text-white hover:bg-accent200 border-accent100 shadow-lg hover:shadow-xl";
  }

  return "bg-white text-gray-800 hover:bg-gray-50 border-gray-300 hover:border-accent100";
};

const getButtonText = (plan: Plan): string => {
  if (isCurrentPlan(plan)) {
    return "Current Plan";
  }

  if (isLoadingPlan(plan)) {
    return "Processing...";
  }

  if (plan.name === "Free/Basic") {
    if (isPremiumUser.value) {
      return "Downgrade to Free";
    }
    return "Continue with Free";
  }

  if (isPremiumUser.value && plan.name !== "Free/Basic") {
    return "Manage Subscription";
  }

  return "Upgrade Now";
};

// Get border class based on plan status
const getPlanBorderClass = (plan: Plan): string => {
  if (isCurrentPlan(plan)) {
    return "border-green-500 ring-2 ring-green-200";
  }

  if (plan.featured) {
    return "border-accent100";
  }

  return "border-gray-200";
};

const handlePlanSelection = async (plan: Plan) => {
  if (!plan.prices?.[0]?.id) {
    alert("No price available for this plan.");
    return;
  }

  if (plan.name === "Free/Basic") {
    if (isPremiumUser.value) {
      const confirmed = confirm(
        "Are you sure you want to downgrade to the Free plan? You'll lose access to premium features at the end of your billing period."
      );
      if (confirmed) {
        router.push("/voyages");
      }
    }
    return;
  }

  // Ensure user is authenticated
  if (!user.value) {
    router.push("/login");
    return;
  }

  try {
    loadingPlan.value = plan.id;

    if (!plan.prices[0].id) {
      throw new Error("Price ID not configured for this plan");
    }

    await upgradeUser(plan.prices[0].id);

    if (user.value) {
      user.value.is_premium = true;
      isPremiumUser.value = true;
    }

    showSuccess.value = true;
    setTimeout(() => {
      showSuccess.value = false;
    }, 5000);
  } catch (error) {
    console.error("Subscription error:", error);
    alert("There was an error processing your subscription. Please try again.");
  } finally {
    loadingPlan.value = null;
  }
};
</script>
