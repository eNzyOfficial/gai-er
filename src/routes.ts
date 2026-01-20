import {
  createRouter,
  type RouteLocation,
  createWebHashHistory,
} from "vue-router";

const routes = [
  {
    path: "/",
    name: "overview",
    component: () => import("@/pages/Overview.vue"),
  },
  {
    path: "/alphabet/browser",
    name: "alphabet.browser",
    component: () => import("@/pages/AlphabetBrowser.vue"),
  },
  {
    path: "/alphabet/grouped",
    name: "alphabet.grouped",
    component: () => import("@/pages/AlphabetGrouped.vue"),
  },
  {
    path: "/alphabet/writing",
    name: "alphabet.writing",
    component: () => import("@/pages/FlashCards.vue"),
    props: (route: RouteLocation) => ({
      mode: "alphabet",
      group: route.query.group || "consonant",
      variant: "writing",
    }),
  },
  {
    path: "/tone-calculator",
    name: "tone.calculator",
    component: () => import("@/pages/ToneCalculator.vue"),
  },
  {
    path: "/words",
    name: "words",
    component: () => import("@/pages/WordList.vue"),
  },
  {
    path: "/flashcards/new",
    name: "words.study.new",
    component: () => import("@/pages/FlashCards.vue"),
    props: { mode: "new" },
  },
  {
    path: "/flashcards/review",
    name: "words.study.review",
    component: () => import("@/pages/FlashCards.vue"),
    props: (route: RouteLocation) => ({
      mode: "review",
      variantFilters: route.query.variants
        ? (route.query.variants as string).split(",")
        : undefined,
    }),
  },
  {
    path: "/flashcards/collection/:collectionId",
    name: "words.study.collection",
    component: () => import("@/pages/FlashCards.vue"),
    props: (route: RouteLocation) => ({
      mode: "collection",
      collectionId: route.params.collectionId,
    }),
  },
  {
    path: "/flashcards/alphabet/:group",
    name: "alphabet.study.group",
    component: () => import("@/pages/FlashCards.vue"),
    props: (route: RouteLocation) => ({
      mode: "alphabet",
      group: route.params.group,
    }),
  },
  {
    path: "/practice",
    name: "practice",
    component: () => import("@/pages/Practice.vue"),
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("@/pages/user/Profile.vue"),
  },
  {
    path: "/profile/settings",
    name: "profile.settings",
    component: () => import("@/pages/user/Profile.vue"),
  },
  {
    path: "/awards",
    name: "awards",
    component: () => import("@/pages/user/Awards.vue"),
  },
  {
    path: "/streak",
    name: "streak",
    component: () => import("@/pages/user/Streak.vue"),
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
