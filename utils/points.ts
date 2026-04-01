/**
 * Calculates the points earned for a single hole based on the number of strokes.
 * 
 * Hole in one (1 stroke) = 4 points
 * 2 strokes = 3 points
 * 3 strokes = 2 points
 * 4 strokes = 1 point
 * 5+ strokes = 0 points
 */
export const calculateLevelPoints = (strokes: number): number => {
  if (strokes === 1) return 4;
  if (strokes === 2) return 3;
  if (strokes === 3) return 2;
  if (strokes === 4) return 1;
  return 0;
};
