import type { AppRouteRecordRaw } from "@/types/router";
import { setupRouter } from "@/router/guards";

import HomeView from "@/views/HomeView.vue";

const routes: AppRouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    meta: { guestOnly: true },
  },
  {
    path: "/about",
    name: "aout",
    component: () => import("@/views/AboutView.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/LoginView.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/signup",
    name: "signup",
    component: () => import("@/views/SignupView.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/auth/confirm",
    name: "confirm-email",
    component: () => import("@/views/ConfirmEmail.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/auth/callback",
    name: "AuthCallback",
    component: () => import("@/views/AuthCallBackView.vue"),
  },
  {
    path: "/voyages/create",
    name: "CreateVoyage",
    component: () => import("@/views/CreateVoyage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/voyages/favourites",
    name: "FavouritesVoyage",
    component: () => import("@/views/FavouriteVoyages.vue"),
    meta: { requiresAuth: true, requiresPremium: true },
  },
  {
    path: "/voyages",
    name: "Voyages",
    component: () => import("@/views/VoyagesView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/voyages/:id",
    name: "SingleVoyage",
    component: () => import("@/views/SingleVoyageView.vue"),
    meta: { requiresAuth: true },
    props: false,
  },
  {
    path: "/voyages/:id/edit",
    name: "EditVoyage",
    component: () => import("@/views/EditVoyageView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/issues",
    name: "Issues",
    component: () => import("@/views/IssuesView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/pricing",
    name: "pricing",
    component: () => import("@/views/PricingView.vue"),
  },
  {
    path: "/payment/success",
    name: "PaymentSuccess",
    component: () => import("@/views/PaymentSuccessView.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "notFound",
    component: () => import("@/views/NotFoundView.vue"),
  },
];

export const router = setupRouter(routes);
