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
    path: "/alphabet/study",
    name: "alphabet.study",
    component: () => import("@/pages/AlphabetStudy.vue"),
  },
  {
    path: "/alphabet/writing",
    name: "alphabet.writing",
    component: () => import("@/pages/WritingPractice.vue"),
  },
  {
    path: "/tone-calculator",
    name: "tone.calculator",
    component: () => import("@/pages/ToneCalculator.vue"),
  },
  {
    path: "/alphabet/study/:group",
    name: "alphabet.study.group",
    component: () => import("@/pages/FlashCards.vue"),
    props: (route: RouteLocation) => ({
      mode: "alphabet",
      group: route.params.group,
    }),
  },
  {
    path: "/words",
    name: "words",
    component: () => import("@/pages/WordList.vue"),
  },
  {
    path: "/words/study",
    name: "words.study",
    component: () => import("@/pages/WordStudy.vue"),
  },
  {
    path: "/words/study/new",
    name: "words.study.new",
    component: () => import("@/pages/FlashCards.vue"),
    props: { mode: "new" },
  },
  {
    path: "/words/study/review",
    name: "words.study.review",
    component: () => import("@/pages/FlashCards.vue"),
    props: { mode: "review" },
  },
  {
    path: "/words/study/collection/:collectionId",
    name: "words.study.collection",
    component: () => import("@/pages/FlashCards.vue"),
    props: (route: RouteLocation) => ({
      mode: "collection",
      collectionId: route.params.collectionId,
    }),
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("@/pages/Profile.vue"),
  },
  {
    path: "/profile/settings",
    name: "profile.settings",
    component: () => import("@/pages/Profile.vue"),
  },
  {
    path: "/awards",
    name: "awards",
    component: () => import("@/pages/Awards.vue"),
  },
  {
    path: "/streak",
    name: "streak",
    component: () => import("@/pages/Streak.vue"),
  },
  {
    path: "/alphabet",
    name: "alphabet",
    component: () => import("@/pages/Alphabet.vue"),
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
