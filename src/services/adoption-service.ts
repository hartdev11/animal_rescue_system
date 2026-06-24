import type { Animal, PlatformStatistics } from "@/types";

export async function getAvailableAnimals(): Promise<Animal[]> {
  // TODO: Implement adoption listing query
  return [];
}

export async function getAnimalById(id: string): Promise<Animal | null> {
  void id;
  // TODO: Implement single animal fetch
  return null;
}

export async function getPlatformStatistics(): Promise<PlatformStatistics> {
  // TODO: Implement platform stats aggregation
  return {
    totalCases: 0,
    animalsRescued: 0,
    animalsRecovered: 0,
    animalsAdopted: 0,
  };
}
