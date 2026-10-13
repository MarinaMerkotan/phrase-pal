"use client";

import { Check, ChevronLeft, ChevronRight, RotateCw, Volume2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button, Card, ProgressBar } from "@/components/ui";
import { useSpeech } from "@/hooks/use-speech";
import { useI18n } from "@/lib/i18n";
import { getSet, updateTextContent } from "@/lib/nhost/graphql";
import { textCards } from "@/lib/text-document";
import type { CardStatus, TextDocument, VocabularySet } from "@/lib/types";
import { getErrorMessage } from "@/lib/utils";

export default function TextStudyPage() {
  const { setId } = useParams<{ setId: string }>();
  const { t } = useI18n();
  const [set, setSet] = useState<VocabularySet | null>(null);
  const [granularity, setGranularity] = useState<"sentence" | "paragraph">("sentence");
  const [direction, setDirection] = useState<"en" | "uk">("en");
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { supported, speak } = useSpeech();
  useEffect(() => { void getSet(setId).then(setSet).catch((cause) => setError(getErrorMessage(cause))); }, [setId]);
  const cards = useMemo(() => set ? textCards(set.text_content, granularity) : [], [granularity, set]);
  const current = cards[Math.min(index, cards.length - 1)];
  const learned = cards.filter((card) => card.learned).length;
  const switchGranularity = (next: "sentence" | "paragraph") => { setGranularity(next); setIndex(0); setRevealed(false); };
  const mark = async (status: CardStatus) => {
    if (!current || !set || busy) return;
    setBusy(true); setError("");
    const update = (document: TextDocument): TextDocument => ({ ...document, paragraphs: document.paragraphs.map((paragraph) => ({ ...paragraph, sentences: paragraph.sentences.map((sentence) => granularity === "paragraph" ? paragraph.id === current.id ? { ...sentence, status } : sentence : sentence.id === current.id ? { ...sentence, status } : sentence) })) });
    try {
      const latest = await getSet(setId);
      if (!latest) throw new Error(t("notFound"));
      const updated = await updateTextContent(setId, update(latest.text_content));
      setSet(updated);
      setRevealed(false);
      setIndex((value) => Math.min(value + 1, cards.length - 1));
    } catch (cause) { setError(getErrorMessage(cause)); } finally { setBusy(false); }
  };
  if (!set) return <AppShell title={t("textFlashcards")} back={`/sets/${setId}`}><p>{error || t("loading")}</p></AppShell>;
  const front = direction === "en" ? current?.english : current?.ukrainian;
  const back = direction === "en" ? current?.ukrainian : current?.english;
  return <AppShell title={set.title} back={`/sets/${setId}/read`} hideNav><div className="mx-auto max-w-3xl space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">{t("textFlashcards")}</h1><div className="flex rounded-xl bg-muted p-1">{(["sentence", "paragraph"] as const).map((value) => <button key={value} onClick={() => switchGranularity(value)} aria-pressed={granularity === value} className={`rounded-lg px-3 py-2 text-sm font-semibold ${granularity === value ? "bg-card shadow-sm" : "text-muted-foreground"}`}>{t(value === "sentence" ? "sentenceCards" : "paragraphCards")}</button>)}</div></div><div className="flex flex-wrap items-center justify-between gap-3"><button onClick={() => { setDirection((value) => value === "en" ? "uk" : "en"); setRevealed(false); }} className="rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold">{direction === "en" ? t("directionEnUk") : t("directionUkEn")}</button><span className="text-sm text-muted-foreground">{learned} / {cards.length} {t("learned")}</span></div><ProgressBar value={cards.length ? learned / cards.length * 100 : 0} />
    {!current ? <Card className="p-10 text-center">{t("noTextYet")}</Card> : <><p className="text-center text-xs text-muted-foreground">{index + 1} / {cards.length}</p><Card className="flex min-h-72 flex-col items-center justify-center p-6 text-center sm:p-10"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{revealed ? direction === "en" ? "Українська" : "English" : direction === "en" ? "English" : "Українська"}</p><p lang={revealed ? direction === "en" ? "uk" : "en" : direction} className="mt-6 whitespace-pre-wrap text-2xl font-semibold leading-relaxed sm:text-3xl">{(revealed ? back : front) || t("translationMissing")}</p><Button variant="ghost" className="mt-7" onClick={() => setRevealed((value) => !value)}>{revealed ? t("hideTranslation") : t("tapToFlip")}</Button></Card><div className="flex items-center justify-between gap-2"><Button variant="secondary" disabled={index === 0} onClick={() => { setIndex((value) => value - 1); setRevealed(false); }}><ChevronLeft className="h-4 w-4" />{t("previous")}</Button><Button variant="secondary" disabled={!supported || !(revealed ? back : front)} onClick={() => speak((revealed ? back : front) || "", { lang: (revealed ? direction === "en" ? "uk-UA" : "en-US" : direction === "en" ? "en-US" : "uk-UA") })}><Volume2 className="h-4 w-4" />{t("listen")}</Button><Button variant="secondary" disabled={index === cards.length - 1} onClick={() => { setIndex((value) => value + 1); setRevealed(false); }}>{t("next")}<ChevronRight className="h-4 w-4" /></Button></div><div className="grid grid-cols-2 gap-3"><Button variant="secondary" disabled={busy} onClick={() => void mark("learning")}><RotateCw className="h-4 w-4" />{t("stillLearning")}</Button><Button variant="secondary" disabled={busy} onClick={() => void mark("learned")}><Check className="h-4 w-4" />{t("markLearned")}</Button></div></>}{error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </div></AppShell>;
}
