import { createRouter, createWebHistory } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { usePremium } from "@/composables/usePremium";
import type { AppRouteRecordRaw } from "@/types/router";

export function setupRouter(routes: AppRouteRecordRaw[]) {
  const router = createRouter({
    history: createWebHistory(),
    routes,
  });

  router.beforeEach(async (to) => {
    const { checkAuth, user } = useAuth();
    const isAuthenticated = await checkAuth();

    if (to.meta.requiresAuth && !isAuthenticated) {
      return { path: "/login", query: { redirect: to.fullPath } };
    }

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

    if (to.meta.guestOnly && isAuthenticated) {
      return { path: "/voyages" };
    }

    if ((to.path === "/login" || to.path === "/signup") && isAuthenticated) {
      return { path: "/voyages" };
    }

    return true;
  });

  return router;
}
