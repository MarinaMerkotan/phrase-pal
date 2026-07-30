"use client";

import { Check, ChevronLeft, ChevronRight, RotateCcw, Shuffle, Volume2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button, Card, ProgressBar } from "@/components/ui";
import { useSpeech } from "@/hooks/use-speech";
import { useI18n } from "@/lib/i18n";
import { getSet } from "@/lib/nhost/graphql";
import type { VocabularySet } from "@/lib/types";

function shuffled(ids: string[]) {
  const next = [...ids];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [next[index], next[target]] = [next[target], next[index]];
  }
  return next;
}

export default function SelfCheckPage() {
  const { setId } = useParams<{ setId: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const { speak, supported } = useSpeech();
  const [set, setSet] = useState<VocabularySet | null>(null);
  const [order, setOrder] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    void getSet(setId).then((next) => {
      setSet(next);
      setOrder((next?.cards ?? []).map((card) => card.id));
    });
  }, [setId]);

  const cards = useMemo(() => {
    if (!set) return [];
    return order
      .map((id) => set.cards.find((card) => card.id === id))
      .filter((card): card is VocabularySet["cards"][number] => Boolean(card));
  }, [order, set]);
  const current = cards[index];

  const goNext = useCallback(() => {
    if (!revealed) {
      setRevealed(true);
      return;
    }
    if (index >= cards.length - 1) {
      setDone(true);
      return;
    }
    setIndex((value) => value + 1);
    setRevealed(false);
  }, [cards.length, index, revealed]);

  const goPrevious = useCallback(() => {
    setIndex((value) => Math.max(0, value - 1));
    setRevealed(false);
  }, []);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (["BUTTON", "INPUT", "TEXTAREA", "SELECT", "A"].includes(target.tagName)) return;
      if (event.code === "Space" || event.key === "Enter") {
        event.preventDefault();
        goNext();
      }
      if (event.key === "ArrowRight" && revealed) goNext();
      if (event.key === "ArrowLeft" && index > 0) goPrevious();
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [goNext, goPrevious, index, revealed]);

  const restart = () => {
    setIndex(0);
    setRevealed(false);
    setDone(false);
  };

  const shuffle = () => {
    setOrder((value) => shuffled(value));
    restart();
  };

  if (!set) {
    return (
      <AppShell title={t("loading")} back={`/sets/${setId}`} hideNav>
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </AppShell>
    );
  }

  if (cards.length === 0) {
    return (
      <AppShell title={t("selfCheck")} back={`/sets/${setId}`} hideNav>
        <Card className="p-10 text-center">
          <h2 className="text-xl font-bold">{t("noCards")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("noCardsBody")}</p>
        </Card>
      </AppShell>
    );
  }

  if (done) {
    return (
      <AppShell title={t("selfCheck")} back={`/sets/${setId}`} hideNav>
        <div className="mx-auto max-w-md py-10 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Check className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-2xl font-bold">{t("selfCheckDone")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("selfCheckDoneBody")}</p>
          <Card className="mt-7 p-5">
            <p className="text-3xl font-bold text-primary">{cards.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("phrasesReviewed")}</p>
          </Card>
          <div className="mt-7 flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={restart}>
              <RotateCcw className="h-4 w-4" />
              {t("again")}
            </Button>
            <Button className="flex-1" onClick={() => router.push(`/sets/${setId}`)}>
              {t("complete")}
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!current) return null;

  return (
    <AppShell title={set.title} back={`/sets/${setId}`} hideNav>
      <div className="mx-auto max-w-2xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex justify-between text-xs text-muted-foreground">
              <span>{index + 1} / {cards.length}</span>
              <span>{t("selfCheck")}</span>
            </div>
            <ProgressBar value={((index + (revealed ? 1 : 0)) / cards.length) * 100} />
          </div>
          <button
            type="button"
            onClick={shuffle}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-primary"
            title={t("shuffle")}
          >
            <Shuffle className="h-4 w-4" />
          </button>
        </div>

        <Card className="flex min-h-[270px] flex-col items-center justify-center p-7 text-center sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-muted-foreground">
            {t("ukrainianPrompt")}
          </p>
          <h2 className="mt-7 text-3xl font-bold leading-tight sm:text-4xl">{current.translation}</h2>
          <p className="mt-8 max-w-md text-sm text-muted-foreground">{t("sayEnglishAloud")}</p>
        </Card>

        {revealed ? (
          <Card className="mt-4 border-primary/40 bg-primary/5 p-6 text-center sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">
              {t("englishAnswer")}
            </p>
            <p className="mt-5 text-2xl font-bold leading-tight sm:text-3xl">{current.term}</p>
            <Button
              type="button"
              variant="secondary"
              className="mt-6"
              disabled={!supported}
              onClick={() => speak(current.term)}
              title={!supported ? t("speechUnavailable") : t("listenEnglish")}
            >
              <Volume2 className="h-4 w-4" />
              {t("listenEnglish")}
            </Button>
          </Card>
        ) : (
          <Button className="mt-4 h-12 w-full" onClick={goNext}>
            <Check className="h-5 w-5" />
            {t("check")}
          </Button>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <Button variant="secondary" disabled={index === 0} onClick={goPrevious}>
            <ChevronLeft className="h-4 w-4" />
            {t("previous")}
          </Button>
          {revealed && (
            <Button onClick={goNext}>
              {index === cards.length - 1 ? t("complete") : t("next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="mt-5 text-center text-xs text-muted-foreground">{t("selfCheckShortcut")}</p>
      </div>
    </AppShell>
  );
}
