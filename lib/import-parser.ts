import { importArraySchema, type ImportRow } from "./validators";
import { normalizeText } from "./utils";

const rowId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function classify(term: string, translation: string, existing: Set<string>, seen: Set<string>): ImportRow["state"] {
  if (!term || !translation) return "invalid";
  const key = normalizeText(term);
  if (existing.has(key) || seen.has(key)) return "duplicate";
  seen.add(key);
  return "valid";
}

function linePair(line: string): [string, string] {
  const tab = line.indexOf("\t");
  if (tab >= 0) return [line.slice(0, tab), line.slice(tab + 1)];
  const emDash = line.indexOf("—");
  if (emDash >= 0) return [line.slice(0, emDash), line.slice(emDash + 1)];
  const spacedHyphen = line.match(/\s+-\s+/);
  if (spacedHyphen?.index !== undefined) return [line.slice(0, spacedHyphen.index), line.slice(spacedHyphen.index + spacedHyphen[0].length)];
  const colon = line.indexOf(":");
  if (colon >= 0) return [line.slice(0, colon), line.slice(colon + 1)];
  return [line, ""];
}

export function parseText(input: string, existing: Set<string>): ImportRow[] {
  const seen = new Set<string>();
  return input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const [rawTerm, rawTranslation] = linePair(line);
    const term = rawTerm.trim(); const translation = rawTranslation.trim();
    const state = classify(term, translation, existing, seen);
    return { id: rowId(), term, translation, state, selected: state === "valid" };
  });
}

export function parseJson(input: string, existing: Set<string>): { rows: ImportRow[]; error?: string; title?: string; description?: string } {
  try {
    const parsed: unknown = JSON.parse(input);
    const payload = Array.isArray(parsed) ? { cards: parsed } : parsed;
    if (!payload || typeof payload !== "object" || !("cards" in payload)) return { rows: [], error: "JSON must contain a cards array." };
    const record = payload as { cards: unknown; title?: unknown; description?: unknown };
    const cards = importArraySchema.parse(record.cards);
    const seen = new Set<string>();
    const rows = cards.map((card) => {
      const state = classify(card.term, card.translation, existing, seen);
      return { id: rowId(), term: card.term.trim(), translation: card.translation.trim(), state, selected: state === "valid" };
    });
    return { rows, title: typeof record.title === "string" ? record.title.trim() : undefined, description: typeof record.description === "string" ? record.description.trim() : undefined };
  } catch (error) { return { rows: [], error: error instanceof Error ? error.message : "Invalid JSON" }; }
}
