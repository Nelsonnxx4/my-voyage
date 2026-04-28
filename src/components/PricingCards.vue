<template>
  <div
    class="flex flex-col md:flex-row md:flex-wrap justify-center items-center gap-8"
  >
    <div
      v-for="plan in allPlans"
      :key="plan.id"
      class="w-full sm:w-[80%] md:w-[45%] lg:w-[40%] xl:w-[25%] md:min-h-[560px] relative bg-white border-2 rounded-2xl shadow-sm divide-y divide-gray-200 transition-all duration-300 hover:shadow-lg"
      :class="getPlanBorderClass(plan)"
    >
      <!-- Current Plan Badge -->
      <div
        v-if="isCurrentPlan(plan)"
        class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-accent50 text-white px-4 py-1 text-xs font-bold rounded-full uppercase tracking-wide shadow-md"
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
            ${{
              Array.isArray(plan.prices) && plan.prices[0]
                ? plan.prices[0].amount
                : "0"
            }}
          </span>
          <span class="text-base font-medium text-gray-500">
            /{{
              Array.isArray(plan.prices) && plan.prices[0]?.interval
                ? plan.prices[0].interval
                : "forever"
            }}
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
          <span
            v-if="isLoadingPlan(plan)"
            class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"
          ></span>
          {{ getButtonText(plan) }}
        </button>

        <!-- "You're on this plan" for free users on Free plan -->
        <div
          v-else
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { usePremium } from "@/composables/usePremium";
import { fetchSubscriptionPlans } from "@/services/fetchSubscriptionPlans";
import type { Plan } from "@/types/plans";

const router = useRouter();
const premium = usePremium();
const { user } = useAuth();

const stripePlans = ref<Plan[]>([]);
const loadingPlans = ref(true);
const errorPlans = ref<string | null>(null);
const loadingPlan = ref<string | null>(null);



const isPremiumUser = computed(() => premium.isPremium);

const allPlans = computed<Plan[]>(() => [...stripePlans.value]);

const loadPlans = async () => {
  try {
    loadingPlans.value = true;
    errorPlans.value = null;
    const products = await fetchSubscriptionPlans();
    stripePlans.value = products;

    if (user.value) {
      await premium.checkStatus();
    }
  } catch (err: unknown) {
    errorPlans.value =
      err && typeof err === "object" && "message" in err
        ? (err as { message: string }).message
        : "Failed to load plans";
  } finally {
    loadingPlans.value = false;
  }
};

onMounted(async () => {
  await loadPlans();
  if (router.currentRoute.value.query.success) {
    // Re-check premium status after returning from Stripe
    await premium.checkStatus();
  }
});

const isCurrentPlan = (plan: Plan): boolean => {
  if (!user.value) return false;
  if (plan.id === "free" && !isPremiumUser.value) return true;
  if (plan.id !== "free" && isPremiumUser.value) return true;
  return false;
};

const shouldShowButton = (plan: Plan): boolean => {
  // Hide button on free plan if user is free (show "You're on this plan" text instead)
  if (plan.id === "free" && !isPremiumUser.value) return false;
  // Hide button if this is the current paid plan
  if (isCurrentPlan(plan)) return false;
  return true;
};

const isLoadingPlan = (plan: Plan): boolean => loadingPlan.value === plan.id;

const getButtonClass = (plan: Plan): string => {
  if (isLoadingPlan(plan))
    return "bg-gray-200 text-gray-600 cursor-wait border-gray-300";
  if (plan.featured)
    return "bg-accent100 text-white hover:bg-accent200 border-accent100 shadow-lg hover:shadow-xl";
  return "bg-white text-gray-800 hover:bg-gray-50 border-gray-300 hover:border-accent100";
};

const getButtonText = (plan: Plan): string => {
  if (isLoadingPlan(plan)) return "Processing...";
  if (plan.id === "free") return "Downgrade to Free";
  if (isPremiumUser.value) return "Manage Subscription";
  return "Upgrade Now";
};

const getPlanBorderClass = (plan: Plan): string => {
  if (isCurrentPlan(plan)) return "border-accent50 ring-2 ring-accent50/30";
  if (plan.featured) return "border-accent100";
  return "border-gray-200";
};

const handlePlanSelection = async (plan: Plan) => {
  // Free plan downgrade
  if (plan.id === "free") {
    if (isPremiumUser.value) {
      const confirmed = confirm(
        "Are you sure you want to downgrade to the Free plan? You'll lose access to premium features at the end of your billing period."
      );
      if (confirmed) {
        await premium.manageBilling();
      }
    }
    return;
  }

  // Paid plan — must be logged in
  if (!user.value) {
    router.push("/login");
    return;
  }

  // Must have a valid price ID
  if (!Array.isArray(plan.prices) || !plan.prices[0]?.id) {
    alert("No price available for this plan.");
    return;
  }

  // Already premium — open billing portal to manage
  if (isPremiumUser.value) {
    await premium.manageBilling();
    return;
  }

  try {
    loadingPlan.value = plan.id;
    await premium.upgradeUser(plan.prices[0].id);
  } catch (error) {
    console.error("Subscription error:", error);
    alert("There was an error processing your subscription. Please try again.");
  } finally {
    loadingPlan.value = null;
  }
};
</script>
