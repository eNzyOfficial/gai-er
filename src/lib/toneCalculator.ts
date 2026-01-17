import type { Alphabet } from "@/types";

/* =======================
   Types
======================= */

export interface ToneAnalysis {
  syllable: string;
  initialConsonant: Alphabet | null;
  vowel: Alphabet | null;
  finalConsonant: Alphabet | null;
  toneMark: Alphabet | null;
  consonantClass: "mid" | "high" | "low" | null;
  vowelLength: "short" | "long" | null;
  isLive: boolean | null;
  calculatedTone: string;
  explanation: string[];
  ruleTrace: ToneRuleStep[];
  confidence: "high" | "medium" | "low";
}

export interface ToneRuleStep {
  id: string;
  label: string;
  value?: string;
}

/* =======================
   Public API
======================= */

export function analyzeTone(
  text: string,
  alphabetCards: Alphabet[]
): ToneAnalysis[] {
  const syllables = segmentSyllables(text);

  return syllables.map((s) => {
    const result = calculateSyllableTone(s, alphabetCards);

    if (syllables.length > 1 && result.confidence === "high") {
      result.confidence = "medium";
    }

    return result;
  });
}

/* =======================
   Core Logic
======================= */

const DEAD_FINAL_IPA = ["p", "t", "k"];
const LIVE_FINAL_IPA = ["m", "n", "ng", "y", "w", "l", "r"];
const THAI_CLUSTERS = [
  ["กร", "mid"],
  ["ตร", "mid"],
  ["ศร", "high"],
  ["ซร", "low"],
];

function getClusterClass(
  c1: Alphabet,
  c2: Alphabet
): "mid" | "high" | "low" | null {
  const cluster = THAI_CLUSTERS.find(
    ([pair]) => pair === c1.character + c2.character
  );

  return cluster ? (cluster[1] as "mid" | "high" | "low") : null;
}

function stripSilentFinals(chars: string[]): string[] {
  const result = [...chars];

  for (let i = result.length - 1; i >= 0; i--) {
    if (result[i] === "์" && i > 0) {
      result.splice(i - 1, 2);
    }
  }

  return result;
}

function extractVowelSigns(v: Alphabet): string[] {
  // Remove carrier อ and placeholder ◌
  return Array.from(v.character).filter((ch) => ch !== "อ" && ch !== "◌");
}

function segmentSyllables(text: string): string[] {
  const chars = Array.from(text);
  const syllables: string[] = [];

  let buffer = "";
  let seenVowel = false;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const next = chars[i + 1];

    // Split BEFORE a new syllable onset:
    // consonant + upcoming vowel
    if (
      buffer &&
      seenVowel &&
      isThaiConsonant(ch) &&
      next &&
      (isThaiVowelChar(next) || isLeadingVowel(next))
    ) {
      syllables.push(buffer);
      buffer = "";
      seenVowel = false;
    }

    buffer += ch;

    if (isThaiVowelChar(ch) || isLeadingVowel(ch)) {
      seenVowel = true;
    }
  }

  if (buffer) syllables.push(buffer);

  return syllables;
}

function isThaiConsonant(ch: string): boolean {
  return /[ก-ฮ]/.test(ch);
}

function isLeadingVowel(ch: string): boolean {
  return ["เ", "แ", "โ", "ใ", "ไ"].includes(ch);
}

function isThaiVowelChar(ch: string): boolean {
  return /[ะาิีึืุู็]/.test(ch);
}

