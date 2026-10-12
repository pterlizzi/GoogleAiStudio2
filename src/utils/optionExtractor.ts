/**
 * Utility to automatically extract comparison options from a user's dilemma title.
 * Examples:
 * - "Accept Startup Offer vs. Stay at Big Tech" -> ["Accept Startup Offer", "Stay at Big Tech"]
 * - "Should I buy a house or rent?" -> ["Buy a house", "Rent"]
 * - "Torn between moving to London and staying in NY" -> ["Moving to London", "Staying in NY"]
 * - "Python vs Go vs Rust" -> ["Python", "Go", "Rust"]
 * - "AWS / GCP / Azure" -> ["AWS", "GCP", "Azure"]
 */

export function extractOptionsFromDilemma(rawText: string): string[] | null {
  if (!rawText || rawText.trim().length < 4) return null;

  let text = rawText.trim();
  // Strip trailing punctuation like '?' or '.'
  text = text.replace(/[?!.]+$/, '').trim();

  // 1. Explicit "vs" or "versus" or "vs."
  if (/\s+(?:vs\.?|versus)\s+/i.test(text)) {
    const parts = text
      .split(/\s+(?:vs\.?|versus)\s+/i)
      .map(cleanOptionCandidate)
      .filter((opt) => opt.length > 0);
    if (parts.length >= 2) return parts.slice(0, 5);
  }

  // 2. "Should I/we [A] or [B]" / "Is it better to [A] or [B]" / "Whether to [A] or [B]"
  const shouldMatch = text.match(
    /^(?:should\s+(?:i|we)|shall\s+(?:i|we)|is\s+it\s+better\s+to|do\s+i|would\s+it\s+be\s+better\s+to|whether\s+to)\s+(.+)$/i
  );
  if (shouldMatch) {
    const remainder = shouldMatch[1];
    if (/\s+\bor\b\s+/i.test(remainder)) {
      const parts = remainder
        .split(/\s+\bor\b\s+/i)
        .map(cleanOptionCandidate)
        .filter((opt) => opt.length > 0);
      if (parts.length >= 2) return parts.slice(0, 5);
    }
  }

  // 3. "Deciding between [A] and/or [B]" / "Torn between [A] and/or [B]" / "Choosing between [A] and/or [B]"
  const betweenMatch = text.match(
    /^(?:deciding\s+between|torn\s+between|choosing\s+between|stuck\s+between|weighing)\s+(.+)$/i
  );
  if (betweenMatch) {
    const remainder = betweenMatch[1];
    if (/\s+\b(?:and|or)\b\s+/i.test(remainder)) {
      const parts = remainder
        .split(/\s+\b(?:and|or)\b\s+/i)
        .map(cleanOptionCandidate)
        .filter((opt) => opt.length > 0);
      if (parts.length >= 2) return parts.slice(0, 5);
    }
  }

  // 4. Slash separated options with spaces: "Next.js / Remix / Astro"
  if (text.includes(' / ')) {
    const parts = text
      .split(/\s+\/\s+/)
      .map(cleanOptionCandidate)
      .filter((opt) => opt.length > 0);
    if (parts.length >= 2) return parts.slice(0, 5);
  }

  // 5. Comma list or simple "A or B"
  if (/\s+\bor\b\s+/i.test(text)) {
    if (text.includes(',')) {
      const parts = text
        .split(/,\s*(?:or\s+)?|\s+or\s+/i)
        .map(cleanOptionCandidate)
        .filter((opt) => opt.length > 0);
      if (parts.length >= 2) return parts.slice(0, 5);
    } else {
      const parts = text
        .split(/\s+\bor\b\s+/i)
        .map(cleanOptionCandidate)
        .filter((opt) => opt.length > 0);
      if (parts.length >= 2 && parts[0].length < 60 && parts[1].length < 60) {
        return parts.slice(0, 5);
      }
    }
  }

  return null;
}

function cleanOptionCandidate(opt: string): string {
  let cleaned = opt.trim();
  // Strip leading words like "to ", "either ", "or "
  cleaned = cleaned.replace(/^(?:to\s+|either\s+|or\s+)/i, '').trim();
  // Strip trailing punctuation
  cleaned = cleaned.replace(/[,;]+$/, '').trim();
  // Capitalize first letter if present
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return cleaned;
}
