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
      return {
        path: "/login",
        query: { redirect: to.fullPath },
      };
    }

    if (to.meta.requiresPremium && user.value) {
      try {
        const { checkStatus } = usePremium(user.value.id);

        await checkStatus();

        const { isPremium } = usePremium(user.value.id);

        if (!isPremium) {
          return {
            path: "/pricing",
            query: { redirect: to.fullPath },
          };
        }
      } catch (error) {
        console.error("Error checking premium status:", error);
      }
    }

    if ((to.path === "/login" || to.path === "/signup") && isAuthenticated) {
      return "/voyages";
    }
  });

  return router;
}
