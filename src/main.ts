import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { router } from "./routes";
import { createPinia } from "pinia";
import { useVocabularyStore } from "./stores/vocabulary";
import { useSrsStore } from "./stores/srs";
import alphabetJson from "@/assets/alphabet.json";
import { useAlphabetStore } from "./stores/alphabet";
import type { Alphabet } from "./types";

const pinia = createPinia();

const app = createApp(App);

app.use(pinia).use(router).mount("#app");

const vocab = useVocabularyStore();
const srs = useSrsStore();
const alphabet = useAlphabetStore();

vocab.load();
srs.load();
alphabet.loadFromJSON(alphabetJson as Alphabet[]);
