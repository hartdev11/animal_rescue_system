import type { AnimalSpecies, EnergyLevel, TemperamentTrait } from "@/types";
import {
  getEnergyLevelLabel,
  getTemperamentTraitLabel,
  TEMPERAMENT_TRAITS,
} from "@/lib/constants";

export type MatchMode = "quiz" | "tags";

export interface MatchableAnimal {
  id: string;
  name: string;
  species: AnimalSpecies;
  speciesLabel: string;
  speciesIcon: string;
  breed?: string;
  estimatedAge: string;
  weight?: number;
  description: string;
  personality?: string;
  temperamentTraits: TemperamentTrait[];
  energyLevel?: EnergyLevel;
  suitableForCondo: boolean;
  suitableForKids: boolean;
  suitableForElderly: boolean;
  hasDisability: boolean;
  disabilityNotes?: string;
  vaccinationStatus: boolean;
  sterilizationStatus: boolean;
  coverImage: string | null;
  shelterName: string | null;
  shelterProvince: string | null;
}

export interface QuizAnswers {
  livingSpace?: string;
  activityLevel?: string;
  household?: string;
  experience?: string;
  temperament?: string;
  species?: string;
}

export interface MatchPreferences {
  mode: MatchMode;
  quizAnswers?: QuizAnswers;
  /** โหมดเลือกแท็ก — ต้องตรงกับข้อมูลที่คลินิกเลือกไว้เท่านั้น */
  selectedTraits?: TemperamentTrait[];
  selectedSpecies?: AnimalSpecies;
  shelterId?: string;
}

export interface MatchResult {
  animal: MatchableAnimal;
  matchedCriteria: number;
  totalCriteria: number;
  matchPercent: number;
  reasons: string[];
  dataIncomplete: boolean;
}

export const QUIZ_QUESTIONS = [
  {
    id: "species",
    question: "สนใจสัตว์ชนิดไหน?",
    emoji: "🐾",
    subtitle: "เลือกชนิดที่อยากเลี้ยง — ระบบจะแสดงเฉพาะชนิดนี้เท่านั้น",
    options: [
      { value: "DOG", label: "สุนัข", icon: "🐕" },
      { value: "CAT", label: "แมว", icon: "🐈" },
      { value: "RABBIT", label: "กระต่าย", icon: "🐰" },
      { value: "BIRD", label: "นก", icon: "🐦" },
      { value: "any", label: "เปิดรับทุกชนิด", icon: "✨" },
    ],
  },
  {
    id: "livingSpace",
    question: "คุณอาศัยอยู่ที่แบบไหน?",
    emoji: "🏠",
    subtitle: "จับคู่จากข้อมูล「เหมาะกับคอนโด」ที่คลินิกระบุเท่านั้น",
    options: [
      { value: "condo", label: "คอนโด / หอพัก", icon: "🏢" },
      { value: "townhouse", label: "ทาวน์เฮาส์ / บ้านแถว", icon: "🏘️" },
      { value: "house_yard", label: "บ้านมีสวนหรือลานกว้าง", icon: "🌳" },
    ],
  },
  {
    id: "activityLevel",
    question: "มีเวลาเล่นกับสัตว์แค่ไหน?",
    emoji: "⚡",
    subtitle: "เทียบกับระดับพลังงานที่คลินิกประเมินไว้",
    options: [
      { value: "low", label: "น้อย — อยากได้ตัวสงบๆ", icon: "😌" },
      { value: "medium", label: "ปานกลาง — พาเล่นได้บ้าง", icon: "🚶" },
      { value: "high", label: "เยอะ — พร้อมออกกำลังทุกวัน", icon: "🏃" },
    ],
  },
  {
    id: "household",
    question: "สมาชิกในบ้านเป็นแบบไหน?",
    emoji: "👨‍👩‍👧",
    subtitle: "เทียบกับข้อมูลความเหมาะสมที่คลินิกระบุ",
    options: [
      { value: "solo", label: "อยู่คนเดียว / คู่รัก", icon: "💑" },
      { value: "kids", label: "มีเด็กเล็กในบ้าน", icon: "👶" },
      { value: "elderly", label: "มีผู้สูงอายุในบ้าน", icon: "👴" },
    ],
  },
  {
    id: "experience",
    question: "ประสบการณ์เลี้ยงสัตว์?",
    emoji: "📚",
    subtitle: "มือใหม่จะเทียบสถานะวัคซีนที่คลินิกบันทึก",
    options: [
      { value: "beginner", label: "มือใหม่ — ยังไม่เคยเลี้ยง", icon: "🌱" },
      { value: "intermediate", label: "เคยเลี้ยงมาบ้าง", icon: "📖" },
      { value: "expert", label: "ชำนาญ — เลี้ยงมาหลายตัว", icon: "🏆" },
    ],
  },
  {
    id: "temperament",
    question: "ชอบนิสัยแบบไหน?",
    emoji: "💛",
    subtitle: "เทียบกับแท็กนิสัยที่คลินิกเลือกไว้ในข้อมูลสัตว์",
    options: [
      { value: "affectionate", label: "ขี้อ้อน ชอบติดคน", icon: "🤗" },
      { value: "active", label: "กระตือรือร้น ชอบเล่น", icon: "🎾" },
      { value: "independent", label: "เป็นอิสระ เงียบๆ", icon: "🧘" },
    ],
  },
] as const;

