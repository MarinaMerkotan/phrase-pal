"use client";

import { Check, ChevronLeft, ChevronRight, RotateCw, Shuffle, Volume2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button, Card, ProgressBar } from "@/components/ui";
import { getSet, updateCard } from "@/lib/nhost/graphql";
import type { VocabularySet } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { useSpeech } from "@/hooks/use-speech";

const CARD_FLIP_DURATION_MS = 600;

export default function StudyPage() {
  const { setId } = useParams<{ setId: string }>(); const router = useRouter(); const { t } = useI18n(); const { speak } = useSpeech(); const [set, setSet] = useState<VocabularySet | null>(null); const [filter, setFilter] = useState<"all" | "learning">("all"); const [direction, setDirection] = useState<"en_uk" | "uk_en">("en_uk"); const [order, setOrder] = useState<string[]>([]); const [index, setIndex] = useState(0); const [flipped, setFlipped] = useState(false); const [done, setDone] = useState(false); const [marked, setMarked] = useState({ learning: 0, learned: 0 });
  const nextCardTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { void getSet(setId).then((next) => { setSet(next); setOrder((next?.cards ?? []).map((card) => card.id)); }); }, [setId]);
  const cards = useMemo(() => (set?.cards ?? []).filter((card) => filter === "all" || card.status === "learning"), [filter, set]);
  const current = cards.find((card) => card.id === order[index]) ?? cards[index];
  const advance = useCallback(() => { if (index >= cards.length - 1) setDone(true); else setIndex((value) => value + 1); }, [cards.length, index]);
  const goNext = useCallback(() => {
    if (nextCardTimer.current) return;
    if (!flipped) {
      advance();
      return;
    }
    setFlipped(false);
    nextCardTimer.current = setTimeout(() => {
      nextCardTimer.current = null;
      advance();
    }, CARD_FLIP_DURATION_MS);
  }, [advance, flipped]);
  useEffect(() => () => {
    if (nextCardTimer.current) clearTimeout(nextCardTimer.current);
  }, []);
  useEffect(() => { const keydown = (event: KeyboardEvent) => { const target = event.target as HTMLElement; if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return; if (event.code === "Space") { event.preventDefault(); setFlipped((value) => !value); } if (event.key === "ArrowRight") goNext(); if (event.key === "ArrowLeft") { setFlipped(false); setIndex((value) => Math.max(0, value - 1)); } }; window.addEventListener("keydown", keydown); return () => window.removeEventListener("keydown", keydown); }, [goNext]);
  const restart = () => { setIndex(0); setFlipped(false); setDone(false); setMarked({ learning: 0, learned: 0 }); setOrder(cards.map((card) => card.id)); };
  const shuffle = () => { setOrder([...cards.map((card) => card.id)].sort(() => Math.random() - 0.5)); setIndex(0); setFlipped(false); setDone(false); };
  const mark = async (status: "learning" | "learned") => { if (!current) return; const updated = await updateCard(current.id, { status }); setSet((value) => value ? { ...value, cards: value.cards.map((card) => card.id === updated.id ? updated : card) } : value); setMarked((value) => ({ ...value, [status]: value[status] + 1 })); goNext(); };
  if (!set) return <AppShell title={t("loading")} back={`/sets/${setId}`} hideNav><p className="text-sm text-muted-foreground">{t("loading")}</p></AppShell>;
  if (cards.length === 0) return <AppShell title={t("studyTitle")} back={`/sets/${setId}`} hideNav><Card className="p-10 text-center"><p className="text-4xl">🎉</p><h2 className="mt-4 text-xl font-bold">{t("noCards")}</h2><p className="mt-2 text-sm text-muted-foreground">{t("noCardsBody")}</p></Card></AppShell>;
  if (done) return <AppShell title={t("studyTitle")} back={`/sets/${setId}`} hideNav><div className="mx-auto max-w-md py-10 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-success/15 text-success"><Check className="h-8 w-8" /></div><h2 className="mt-5 text-2xl font-bold">{t("studyDone")}</h2><p className="mt-2 text-sm text-muted-foreground">{t("studyDoneBody")}</p><div className="mt-7 grid grid-cols-2 gap-3"><Card className="p-4"><p className="text-2xl font-bold text-success">{marked.learned}</p><p className="text-xs text-muted-foreground">{t("learned")}</p></Card><Card className="p-4"><p className="text-2xl font-bold text-warning">{marked.learning}</p><p className="text-xs text-muted-foreground">{t("learning")}</p></Card></div><div className="mt-7 flex gap-2"><Button variant="secondary" className="flex-1" onClick={restart}>{t("again")}</Button><Button className="flex-1" onClick={() => router.push(`/sets/${setId}`)}>{t("complete")}</Button></div></div></AppShell>;
  if (!current) return null;
  const front = direction === "en_uk" ? current.term : current.translation; const back = direction === "en_uk" ? current.translation : current.term;
  return <AppShell title={set.title} back={`/sets/${setId}`} hideNav><div className="mb-4 flex items-center justify-between gap-3"><div className="min-w-0 flex-1"><div className="mb-2 flex justify-between text-xs text-muted-foreground"><span>{index + 1} / {cards.length}</span><span>{filter === "all" ? t("all") : t("filterLearning")}</span></div><ProgressBar value={((index + 1) / cards.length) * 100} /></div><button onClick={() => setFilter((value) => value === "all" ? "learning" : "all")} className="rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold">{filter === "all" ? t("all") : t("filterLearning")}</button><button onClick={shuffle} className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card" title={t("shuffle")}><Shuffle className="h-4 w-4" /></button></div><div className="mb-4 flex justify-end"><button onClick={() => { setDirection((value) => value === "en_uk" ? "uk_en" : "en_uk"); setFlipped(false); }} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold">{direction === "en_uk" ? t("directionEnUk") : t("directionUkEn")}</button></div><div className="[perspective:1200px]"><button aria-label={t("tapToFlip")} onClick={() => setFlipped((value) => !value)} className="preserve-3d flip-transition relative block h-[390px] w-full text-center" style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}><div className="backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] border border-border/70 bg-card p-8 shadow-lg"><span className="text-xs font-semibold uppercase tracking-[.22em] text-muted-foreground">{direction === "en_uk" ? "English" : "Українська"}</span><span className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl">{front}</span><span className="mt-10 text-xs text-muted-foreground">{t("tapToFlip")} · Space</span></div><div className="backface-hidden absolute inset-0 flex rotate-y-180 flex-col items-center justify-center rounded-[2rem] border border-primary/40 bg-card p-8 shadow-lg"><span className="text-xs font-semibold uppercase tracking-[.22em] text-primary">{direction === "en_uk" ? "Українська" : "English"}</span><span className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl">{back}</span></div></button></div><div className="mt-5 flex items-center justify-between gap-3"><Button variant="secondary" disabled={index === 0} onClick={() => { setIndex((value) => Math.max(0, value - 1)); setFlipped(false); }}><ChevronLeft className="h-4 w-4" />{t("previous")}</Button><button onClick={() => speak(current.term)} className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-primary" title={t("pronounce")}><Volume2 className="h-5 w-5" /></button><Button variant="secondary" onClick={goNext}>{t("next")}<ChevronRight className="h-4 w-4" /></Button></div><div className="mt-5 grid grid-cols-2 gap-3"><Button variant="secondary" className="border-warning/40 bg-warning/10 text-warning hover:bg-warning/20" onClick={() => void mark("learning")}><RotateCw className="h-4 w-4" />{t("stillLearning")}</Button><Button variant="secondary" className="border-success/40 bg-success/10 text-success hover:bg-success/20" onClick={() => void mark("learned")}><Check className="h-4 w-4" />{t("markLearned")}</Button></div></AppShell>;
}
