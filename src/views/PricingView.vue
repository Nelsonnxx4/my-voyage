<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1
          class="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl"
        >
          Choose Your Plan
        </h1>
        <p
          class="mt-5 max-w-xl mx-auto text-lg lg:text-xl leading-5 text-gray-500"
        >
          Select the plan that works best for your needs
        </p>
      </div>

      <!-- Success Message -->
      <div
        v-if="showSuccess"
        class="max-w-md mx-auto mb-8 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded"
        role="alert"
      >
        <p class="font-bold">🎉 Success!</p>
        <p>Your subscription is now active. Enjoy your premium features!</p>
      </div>

      <!-- Loading State -->
      <div v-if="loadingPlans" class="text-center py-10">
        <div
          class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent100"
        ></div>
        <p class="mt-4 text-gray-600">Loading plans...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorPlans" class="text-center text-red-500 py-10">
        <p class="text-lg font-semibold">{{ errorPlans }}</p>
        <button
          @click="loadPlans"
          class="mt-4 px-6 py-2 bg-accent100 text-white rounded-lg hover:bg-accent200"
        >
          Try Again
        </button>
      </div>

      <!-- Plans Grid -->
      <div
        v-else
        class="mt-16 space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8"
      >
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="relative bg-white border-2 rounded-2xl shadow-sm divide-y divide-gray-200 transition-all duration-300 hover:shadow-lg"
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
            <h3
              class="text-xs font-medium text-gray-900 tracking-wide uppercase"
            >
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

      <!-- FAQ Section -->
      <div class="w-full max-w-3xl mx-auto mt-24">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">
          Frequently Asked Questions
        </h2>
        <p class="text-gray-600 mb-8">
          Find answers to common questions about our travel journal plans and
          features.
        </p>

        <div class="space-y-6">
          <div
            v-for="(faq, index) in faqs"
            :key="index"
            class="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              {{ faq.question }}
            </h3>
            <p class="text-gray-600">
              {{ faq.answer }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
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

const faqs = ref([
  {
    question: "Can I switch plans later?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
  },
  {
    question: "What happens if I downgrade from Premium to Free?",
    answer:
      "You'll keep access to Premium features until the end of your current billing period. After that, your account will revert to Free plan limitations.",
  },
  {
    question: "Do you offer discounts for teams?",
    answer:
      "We offer special pricing for teams of 5 or more. Contact our sales team for custom pricing options.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express) and PayPal for your convenience.",
  },
  {
    question: "How can I cancel my subscription?",
    answer:
      "You can cancel anytime from your account settings. Your access will continue until the end of your current billing period, with no penalty or hidden fees.",
  },
  {
    question: "Is there a free trial for Premium?",
    answer:
      "New users get a 14-day free trial of Premium features when they sign up. No credit card required to start!",
  },
]);

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

<style scoped>
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
  background: linear-gradient(
    to right,
    #f6f7f8 0%,
    #edeef1 20%,
    #f6f7f8 40%,
    #f6f7f8 100%
  );
  background-size: 1000px 100%;
}
</style>
