export const MAX_ANIMAL_IMAGES = 8;

export function getAnimalImageUrls(animal: { imageUrls?: string[] }): string[] {
  return animal.imageUrls?.length ? animal.imageUrls : [];
}
