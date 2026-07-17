import type { TextHighlight } from "@/lib/types";

const TILDE_PATTERN = /[\u301c\uff5e~]/g;
const PARENTHETICAL_PATTERN = /[\uff08(][^\uff09)]*[\uff09)]/g;
const WHITESPACE_PATTERN = /\s+/g;

export function findHighlightQuery(
  text: string,
  highlight?: TextHighlight | null,
): string {
  if (highlight?.type === "translation") return "";

  const expression = highlight?.expression.trim();
  if (!expression) return "";

  const candidates =
    highlight?.type === "grammar"
      ? buildGrammarCandidates(expression)
      : buildBaseCandidates(expression);

  return candidates.find((candidate) => text.includes(candidate)) ?? "";
}

function buildBaseCandidates(expression: string): string[] {
  const withoutNotes = expression.replace(PARENTHETICAL_PATTERN, "").trim();
  const withoutTilde = withoutNotes.replace(TILDE_PATTERN, "").trim();
  const compact = withoutTilde.replace(WHITESPACE_PATTERN, "");

  return uniqueNonEmpty([expression, withoutNotes, withoutTilde, compact]);
}

function buildGrammarCandidates(expression: string): string[] {
  const baseCandidates = buildBaseCandidates(expression);
  const compact = baseCandidates[baseCandidates.length - 1] ?? "";

  return uniqueNonEmpty([
    ...baseCandidates,
    ...buildPoliteFormFallbacks(compact),
    ...buildCopulaFallbacks(compact),
  ]);
}

function buildPoliteFormFallbacks(expression: string): string[] {
  const fallbacks: string[] = [];

  if (expression.endsWith("\u3066\u3044\u308b")) {
    const stem = expression.slice(0, -"\u3066\u3044\u308b".length);
    fallbacks.push(
      `${stem}\u3066\u3044\u307e\u3059`,
      `${stem}\u3066\u3044`,
    );
  }

  return fallbacks;
}

function buildCopulaFallbacks(expression: string): string[] {
  if (!expression.endsWith("\u3067\u3042\u308b")) return [];

  const stem = expression.slice(0, -"\u3067\u3042\u308b".length);
  return [`${stem}\u3067\u3059`];
}

function uniqueNonEmpty(values: string[]): string[] {
  return values.filter((value, index, all) => value.length > 0 && all.indexOf(value) === index);
}