function calculateSyllableTone(
  syllable: string,
  alphabetCards: Alphabet[]
): ToneAnalysis {
  const chars = Array.from(syllable);

  let initialConsonant: Alphabet | null = null;
  let vowel: Alphabet | null = null;
  let finalConsonant: Alphabet | null = null;
  let toneMark: Alphabet | null = null;

  const explanation: string[] = [];

  /* =======================
       Tone mark detection
    ======================= */

  const toneMarkChars = ["่", "้", "๊", "๋"];

  let toneMarkCount = 0;

  for (const char of chars) {
    if (toneMarkChars.includes(char)) {
      toneMarkCount++;

      if (!toneMark) {
        toneMark =
          alphabetCards.find((c) => c.character === char) ??
          ({
            character: char,
            name: char,
            type: "mark",
            class: "mid",
            ipa: "",
            example: "",
            example_english: "",
            audio: "",
          } as Alphabet);
      }
    }
  }

  if (toneMark) {
    explanation.push(`Tone mark "${toneMark.character}" is present.`);

    if (toneMarkCount > 1) {
      explanation.push(
        "Only the first tone mark is used for tone calculation."
      );
    }
  }

  /* =======================
       Initial consonant
    ======================= */

  const leadingVowels = ["เ", "แ", "โ", "ใ", "ไ"];
  let index = 0;

  if (leadingVowels.includes(chars[0])) index = 1;

  const c1 =
    alphabetCards.find(
      (c) => c.character === chars[index] && c.type === "consonant"
    ) ?? null;

  const c2 =
    alphabetCards.find(
      (c) => c.character === chars[index + 1] && c.type === "consonant"
    ) ?? null;

  if (!c1 && !leadingVowels.includes(chars[0])) {
    explanation.push(
      "Unable to determine initial consonant. This syllable may require dictionary knowledge."
    );
  }

  // ห นำ
  if (c1?.character === "ห" && c2 && c2.class === "low") {
    initialConsonant = { ...c2, class: "high" };
    explanation.push(`Ho nam (ห นำ): "${c2.character}" behaves as HIGH class.`);
  }

  // อ นำ
  else if (c1?.character === "อ" && c2) {
    initialConsonant = c2;
    explanation.push(`O nam (อ นำ): "${c2.character}" determines class.`);
  }

  // Consonant cluster (กร กล ขร ฯลฯ)
  else if (c1 && c2) {
    const clusterClass = getClusterClass(c1, c2);

    if (clusterClass) {
      initialConsonant = { ...c1, class: clusterClass };
      explanation.push(
        `Consonant cluster "${c1.character}${c2.character}" detected → behaves as ${clusterClass} class (Sanskrit-derived cluster overrides class).`
      );
    } else {
      initialConsonant = c1;
    }
  }

  // Normal
  else {
    initialConsonant = c1;
  }

  if (initialConsonant) {
    explanation.push(
      `Initial consonant "${initialConsonant.character}" is ${initialConsonant.class} class.`
    );
  }

  const cleanedChars = stripSilentFinals(chars);
  const cleanedSyllable = cleanedChars.join("");

  if (chars.join("") !== cleanedChars.join("")) {
    explanation.push("Silent consonant (การันต์) removed from pronunciation.");
  }

  /* =======================
       Vowel detection
    ======================= */

  const vowels = alphabetCards.filter((c) => c.type === "vowel");

  let vowelIndex = -1;

  const hasRoHan = cleanedSyllable.includes("รร");

  if (hasRoHan) {
    const rrIndex = cleanedSyllable.indexOf("รร");

    vowel = {
      character: "◌ะ",
      name: "ro han vowel",
      type: "vowel",
      is_short: true,
    } as Alphabet;

    vowelIndex = rrIndex + 1;

    explanation.push('รร (ro han) → short "a" vowel.');
  } else if (!hasRoHan) {
    for (const v of vowels) {
      const signs = extractVowelSigns(v);

      for (const sign of signs) {
        const idx = cleanedSyllable.indexOf(sign);
        if (idx !== -1) {
          vowel = v;
          vowelIndex = idx;
          explanation.push(`Vowel "${v.character}" detected.`);
          break;
        }
      }

      if (vowel) break;
    }
  }

  /* =======================
       Final consonant
    ======================= */

  const finalConsonants: Alphabet[] = [];

  if (vowelIndex === -1) {
    vowelIndex = leadingVowels.includes(chars[0]) ? 1 : 0;
  }

  for (let i = cleanedChars.length - 1; i > vowelIndex; i--) {
    const ch = cleanedChars[i];
    const found = alphabetCards.find(
      (c) => c.character === ch && c.type === "consonant"
    );
    if (found) {
      finalConsonants.push(found);
    }
  }

  if (finalConsonants.length > 0) {
    finalConsonant = finalConsonants[0];

    if (finalConsonants.length > 1) {
      explanation.push(
        "Final consonant cluster collapsed for phonetic tone calculation."
      );
    }
  }

  /* =======================
       Implicit vowel handling
    ======================= */

  const effectiveVowel: Alphabet = vowel
    ? { ...vowel }
    : ({
        character: "◌ะ",
        name: "implicit short vowel",
        type: "vowel",
        is_short: true,
      } as Alphabet);

  const hasMaiTaikhu = chars.includes("็");

  if (hasMaiTaikhu) {
    effectiveVowel.is_short = true;
    explanation.push("Mai taikhu (็) forces short vowel.");
  }

  if (!vowel) {
    explanation.push("No written vowel → implicit short vowel.");
  }

  /* =======================
       Live / Dead determination
    ======================= */

  const isLive = determineLiveDead(effectiveVowel, finalConsonant);

  explanation.push(
    isLive
      ? "Syllable is Live (long vowel or sonorant final)."
      : "Syllable is Dead (short vowel or stop final)."
  );

  if (
    finalConsonant?.final_consonant &&
    isLive &&
    LIVE_FINAL_IPA.some((l) => finalConsonant.final_consonant.includes(l))
  ) {
    explanation.push("Sonorant final consonant keeps the syllable live.");
  }

  /* =======================
       Tone calculation
    ======================= */

  let calculatedTone = "Unknown";
  const consonantClass = initialConsonant?.class ?? null;

  if (consonantClass === "mid") {
    if (!toneMark) {
      calculatedTone = isLive ? "Mid" : "Low";
      explanation.push(
        `Mid class + No tone mark + ${
          isLive ? "Live" : "Dead"
        } = ${calculatedTone} tone.`
      );
    } else {
      const map: Record<string, string> = {
        "่": "Low",
        "้": "Falling",
        "๊": "High",
        "๋": "Rising",
      };
      calculatedTone = map[toneMark.character] ?? "Unknown";
      explanation.push(
        `Mid class + Tone mark "${toneMark.character}" = ${calculatedTone} tone.`
      );
    }
  } else if (consonantClass === "high") {
    if (!toneMark) {
      calculatedTone = isLive ? "Rising" : "Low";
      explanation.push(
        `High class + No tone mark + ${
          isLive ? "Live" : "Dead"
        } = ${calculatedTone} tone.`
      );
    } else {
      const map: Record<string, string> = {
        "่": "Low",
        "้": "Falling",
      };
      calculatedTone = map[toneMark.character] ?? "Unknown";
      explanation.push(
        `High class + Tone mark "${toneMark.character}" = ${calculatedTone} tone.`
      );
    }
  } else if (consonantClass === "low") {
    if (!toneMark) {
      if (isLive) {
        calculatedTone = "Mid";
        explanation.push("Low class + Live + No tone mark = Mid tone.");
      } else {
        calculatedTone = effectiveVowel.is_short ? "High" : "Falling";
        explanation.push(
          `Low class + Dead + ${
            effectiveVowel.is_short ? "Short" : "Long"
          } vowel = ${calculatedTone} tone.`
        );
      }
    } else {
      const map: Record<string, string> = {
        "่": "Falling",
        "้": "High",
      };
      calculatedTone = map[toneMark.character] ?? "Unknown";
      explanation.push(
        `Low class + Tone mark "${toneMark.character}" = ${calculatedTone} tone.`
      );
    }
  }

  if (initialConsonant?.class === "low" && toneMark) {
    explanation.push("Low-class consonants use a different tone-mark table.");
  }

  if (finalConsonant && !isLive) {
    explanation.push("Stop final consonant forces dead syllable.");
  }

  const ruleTrace: ToneRuleStep[] = [];

  ruleTrace.push({
    id: "initial-class",
    label: "Initial consonant class",
    value: initialConsonant?.class ?? "unknown",
  });

  ruleTrace.push({
    id: "tone-mark",
    label: "Tone mark",
    value: toneMark?.character ?? "none",
  });

  ruleTrace.push({
    id: "live-dead",
    label: "Syllable type",
    value: isLive ? "live" : "dead",
  });

  ruleTrace.push({
    id: "vowel-length",
    label: "Vowel length",
    value: effectiveVowel.is_short ? "short" : "long",
  });

  let confidence: "high" | "medium" | "low" = "high";

  /* ---------- Confidence heuristics ---------- */

  // Multiple tone marks (malformed input)
  if (toneMarkCount > 1) {
    confidence = "medium";
  }

  if (
    chars.filter(isThaiConsonant).length >= 2 &&
    !chars.some(isThaiVowelChar)
  ) {
    confidence = "medium";
    explanation.push(
      "Multiple consonants without explicit vowels detected; syllable boundaries may be lexical."
    );
  }

  // Missing initial consonant
  if (!initialConsonant) {
    confidence = "low";
  }

  // Ambiguous vowel detection
  if (!vowel && !chars.includes("็")) {
    confidence = confidence === "low" ? "low" : "medium";
  }

  // Sanskrit-derived cluster override
  if (initialConsonant && c1 && c2 && getClusterClass(c1, c2)) {
    confidence = confidence === "low" ? "low" : "medium";
  }

  // Unknown final consonant phonology
  if (finalConsonant && !finalConsonant.final_consonant) {
    confidence = confidence === "low" ? "low" : "medium";
  }

  /* =======================
       Return result
    ======================= */

  return {
    syllable,
    initialConsonant,
    vowel,
    finalConsonant,
    toneMark,
    consonantClass,
    vowelLength: effectiveVowel.is_short ? "short" : "long",
    isLive,
    calculatedTone,
    confidence,
    explanation,
    ruleTrace,
  };
}

/* =======================
   Phonology helpers
======================= */

function determineLiveDead(
  vowel: Alphabet,
  finalConsonant: Alphabet | null
): boolean {
  if (finalConsonant?.final_consonant) {
    const sound = finalConsonant.final_consonant;

    if (DEAD_FINAL_IPA.some((d) => sound.includes(d))) {
      return false;
    }

    if (LIVE_FINAL_IPA.some((l) => sound.includes(l))) {
      return true;
    }
  }

  return !vowel.is_short;
}
