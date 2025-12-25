<template>
  <div class="bg-gray-50">
    <!-- <header
      :class="[
        'sticky top-0 z-50 backdrop-blur-md border-b py-2 transition-all duration-300',
        isScrolled
          ? 'bg-white/90 backdrop-blur-lg shadow-md'
          : 'bg-white/70 backdrop-blur-md shadow-sm',
      ]"
    >
      <router-link to="/" class="flex items-center justify-start">
        <Logo />
        <h4 class="text-gray-900 font-medium">Zende</h4>
      </router-link>
    </header> -->

    <Header />
    <div class="max-w-7xl mx-auto pt-6 px-4 mt-12 sm:px-4 lg:px-6">
      <div class="text-center mt-4 mb-12">
        <h1
          class="text-3xl font-semibold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl"
        >
          Choose Your Plan
        </h1>
        <p
          class="mt-2 max-w-xl mx-auto text-normal lg:text-xl leading-5 text-gray-500"
        >
          Select the plan that works best for your needs
        </p>
      </div>

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

      <div
        v-else
        class="mt-16 space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8"
      >
        <PricingCards />
      </div>

      <!-- FAQ Section -->
      <FAQs />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { usePremium } from "@/composables/usePremium";
import { fetchSubscriptionPlans } from "@/services/fetchSubscriptionPlans";
import FAQs from "@/components/FAQs.vue";
import PricingCards from "@/components/PricingCards.vue";

import type { Plan } from "@/types/plans";
// import Logo from "@/assets/icons/Logo.vue";

const router = useRouter();
const { checkStatus } = usePremium();
const { user } = useAuth();

const plans = ref<Plan[]>([]);
const loadingPlans = ref(true);
const errorPlans = ref<string | null>(null);
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
  } catch (err: unknown) {
    if (err && typeof err === "object" && "message" in err) {
      errorPlans.value =
        (err as { message: string }).message || "Failed to load plans";
    } else {
      errorPlans.value = "Failed to load plans";
    }
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
