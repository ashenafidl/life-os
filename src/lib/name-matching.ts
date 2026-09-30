// Pure, dependency-free name-matching logic. Kept separate from
// peoples-matcher.ts so client components (the manual association UI) can
// score and rank candidates without importing the database layer.

export interface PersonWithAliases {
  id: string;
  name: string;
  aliases: string[];
}

export interface PersonMatchCandidate {
  personId: string;
  score: number;
}

export type MatchDecision =
  | { status: "matched"; personId: string; score: number }
  | { status: "ambiguous"; candidates: PersonMatchCandidate[] }
  | { status: "none" };

/** A name must clear this to auto-link. */
export const AUTO_LINK_THRESHOLD = 0.85;
/** If the runner-up is also above the threshold and within this margin of the
 * winner, the match is ambiguous and is left for manual review. */
export const AMBIGUITY_MARGIN = 0.15;

const HONORIFICS = new Set([
  "ato",
  "wro",
  "wrt",
  "woizero",
  "weizero",
  "mr",
  "mrs",
  "ms",
  "dr",
  "prof",
  "sheikh",
  "haji",
  "abba",
  "memhir",
]);

/** Lowercases, strips honorifics/punctuation/diacritics and collapses
 * whitespace so spelling and formatting variants compare equal. */
export function normalizeName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 0 && !HONORIFICS.has(token))
    .join(" ")
    .trim();
}

function tokenSet(normalized: string): Set<string> {
  return new Set(normalized.split(" ").filter(Boolean));
}

/** Dice coefficient over character bigrams — robust for short names and
 * tolerant of transpositions/typos ("kalab" vs "kaleab"). */
function bigramDice(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;

  const grams = (value: string) => {
    const set = new Set<string>();
    for (let i = 0; i < value.length - 1; i++) {
      set.add(value.slice(i, i + 2));
    }
    return set;
  };

  const aGrams = grams(a);
  const bGrams = grams(b);
  let intersection = 0;
  for (const gram of aGrams) {
    if (bGrams.has(gram)) intersection++;
  }

  return (2 * intersection) / (aGrams.size + bGrams.size);
}

/** Similarity of two names in [0, 1]. Tiers:
 * 1. exact normalized equality;
 * 2. token subset — every token of the shorter name appears in the longer
 *    (e.g. "kaleab" ⊂ "kaleab tadesse"), which catches a middle/father name
 *    being present on one message and omitted on another;
 * 3. otherwise the better of token overlap ratio and bigram Dice. */
export function nameSimilarity(a: string, b: string): number {
  const normalizedA = normalizeName(a);
  const normalizedB = normalizeName(b);
  if (!normalizedA || !normalizedB) return 0;
  if (normalizedA === normalizedB) return 1;

  const aTokens = tokenSet(normalizedA);
  const bTokens = tokenSet(normalizedB);
  const [smaller, larger] =
    aTokens.size <= bTokens.size ? [aTokens, bTokens] : [bTokens, aTokens];

  let overlap = 0;
  for (const token of smaller) {
    if (larger.has(token)) overlap++;
  }

  if (smaller.size > 0 && overlap === smaller.size) return 0.95;

  const tokenScore = overlap / Math.max(aTokens.size, bTokens.size);
  return Math.max(tokenScore, bigramDice(normalizedA, normalizedB));
}

/** Best similarity across a person's canonical name and all aliases. */
export function personScore(name: string, person: PersonWithAliases): number {
  let best = nameSimilarity(name, person.name);
  for (const alias of person.aliases) {
    best = Math.max(best, nameSimilarity(name, alias));
  }
  return best;
}

export function rankPeopleMatches(
  name: string,
  allPeople: PersonWithAliases[],
): PersonMatchCandidate[] {
  return allPeople
    .map((person) => ({
      personId: person.id,
      score: personScore(name, person),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function decidePersonMatch(
  name: string,
  allPeople: PersonWithAliases[],
): MatchDecision {
  const ranked = rankPeopleMatches(name, allPeople);
  const [best, second] = ranked;

  if (!best || best.score < AUTO_LINK_THRESHOLD) return { status: "none" };

  if (
    second &&
    second.score >= AUTO_LINK_THRESHOLD &&
    best.score - second.score < AMBIGUITY_MARGIN
  ) {
    return {
      status: "ambiguous",
      candidates: ranked.filter(
        (candidate) => candidate.score >= AUTO_LINK_THRESHOLD,
      ),
    };
  }

  return { status: "matched", personId: best.personId, score: best.score };
}

interface CounterpartySource {
  type: "income" | "expense" | null;
  senderName: string | null;
  recipientName: string | null;
}

/** The non-user party on a transaction: the recipient for outgoing
 * (expense) money and the sender for incoming (income). Returns null when no
 * counterparty name was captured, which is the manual-link case. */
export function counterpartyName(
  transaction: CounterpartySource,
): string | null {
  if (transaction.type === "expense") return transaction.recipientName;
  if (transaction.type === "income") return transaction.senderName;
  return transaction.recipientName ?? transaction.senderName;
}