export const KAHOOT_OPTION_STYLES = [
  {
    bg: "bg-red-500",
    hover: "hover:bg-red-600",
    ring: "ring-red-300",
    shadow: "shadow-red-500/30",
  },
  {
    bg: "bg-blue-500",
    hover: "hover:bg-blue-600",
    ring: "ring-blue-300",
    shadow: "shadow-blue-500/30",
  },
  {
    bg: "bg-amber-400",
    hover: "hover:bg-amber-500",
    ring: "ring-amber-200",
    shadow: "shadow-amber-400/30",
    text: "text-gray-900",
  },
  {
    bg: "bg-emerald-500",
    hover: "hover:bg-emerald-600",
    ring: "ring-emerald-300",
    shadow: "shadow-emerald-500/30",
  },
  {
    bg: "bg-violet-500",
    hover: "hover:bg-violet-600",
    ring: "ring-violet-300",
    shadow: "shadow-violet-500/30",
  },
] as const;

interface CriterionCheck {
  id: string;
  applies: boolean;
  animalHasData: boolean;
  matches: boolean;
  reason: string;
  conflict: boolean;
}

function temperamentMatchesQuiz(
  traits: TemperamentTrait[],
  quizTemperament: string
): boolean {
  if (quizTemperament === "affectionate") {
    return traits.includes("affectionate");
  }
  if (quizTemperament === "active") {
    return traits.includes("active");
  }
  if (quizTemperament === "independent") {
    return traits.includes("calm") || traits.includes("independent");
  }
  return false;
}

function buildCriteriaFromQuiz(
  answers: QuizAnswers,
  animal: MatchableAnimal
): CriterionCheck[] {
  const checks: CriterionCheck[] = [];

  if (answers.livingSpace === "condo") {
    checks.push({
      id: "condo",
      applies: true,
      animalHasData: true,
      matches: animal.suitableForCondo,
      conflict: !animal.suitableForCondo,
      reason: animal.suitableForCondo
        ? "คลินิกระบุ: เหมาะกับคอนโด/พื้นที่จำกัด"
        : "คลินิกระบุ: ไม่เหมาะกับคอนโด/พื้นที่จำกัด",
    });
  }

  if (answers.household === "kids") {
    checks.push({
      id: "kids",
      applies: true,
      animalHasData: true,
      matches: animal.suitableForKids,
      conflict: !animal.suitableForKids,
      reason: animal.suitableForKids
        ? "คลินิกระบุ: อยู่กับเด็กได้"
        : "คลินิกระบุ: ไม่เหมาะกับบ้านที่มีเด็ก",
    });
  }

  if (answers.household === "elderly") {
    checks.push({
      id: "elderly",
      applies: true,
      animalHasData: true,
      matches: animal.suitableForElderly,
      conflict: !animal.suitableForElderly,
      reason: animal.suitableForElderly
        ? "คลินิกระบุ: เหมาะกับผู้สูงอายุ"
        : "คลินิกระบุ: ไม่เหมาะกับผู้สูงอายุ",
    });
  }

  if (answers.activityLevel) {
    const hasData = !!animal.energyLevel;
    const matches = animal.energyLevel === answers.activityLevel;
    checks.push({
      id: "energy",
      applies: true,
      animalHasData: hasData,
      matches: hasData && matches,
      conflict: hasData && !matches,
      reason: hasData
        ? `คลินิกประเมินพลังงาน: ${getEnergyLevelLabel(animal.energyLevel!)}`
        : "คลินิกยังไม่ระบุระดับพลังงาน",
    });
  }

  if (answers.temperament) {
    const hasData = animal.temperamentTraits.length > 0;
    const matches = temperamentMatchesQuiz(
      animal.temperamentTraits,
      answers.temperament
    );
    checks.push({
      id: "temperament",
      applies: true,
      animalHasData: hasData,
      matches: hasData && matches,
      conflict: hasData && !matches,
      reason: hasData
        ? `คลินิกระบุนิสัย: ${animal.temperamentTraits.map(getTemperamentTraitLabel).join(", ")}`
        : "คลินิกยังไม่ระบุแท็กนิสัย",
    });
  }

  if (answers.experience === "beginner") {
    checks.push({
      id: "vaccine",
      applies: true,
      animalHasData: true,
      matches: animal.vaccinationStatus,
      conflict: !animal.vaccinationStatus,
      reason: animal.vaccinationStatus
        ? "คลินิกระบุ: ฉีดวัคซีนแล้ว"
        : "คลินิกระบุ: ยังไม่ฉีดวัคซีน",
    });
  }

  return checks;
}

