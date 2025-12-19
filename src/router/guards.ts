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
      const { checkStatus } = usePremium(user.value.id);
      const isStillPremium: boolean = await checkStatus();
      if (isStillPremium === false) return "/pricing";
    }

    if ((to.path === "/login" || to.path === "/signup") && isAuthenticated) {
      return "/voyages";
    }
  });

  return router;
}
