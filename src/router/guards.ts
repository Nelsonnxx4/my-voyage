import { createRouter, createWebHistory } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { usePremium } from "@/composables/usePremium";
import type { AppRouteRecordRaw } from "@/types/router";

export function setupRouter(routes: AppRouteRecordRaw[]) {
  const router = createRouter({
    history: createWebHistory(),
    routes,
  });

  let isCheckingAuth = false;

  router.beforeEach(async (to) => {
    // Prevent re-entrant auth checks
    if (isCheckingAuth) {
      return true;
    }

    const { checkAuth, user } = useAuth();

    // ── Routes with no meta (pricing, payment/success, about, callback) ──────
    // These must pass through freely for both guests AND logged-in users.
    if (!to.meta.requiresAuth) {
      // Only redirect logged-in users away from EXPLICITLY guestOnly pages
      // (home, login, signup, confirm). /pricing has NO meta so it never hits this.
      if (to.meta.guestOnly) {
        isCheckingAuth = true;
        const isAuthenticated = await checkAuth();
        isCheckingAuth = false;

        if (isAuthenticated) {
          return { path: "/voyages" };
        }
      }
      // All other public routes pass through — including /pricing and /payment/success
      return true;
    }

    // ── Auth-required routes ──────────────────────────────────────────────────
    isCheckingAuth = true;
    const isAuthenticated = await checkAuth();
    isCheckingAuth = false;

    if (!isAuthenticated) {
      return { path: "/login", query: { redirect: to.fullPath } };
    }

    // ── Premium-required routes ───────────────────────────────────────────────
    if (to.meta.requiresPremium && user.value) {
      try {
        const { checkStatus, isPremium } = usePremium(user.value.id);
        await checkStatus();

        if (!isPremium) {
          return { path: "/pricing", query: { redirect: to.fullPath } };
        }
      } catch (error) {
        console.error("Error checking premium status:", error);
      }
    }

    return true;
  });

  return router;
}