function buildCriteriaFromTags(
  traits: TemperamentTrait[],
  animal: MatchableAnimal
): CriterionCheck[] {
  return traits.map((trait) => ({
    id: trait,
    applies: true,
    animalHasData: animal.temperamentTraits.length > 0,
    matches: animal.temperamentTraits.includes(trait),
    conflict:
      animal.temperamentTraits.length > 0 &&
      !animal.temperamentTraits.includes(trait),
    reason: animal.temperamentTraits.includes(trait)
      ? `คลินิกระบุ: ${getTemperamentTraitLabel(trait)}`
      : `คลินิกไม่ได้ระบุ「${getTemperamentTraitLabel(trait)}」`,
  }));
}

function evaluateAnimal(
  animal: MatchableAnimal,
  checks: CriterionCheck[]
): MatchResult | null {
  const applicable = checks.filter((c) => c.applies);

  if (applicable.some((c) => c.conflict)) {
    return null;
  }

  const evaluable = applicable.filter((c) => c.animalHasData);
  const matched = evaluable.filter((c) => c.matches);
  const dataIncomplete = applicable.some((c) => !c.animalHasData);

  const reasons = matched.map((c) => c.reason);

  if (animal.hasDisability && animal.disabilityNotes) {
    reasons.unshift(`มีความพิการ: ${animal.disabilityNotes}`);
  } else if (animal.hasDisability) {
    reasons.unshift("คลินิกระบุ: มีความพิการ (ดูรายละเอียดในหน้าสัตว์)");
  }

  const totalCriteria = evaluable.length;
  const matchedCriteria = matched.length;
  const matchPercent =
    totalCriteria > 0
      ? Math.round((matchedCriteria / totalCriteria) * 100)
      : 0;

  return {
    animal,
    matchedCriteria,
    totalCriteria,
    matchPercent,
    reasons,
    dataIncomplete,
  };
}

export function resolveStrictSpeciesFilter(
  preferences: MatchPreferences
): AnimalSpecies[] | null {
  if (preferences.mode === "quiz" && preferences.quizAnswers?.species) {
    if (preferences.quizAnswers.species === "any") return null;
    return [preferences.quizAnswers.species as AnimalSpecies];
  }

  if (preferences.mode === "tags" && preferences.selectedSpecies) {
    return [preferences.selectedSpecies];
  }

  return null;
}

export function getSpeciesFilterLabel(
  preferences: MatchPreferences
): string | null {
  const strict = resolveStrictSpeciesFilter(preferences);
  if (!strict?.length) return null;

  const labels: Record<AnimalSpecies, string> = {
    DOG: "สุนัข",
    CAT: "แมว",
    RABBIT: "กระต่าย",
    BIRD: "นก",
    OTHER: "อื่นๆ",
  };

  return strict.map((s) => labels[s]).join(", ");
}

export function matchAnimals(
  animals: MatchableAnimal[],
  preferences: MatchPreferences
): MatchResult[] {
  const strictSpecies = resolveStrictSpeciesFilter(preferences);
  let filtered = animals;

  if (strictSpecies) {
    filtered = filtered.filter((a) => strictSpecies.includes(a.species));
  }

  if (filtered.length === 0) return [];

  if (preferences.mode === "quiz" && preferences.quizAnswers) {
    return filtered
      .map((animal) =>
        evaluateAnimal(
          animal,
          buildCriteriaFromQuiz(preferences.quizAnswers!, animal)
        )
      )
      .filter((r): r is MatchResult => r !== null)
      .sort((a, b) => {
        if (b.matchPercent !== a.matchPercent) {
          return b.matchPercent - a.matchPercent;
        }
        return b.matchedCriteria - a.matchedCriteria;
      });
  }

  if (preferences.mode === "tags" && preferences.selectedTraits?.length) {
    return filtered
      .map((animal) =>
        evaluateAnimal(
          animal,
          buildCriteriaFromTags(preferences.selectedTraits!, animal)
        )
      )
      .filter((r): r is MatchResult => r !== null)
      .sort((a, b) => b.matchPercent - a.matchPercent);
  }

  return filtered.map((animal) => ({
    animal,
    matchedCriteria: 0,
    totalCriteria: 0,
    matchPercent: 0,
    reasons: [
      `ชนิดสัตว์: ${animal.speciesLabel}`,
      ...(animal.hasDisability && animal.disabilityNotes
        ? [`มีความพิการ: ${animal.disabilityNotes}`]
        : []),
    ],
    dataIncomplete: !animal.energyLevel || animal.temperamentTraits.length === 0,
  }));
}

export { TEMPERAMENT_TRAITS };
