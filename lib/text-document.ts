import type { TextDocument, TextParagraph, TextSentence } from "./types";
import { normalizeText } from "./utils";

const id = () => crypto.randomUUID();

export function paragraphEnglish(paragraph: TextParagraph) {
  return paragraph.sentences.map((sentence) => sentence.english.trim()).filter(Boolean).join(" ");
}

export function paragraphUkrainian(paragraph: TextParagraph) {
  return paragraph.sentences.every((sentence) => sentence.ukrainian.trim()) ? paragraph.sentences.map((sentence) => sentence.ukrainian.trim()).join(" ") : paragraph.ukrainian.trim();
}

export function parsePlainText(input: string, locale = "en"): TextDocument {
  const paragraphs = input.trim().split(/(?:\r?\n[ \t]*){2,}/).map((paragraph) => paragraph.replace(/\s*\r?\n\s*/g, " ").trim()).filter(Boolean);
  const segmenter = typeof Intl.Segmenter === "function" ? new Intl.Segmenter(locale, { granularity: "sentence" }) : null;
  return { version: 1, paragraphs: paragraphs.map((text) => {
    const pieces = segmenter ? [...segmenter.segment(text)].map((part) => part.segment.trim()) : text.match(/[^.!?]+(?:[.!?]+(?:["'”’]+)?|$)/g)?.map((part) => part.trim()) ?? [text];
    return { id: id(), ukrainian: "", sentences: pieces.filter(Boolean).map((english): TextSentence => ({ id: id(), english, ukrainian: "", status: "learning" })) };
  }) };
}

export function uniqueParagraphs(existing: TextDocument, incoming: TextDocument): TextParagraph[] {
  const seen = new Set(existing.paragraphs.map((paragraph) => normalizeText(paragraphEnglish(paragraph))));
  return incoming.paragraphs.filter((paragraph) => {
    const key = normalizeText(paragraphEnglish(paragraph));
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function alignTranslations(english: TextDocument, ukrainian: TextDocument) {
  if (english.paragraphs.length !== ukrainian.paragraphs.length) return { document: english, aligned: false };
  let aligned = true;
  const paragraphs = english.paragraphs.map((paragraph, index) => {
    const translated = ukrainian.paragraphs[index];
    if (paragraph.sentences.length !== translated.sentences.length) aligned = false;
    return { ...paragraph, ukrainian: paragraphEnglish(translated), sentences: paragraph.sentences.map((sentence, sentenceIndex) => ({ ...sentence, ukrainian: paragraph.sentences.length === translated.sentences.length ? translated.sentences[sentenceIndex].english : "" })) };
  });
  return { document: { ...english, paragraphs }, aligned };
}

export function textStats(document: TextDocument) {
  const sentences = document.paragraphs.flatMap((paragraph) => paragraph.sentences);
  const learned = sentences.filter((sentence) => sentence.status === "learned").length;
  return { total: sentences.length, learned, learning: sentences.length - learned, progress: sentences.length ? Math.round(learned / sentences.length * 100) : 0 };
}

export function textCards(document: TextDocument, granularity: "sentence" | "paragraph") {
  return granularity === "paragraph" ? document.paragraphs.map((paragraph) => ({ id: paragraph.id, english: paragraphEnglish(paragraph), ukrainian: paragraphUkrainian(paragraph), learned: paragraph.sentences.every((sentence) => sentence.status === "learned") })) : document.paragraphs.flatMap((paragraph) => paragraph.sentences.map((sentence) => ({ id: sentence.id, english: sentence.english, ukrainian: sentence.ukrainian, learned: sentence.status === "learned" })));
}

export function sentenceSpeech(sentence: TextSentence, direction: "en" | "uk") {
  const ukrainian = direction === "uk" && Boolean(sentence.ukrainian.trim());
  return { text: ukrainian ? sentence.ukrainian : sentence.english, lang: ukrainian ? "uk-UA" as const : "en-US" as const };
}

export function fragmentSpeech(text: string, language: "en" | "uk") {
  return { text, lang: language === "en" ? "en-US" as const : "uk-UA" as const };
}

export function vocabularyPhrase(text: string, translation: string, language: "en" | "uk") {
  return language === "en" ? { term: text, translation } : { term: translation, translation: text };
}
