/**
 * Converts a string to sentence case (first letter capitalized, rest lowercase)
 * @param text The string to convert
 * @returns The string in sentence case
 */
export function toSentenceCase(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
