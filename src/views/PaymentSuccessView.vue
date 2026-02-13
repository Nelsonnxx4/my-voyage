<template>
  <div
    class="min-h-screen bg-background100 flex items-center justify-center p-4"
  >
    <!-- Loading state while syncing -->
    <div v-if="isSyncing" class="flex flex-col items-center gap-4 text-center">
      <div
        class="animate-spin rounded-full h-10 w-10 border-b-2 border-accent100"
      ></div>
      <p class="text-textblack100 font-medium">Activating your plan…</p>
    </div>

    <!-- Success state -->
    <div
      v-else
      class="w-full max-w-md text-center"
      :class="isVisible ? 'animate-fade-in' : 'opacity-0'"
    >
      <div class="flex justify-center items-center gap-2 mb-8">
        <Logo />
        <h2 class="text-sm font-medium text-textblack100">Zende</h2>
      </div>

      <div class="mb-6 flex justify-center">
        <div class="relative">
          <div
            class="w-20 h-20 rounded-full bg-accent100/10 flex items-center justify-center animate-check-bounce"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 42L32 54L60 26"
                stroke="#006e63"
                stroke-width="6"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="animate-check-draw"
                :style="{ strokeDasharray: 100, strokeDashoffset: checkOffset }"
              />
            </svg>
          </div>
          <!-- Confetti dots -->
          <div
            class="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-accent50 animate-ping"
          ></div>
          <div
            class="absolute -bottom-1 -left-2 w-2 h-2 rounded-full bg-highlight animate-ping"
            style="animation-delay: 0.3s"
          ></div>
        </div>
      </div>

      <h1 class="text-2xl font-semibold text-textblack200 mb-2">
        You're all set! 🎉
      </h1>
      <p class="text-textblack100 mb-8 leading-relaxed">
        Your premium plan is now active. Enjoy unlimited voyages,<br
          class="hidden sm:block"
        />
        multi-image uploads, and PDF exports.
      </p>

      <!-- Premium perks summary -->
      <div
        class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-8 text-left space-y-3"
      >
        <p
          class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3"
        >
          What you unlocked
        </p>
        <div
          v-for="perk in perks"
          :key="perk.label"
          class="flex items-center gap-3"
        >
          <div
            class="w-7 h-7 rounded-full bg-accent100/10 flex items-center justify-center flex-shrink-0"
          >
            <span class="text-sm">{{ perk.icon }}</span>
          </div>
          <span class="text-sm text-textblack100">{{ perk.label }}</span>
        </div>
      </div>

      <button
        @click="goToVoyages"
        class="w-full py-3 px-6 bg-accent100 text-white rounded-xl hover:bg-accent200 transition-colors font-medium shadow-sm"
      >
        Start Creating
      </button>

      <p class="mt-4 text-xs text-gray-400">
        Manage billing anytime in your account settings
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import Logo from "@/assets/icons/Logo.vue";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePremium } from "@/composables/usePremium";
import { showToast } from "@/utils/showToast";

const router = useRouter();
const { checkStatus, setPremiumPlan } = usePremium();

const isVisible = ref(false);
const isSyncing = ref(true);
const checkOffset = ref(100);

const perks = [
  { icon: "🖼️", label: "Up to 8 images per voyage" },
  { icon: "📍", label: "Up to 8 pinned locations" },
  { icon: "📄", label: "Export voyages as PDF" },
  { icon: "✈️", label: "Up to 50 voyage entries" },
];

const goToVoyages = () => {
  router.push("/voyages");
};

onMounted(async () => {
  try {
    // Optimistically set premium so the app feels instant
    setPremiumPlan();

    // Then confirm from server (webhook may already have fired)
    await checkStatus();
  } catch (err) {
    console.error("Error syncing premium status:", err);
    // Keep optimistic update — webhook will sync eventually
    setPremiumPlan();
    showToast("Premium activated! Full sync may take a moment.", "info");
  } finally {
    isSyncing.value = false;

    // Trigger animations
    requestAnimationFrame(() => {
      isVisible.value = true;
      setTimeout(() => {
        checkOffset.value = 0;
      }, 600);
    });
  }
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

.animate-check-bounce {
  animation: checkBounce 0.5s ease-out 0.3s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes checkBounce {
  0% {
    transform: scale(0.6);
  }
  60% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}

.animate-check-draw {
  transition: stroke-dashoffset 0.8s ease-out;
}
</style>
