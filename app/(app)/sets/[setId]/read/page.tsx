"use client";

import Link from "next/link";
import { BookOpen, Pause, Play, Volume2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button, Card, Input } from "@/components/ui";
import { useSpeech } from "@/hooks/use-speech";
import { useI18n } from "@/lib/i18n";
import { createCard, getSet, listSets } from "@/lib/nhost/graphql";
import { fragmentSpeech, paragraphUkrainian, sentenceSpeech, vocabularyPhrase } from "@/lib/text-document";
import type { TextSentence, VocabularySet } from "@/lib/types";
import { getErrorMessage, normalizeText } from "@/lib/utils";

type Selection = { text: string; lang: "en" | "uk"; top: number; left: number };

export default function ReadPage() {
  const { setId } = useParams<{ setId: string }>();
  const { t } = useI18n();
  const [set, setSet] = useState<VocabularySet | null>(null);
  const [error, setError] = useState("");
  const [direction, setDirection] = useState<"en" | "uk">("en");
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [fragment, setFragment] = useState<Selection | null>(null);
  const [fragmentTranslation, setFragmentTranslation] = useState("");
  const [showFragmentTranslation, setShowFragmentTranslation] = useState(false);
  const [vocabularySets, setVocabularySets] = useState<VocabularySet[]>([]);
  const [destination, setDestination] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [rate, setRate] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [playingSentence, setPlayingSentence] = useState<string | null>(null);
  const { supported, speak, stop } = useSpeech();
  const articleRef = useRef<HTMLDivElement>(null);
  const playbackRef = useRef(0);
  useEffect(() => { void getSet(setId).then(setSet).catch((cause) => setError(getErrorMessage(cause))); }, [setId]);
  useEffect(() => { void listSets().then((sets) => { const vocabulary = sets.filter((item) => item.kind === "vocabulary"); setVocabularySets(vocabulary); setDestination((current) => current || vocabulary[0]?.id || ""); }).catch(() => undefined); }, []);
  const sentences = useMemo(() => set?.text_content?.paragraphs.flatMap((paragraph) => paragraph.sentences) ?? [], [set]);

  const stopPlayback = useCallback(() => { playbackRef.current += 1; stop(); setPlaying(false); setPlayingSentence(null); }, [stop]);
  useEffect(() => () => { playbackRef.current += 1; }, []);
  const playSentence = (sentence: TextSentence) => {
    stopPlayback();
    const token = playbackRef.current;
    const speech = sentenceSpeech(sentence, direction);
    setPlayingSentence(sentence.id);
    speak(speech.text, { lang: speech.lang, rate, onEnd: () => { if (playbackRef.current === token) setPlayingSentence(null); } });
  };
  const playAll = () => {
    if (!sentences.length || !supported) return;
    stopPlayback();
    const token = playbackRef.current;
    setPlaying(true);
    const next = (index: number) => {
      if (playbackRef.current !== token) return;
      if (index >= sentences.length) { setPlaying(false); setPlayingSentence(null); return; }
      const sentence = sentences[index];
      const speech = sentenceSpeech(sentence, direction);
      setPlayingSentence(sentence.id);
      speak(speech.text, { lang: speech.lang, rate, onEnd: () => next(index + 1) });
    };
    next(0);
  };

  const captureSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (!selection || !text || !articleRef.current) return;
    const languageNode = (node: Node | null) => (node instanceof Element ? node : node?.parentElement)?.closest<HTMLElement>("[data-text-lang]");
    const anchor = languageNode(selection.anchorNode);
    const focus = languageNode(selection.focusNode);
    if (!anchor || !focus || !articleRef.current.contains(anchor) || !articleRef.current.contains(focus) || anchor.dataset.textLang !== focus.dataset.textLang) return;
    const rect = selection.getRangeAt(0).getBoundingClientRect();
    const lang = anchor.dataset.textLang === "uk" ? "uk" : "en";
    setFragment({ text, lang, top: Math.min(window.innerHeight - 80, Math.max(8, rect.bottom + 8)), left: Math.min(window.innerWidth - 280, Math.max(8, rect.left)) });
    setShowFragmentTranslation(false); setNotice("");
    const match = sentences.find((sentence) => normalizeText(lang === "en" ? sentence.english : sentence.ukrainian) === normalizeText(text));
    setFragmentTranslation(match ? lang === "en" ? match.ukrainian : match.english : "");
  };
  const onSentenceClick = (id: string) => {
    if (window.getSelection()?.toString().trim()) return;
    setFragment(null); setSelectedSentence(id); setShowTranslation(false);
  };
  const savePhrase = async () => {
    if (!fragment || !fragmentTranslation.trim() || !destination) return;
    setSaving(true); setError("");
    try {
      const target = await getSet(destination);
      if (!target || target.kind !== "vocabulary") throw new Error(t("chooseVocabularySet"));
      const { term, translation } = vocabularyPhrase(fragment.text, fragmentTranslation.trim(), fragment.lang);
      if (target.cards.some((card) => normalizeText(card.term) === normalizeText(term))) throw new Error(t("duplicate"));
      await createCard(destination, { term, translation, position: target.cards.length });
      setNotice(t("phraseSaved"));
    } catch (cause) { setError(getErrorMessage(cause)); } finally { setSaving(false); }
  };

  if (!set) return <AppShell title={t("readingMode")} back={`/sets/${setId}`}><p>{error || t("loading")}</p></AppShell>;
  return <AppShell title={set.title} back={`/sets/${setId}`}><div className="mx-auto max-w-4xl space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">{t("readingMode")}</h1><p className="text-sm text-muted-foreground">{t("selectTextHint")}</p></div><Link href={`/sets/${setId}/text-study`}><Button variant="secondary"><BookOpen className="h-4 w-4" />{t("textFlashcards")}</Button></Link></div>
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3"><button className="rounded-xl border border-border px-3 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-primary" onClick={() => { stopPlayback(); setDirection((value) => value === "en" ? "uk" : "en"); }}>{direction === "en" ? t("directionEnUk") : t("directionUkEn")}</button><Button variant="secondary" disabled={!supported || !sentences.length} onClick={playing ? stopPlayback : playAll}>{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}{playing ? t("stop") : t("playWholeText")}</Button><label className="ml-auto text-xs text-muted-foreground">{t("speed")} <select value={rate} onChange={(event) => setRate(Number(event.target.value))} className="ml-1 rounded-lg border border-border bg-background px-2 py-2 text-sm">{[0.75, 1, 1.25].map((value) => <option key={value} value={value}>{value}×</option>)}</select></label></div>
    {!supported && <p role="status" className="text-sm text-warning">{t("speechUnavailable")}</p>}
    {!sentences.length ? <Card className="p-8 text-center"><p>{t("noTextYet")}</p><Link href={`/sets/${setId}/import`}><Button className="mt-4">{t("importText")}</Button></Link></Card> : <Card className="p-5 sm:p-8"><div ref={articleRef} onPointerUp={() => window.setTimeout(captureSelection, 0)} onTouchEnd={() => window.setTimeout(captureSelection, 200)} onKeyUp={captureSelection} className="space-y-7 text-lg leading-9 selection:bg-primary/25 sm:text-xl">
      {set.text_content.paragraphs.map((paragraph) => {
        const unaligned = direction === "uk" && paragraph.sentences.some((sentence) => !sentence.ukrainian.trim());
        return <div key={paragraph.id} className="space-y-2">{unaligned ? <p data-text-lang="uk" lang="uk" className="leading-relaxed">{paragraphUkrainian(paragraph) || t("translationMissing")}</p> : <p lang={direction} className="leading-relaxed">{paragraph.sentences.map((sentence) => { const primary = direction === "en" ? sentence.english : sentence.ukrainian; const secondary = direction === "en" ? sentence.ukrainian : sentence.english; const active = selectedSentence === sentence.id; return <span key={sentence.id} className="inline"><span data-text-lang={direction} role="button" tabIndex={0} onClick={() => onSentenceClick(sentence.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSentenceClick(sentence.id); } }} className={`cursor-pointer rounded px-0.5 focus-visible:outline-2 focus-visible:outline-primary ${playingSentence === sentence.id ? "bg-primary/25" : active ? "bg-primary/10" : "hover:bg-muted"}`}>{primary}</span>{" "}{active && <span className="inline-flex align-middle"><button title={t("pronounce")} aria-label={t("pronounce")} disabled={!supported} onClick={() => playSentence(sentence)} className="mx-1 inline-flex rounded-full p-1 text-primary hover:bg-primary/10"><Volume2 className="h-4 w-4" /></button><button onClick={() => setShowTranslation((value) => !value)} className="rounded-lg px-2 text-xs font-semibold text-primary hover:bg-primary/10">{showTranslation ? t("hideTranslation") : t("showTranslation")}</button></span>}{active && showTranslation && <span className="block rounded-xl bg-muted/60 px-3 py-1 text-base text-muted-foreground" data-text-lang={direction === "en" ? "uk" : "en"}>{secondary || t("translationMissing")}</span>}</span>; })}</p>}{unaligned && <p className="text-xs text-muted-foreground">{t("sentenceAlignmentMissing")}</p>}</div>;
      })}
    </div></Card>}
    {fragment && <div role="dialog" aria-label={t("selectedTextActions")} style={{ top: fragment.top, left: fragment.left }} className="fixed z-50 w-[min(280px,calc(100vw-16px))] rounded-xl border border-border bg-card p-2 shadow-xl"><p className="truncate px-2 py-1 text-xs text-muted-foreground">{fragment.text}</p><div className="flex gap-1"><Button size="sm" variant="ghost" disabled={!supported} onClick={() => { stopPlayback(); const speech = fragmentSpeech(fragment.text, fragment.lang); speak(speech.text, { lang: speech.lang, rate }); }}>{t("listen")}</Button><Button size="sm" variant="ghost" onClick={() => setShowFragmentTranslation(true)}>{t("translate")}</Button><Button size="sm" variant="ghost" onClick={() => setShowFragmentTranslation(true)}>{t("savePhrase")}</Button></div>{showFragmentTranslation && <div className="space-y-2 p-2"><p className="text-xs text-muted-foreground">{fragment.lang === "en" ? t("ukrainianTranslation") : t("englishTerm")}</p><Input value={fragmentTranslation} onChange={(event) => setFragmentTranslation(event.target.value)} placeholder={t("manualTranslation")} /><p className="text-xs text-muted-foreground">{t("manualTranslationNote")}</p><select aria-label={t("chooseVocabularySet")} value={destination} onChange={(event) => setDestination(event.target.value)} className="w-full rounded-lg border border-border bg-background p-2 text-sm"><option value="">{t("chooseVocabularySet")}</option>{vocabularySets.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select><Button size="sm" disabled={!fragmentTranslation.trim() || !destination || saving} onClick={() => void savePhrase()}>{t("savePhrase")}</Button>{!vocabularySets.length && <p className="text-xs text-warning">{t("createVocabularyFirst")}</p>}</div>}<button onClick={() => setFragment(null)} className="absolute right-2 top-2 text-xs text-muted-foreground" aria-label={t("close")}>×</button></div>}
    {notice && <p role="status" className="text-sm text-success">{notice}</p>}{error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </div></AppShell>;
}
