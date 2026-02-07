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
    if (isCheckingAuth) {
      return true;
    }

    const { checkAuth, user } = useAuth();

    if (!to.meta.requiresAuth) {
      if (to.meta.guestOnly) {
        isCheckingAuth = true;
        const isAuthenticated = await checkAuth();
        isCheckingAuth = false;

        if (isAuthenticated) {
          console.log("Authenticated user on guest-only page");
          return { path: "/voyages" };
        }
      }
      return true;
    }

    isCheckingAuth = true;
    const isAuthenticated = await checkAuth();
    isCheckingAuth = false;

    console.log(
      "🔐 Auth check for route:",
      to.path,
      "Authenticated:",
      isAuthenticated
    );

    if (!isAuthenticated) {
      console.log("❌ Not authenticated, redirecting to login");
      return { path: "/login", query: { redirect: to.fullPath } };
    }

    if (to.meta.requiresPremium && user.value) {
      try {
        const { checkStatus, isPremium } = usePremium(user.value.id);
        await checkStatus();

        if (!isPremium) {
          console.log("⚠️ Premium required, redirecting to pricing");
          return { path: "/pricing", query: { redirect: to.fullPath } };
        }
      } catch (error) {
        console.error("Error checking premium status:", error);
      }
    }

    if ((to.path === "/login" || to.path === "/signup") && isAuthenticated) {
      console.log("✅ Authenticated user on auth page, redirecting to voyages");
      return { path: "/voyages" };
    }

    console.log("✅ Navigation allowed to:", to.path);
    return true;
  });

  return router;
}
