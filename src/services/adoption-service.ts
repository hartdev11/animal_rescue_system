import type { Animal, AnimalSpecies, AnimalWithShelter, PlatformStatistics } from "@/types";
import {
  getAnimalById,
  getAnimalWithShelter,
  listAvailableAnimals,
  getAdoptionStatistics,
} from "@/lib/server/animal-store";

export async function getAvailableAnimals(
  options?: { species?: AnimalSpecies; shelterId?: string }
): Promise<Animal[]> {
  return listAvailableAnimals(options);
}

export async function getAnimalByIdForPage(
  id: string
): Promise<Animal | null> {
  return getAnimalById(id);
}

export async function getAnimalDetailWithShelter(
  id: string
): Promise<AnimalWithShelter | null> {
  return getAnimalWithShelter(id);
}

export async function getPlatformStatistics(): Promise<PlatformStatistics> {
  return getAdoptionStatistics();
}
