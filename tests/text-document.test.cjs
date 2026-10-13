const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const cache = new Map();
function loadTypeScript(file) {
  const resolved = path.resolve(__dirname, "..", file);
  if (cache.has(resolved)) return cache.get(resolved);
  const output = ts.transpileModule(fs.readFileSync(resolved, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const loaded = { exports: {} };
  cache.set(resolved, loaded.exports);
  const localRequire = (request) => request.startsWith(".") ? loadTypeScript(path.relative(path.resolve(__dirname, ".."), path.resolve(path.dirname(resolved), request + ".ts"))) : require(request);
  new Function("require", "module", "exports", output)(localRequire, loaded, loaded.exports);
  return loaded.exports;
}

const { parsePlainText, alignTranslations, paragraphEnglish, paragraphUkrainian, uniqueParagraphs, textStats, textCards, sentenceSpeech, fragmentSpeech, vocabularyPhrase } = loadTypeScript("lib/text-document.ts");
const { parseText, parseJson } = loadTypeScript("lib/import-parser.ts");

test("plain text import keeps paragraph and sentence order", () => {
  const document = parsePlainText("First sentence. Second sentence!\n\nAnother paragraph? Yes.");
  assert.equal(document.paragraphs.length, 2);
  assert.deepEqual(document.paragraphs.map((paragraph) => paragraph.sentences.map((sentence) => sentence.english)), [["First sentence.", "Second sentence!"], ["Another paragraph?", "Yes."]]);
  assert.equal(paragraphEnglish(document.paragraphs[0]), "First sentence. Second sentence!");
});

test("translations align only when sentence counts match", () => {
  const english = parsePlainText("Hello. How are you?");
  const ukrainian = parsePlainText("Привіт. Як справи?", "uk");
  const aligned = alignTranslations(english, ukrainian);
  assert.equal(aligned.aligned, true);
  assert.deepEqual(aligned.document.paragraphs[0].sentences.map((sentence) => sentence.ukrainian), ["Привіт.", "Як справи?"]);
  assert.equal(paragraphUkrainian(aligned.document.paragraphs[0]), "Привіт. Як справи?");
  const mismatch = alignTranslations(english, parsePlainText("Привіт, як справи?", "uk"));
  assert.equal(mismatch.aligned, false);
  assert.deepEqual(mismatch.document.paragraphs[0].sentences.map((sentence) => sentence.ukrainian), ["", ""]);
});

test("duplicate paragraphs are not imported twice", () => {
  const existing = parsePlainText("Repeat this text.");
  const incoming = parsePlainText("Repeat this text.\n\nA new paragraph.\n\nA new paragraph.");
  assert.deepEqual(uniqueParagraphs(existing, incoming).map(paragraphEnglish), ["A new paragraph."]);
});

test("sentence progress derives from the shared document", () => {
  const document = parsePlainText("One. Two.");
  document.paragraphs[0].sentences[0].status = "learned";
  assert.deepEqual(textStats(document), { total: 2, learned: 1, learning: 1, progress: 50 });
});

test("existing vocabulary paste and JSON import still classify duplicates", () => {
  const existing = new Set(["known"]);
  const pasted = parseText("known — відомий\nnew — новий", existing);
  assert.deepEqual(pasted.map((row) => row.state), ["duplicate", "valid"]);
  const json = parseJson('[{"term":"known","translation":"відомий"},{"term":"new","translation":"новий"}]', existing);
  assert.equal(json.error, undefined);
  assert.deepEqual(json.rows.map((row) => row.state), ["duplicate", "valid"]);
});

test("sentence and paragraph cards share sentence progress", () => {
  const document = parsePlainText("One. Two.");
  assert.equal(textCards(document, "sentence").length, 2);
  assert.equal(textCards(document, "paragraph").length, 1);
  document.paragraphs[0].sentences[0].status = "learned";
  assert.deepEqual(textCards(document, "sentence").map((card) => card.learned), [true, false]);
  assert.equal(textCards(document, "paragraph")[0].learned, false);
  document.paragraphs[0].sentences[1].status = "learned";
  assert.equal(textCards(document, "paragraph")[0].learned, true);
});

test("sentence and selected-fragment playback use the requested text and language", () => {
  const sentence = { english: "A long sentence.", ukrainian: "Довге речення." };
  assert.deepEqual(sentenceSpeech(sentence, "uk"), { text: "Довге речення.", lang: "uk-UA" });
  assert.deepEqual(sentenceSpeech({ ...sentence, ukrainian: "" }, "uk"), { text: "A long sentence.", lang: "en-US" });
  assert.deepEqual(fragmentSpeech("long", "en"), { text: "long", lang: "en-US" });
  assert.deepEqual(fragmentSpeech("речення", "uk"), { text: "речення", lang: "uk-UA" });
  assert.deepEqual(vocabularyPhrase("речення", "sentence", "uk"), { term: "sentence", translation: "речення" });
});
