import type { EnergyLevel, TemperamentTrait } from "@/types";

const TRAIT_VALUES: TemperamentTrait[] = [
  "affectionate",
  "active",
  "calm",
  "independent",
  "good_with_kids",
  "good_with_elderly",
];

const ENERGY_VALUES: EnergyLevel[] = ["low", "medium", "high"];

export function parseTemperamentTraits(raw: unknown): TemperamentTrait[] {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.filter((v): v is TemperamentTrait =>
    TRAIT_VALUES.includes(v as TemperamentTrait)
  );
}

export function parseEnergyLevel(raw: unknown): EnergyLevel | undefined {
  if (typeof raw !== "string" || !raw) return undefined;
  return ENERGY_VALUES.includes(raw as EnergyLevel)
    ? (raw as EnergyLevel)
    : undefined;
}

export function parseBoolField(raw: unknown): boolean {
  return raw === true || raw === "true" || raw === "on";
}

export function animalProfileFromFormData(formData: FormData) {
  const hasDisability = parseBoolField(formData.get("hasDisability"));
  const disabilityNotes = (formData.get("disabilityNotes") as string) || undefined;

  return {
    temperamentTraits: parseTemperamentTraits(
      formData.getAll("temperamentTraits")
    ),
    energyLevel: parseEnergyLevel(formData.get("energyLevel")),
    suitableForCondo: parseBoolField(formData.get("suitableForCondo")),
    suitableForKids: parseBoolField(formData.get("suitableForKids")),
    suitableForElderly: parseBoolField(formData.get("suitableForElderly")),
    hasDisability,
    disabilityNotes:
      hasDisability && disabilityNotes?.trim()
        ? disabilityNotes.trim()
        : undefined,
  };
}

export function animalSchemaInputFromFormData(formData: FormData) {
  return {
    caseNumber: formData.get("caseNumber"),
    shelterId: formData.get("shelterId"),
    species: formData.get("species"),
    breed: (formData.get("breed") as string) || undefined,
    name: formData.get("name"),
    gender: formData.get("gender"),
    estimatedAge: formData.get("estimatedAge"),
    weight: formData.get("weight") || undefined,
    description: formData.get("description"),
    personality: (formData.get("personality") as string) || undefined,
    vaccinationStatus: parseBoolField(formData.get("vaccinationStatus")),
    sterilizationStatus: parseBoolField(formData.get("sterilizationStatus")),
    ...animalProfileFromFormData(formData),
  };
}
