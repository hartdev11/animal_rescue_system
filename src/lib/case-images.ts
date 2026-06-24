export const MAX_CASE_IMAGES = 5;

export function getCaseImageUrls(caseData: {
  imageUrls?: string[];
  imageUrl?: string;
}): string[] {
  if (caseData.imageUrls?.length) {
    return caseData.imageUrls;
  }
  if (caseData.imageUrl) {
    return [caseData.imageUrl];
  }
  return [];
}
