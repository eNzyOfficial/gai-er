import { ref } from "vue";
import { registerSW } from "virtual:pwa-register";
import { CHANGELOG } from "@/changelog";

const needRefresh = ref(false);
const showChangelog = ref(false);
const waitingVersion = ref<string | null>(null);
const ignoredUntilReload = ref(false);

const LAST_SEEN_KEY = "pwa:last-seen-version";
const AUTO_UPDATE_DELAY = 2 * 60 * 1000;
const UPDATE_CHECK_INTERVAL = 30 * 60 * 1000;

let autoUpdateTimer: number | undefined;

const updateSW = registerSW({
  immediate: true,

  async onNeedRefresh() {
    if (ignoredUntilReload.value) return;

    needRefresh.value = true;

    const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
    if (lastSeen !== __APP_VERSION__) {
      showChangelog.value = true;
    }

    autoUpdateTimer = window.setTimeout(() => {
      updateSW();
    }, AUTO_UPDATE_DELAY);

    try {
      const reg = await navigator.serviceWorker.getRegistration();
      waitingVersion.value =
        (reg?.waiting as any)?.scriptURL?.split("v=")[1] ?? "new";
    } catch {
      waitingVersion.value = "new";
    }
  },
});

/* iOS + general reliability fixes */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });

  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible") {
      const reg = await navigator.serviceWorker.getRegistration();
      await reg?.update();
    }
  });

  setInterval(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    await reg?.update();
  }, UPDATE_CHECK_INTERVAL);
}

function dismissForNow() {
  ignoredUntilReload.value = true;
  needRefresh.value = false;

  if (autoUpdateTimer) {
    clearTimeout(autoUpdateTimer);
  }
}

function markSeen() {
  localStorage.setItem(LAST_SEEN_KEY, __APP_VERSION__);
}

export function usePwa() {
  return {
    needRefresh,
    updateSW,
    currentVersion: __APP_VERSION__,
    waitingVersion,
    dismissForNow,
    showChangelog,
    markSeen,
    changelog: CHANGELOG,
  };
}
