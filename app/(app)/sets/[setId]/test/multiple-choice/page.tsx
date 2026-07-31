"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AnswerState, TestSummary } from "@/components/test-summary";
import { Button, Card, ProgressBar } from "@/components/ui";
import { getSet, updateCard } from "@/lib/nhost/graphql";
import type { VocabularyCard } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

function shuffled<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export default function MultipleChoicePage() {
  const { setId } = useParams<{ setId: string }>();
  const { t } = useI18n();
  const [cards, setCards] = useState<VocabularyCard[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    void getSet(setId).then((set) => setCards(set?.cards ?? []));
  }, [setId]);

  const current = cards[index];
  const options = useMemo(() => {
    if (!current) return [];
    const distractors = shuffled(cards.filter((card) => card.id !== current.id)).slice(0, 3);
    return shuffled([current, ...distractors]);
  }, [cards, current]);

  const submit = async () => {
    if (!selected || !current) return;
    const isCorrect = selected === current.id;
    setSubmitted(true);
    if (isCorrect) setCorrect((value) => value + 1);
    await updateCard(current.id, {
      [isCorrect ? "correct_answers" : "incorrect_answers"]:
        current[isCorrect ? "correct_answers" : "incorrect_answers"] + 1,
    });
  };

  const next = () => {
    setIndex((value) => value + 1);
    setSelected(null);
    setSubmitted(false);
  };

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setSubmitted(false);
    setCorrect(0);
  };

  if (cards.length === 0) {
    return (
      <AppShell title={t("multipleChoice")} back={`/sets/${setId}`}>
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </AppShell>
    );
  }

  if (index >= cards.length) {
    return (
      <AppShell title={t("test")} back={`/sets/${setId}`} hideNav>
        <TestSummary setId={setId} correct={correct} total={cards.length} onAgain={restart} />
      </AppShell>
    );
  }

  return (
    <AppShell title={t("multipleChoice")} back={`/sets/${setId}`}>
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex justify-between text-xs text-muted-foreground">
          <span>
            {index + 1} / {cards.length}
          </span>
          <span>
            {correct} {t("correctAnswers")}
          </span>
        </div>
        <ProgressBar value={(index / cards.length) * 100} />
        <Card className="mt-7 p-7 text-center sm:p-12">
          <p className="text-xs uppercase tracking-[.2em] text-muted-foreground">
            {t("translationPrompt")}
          </p>
          <h2 className="mt-6 text-3xl font-bold">{current.translation}</h2>
        </Card>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {options.map((option) => (
            <button
              key={option.id}
              disabled={submitted}
              onClick={() => setSelected(option.id)}
              className={`rounded-xl border p-4 text-left text-sm font-semibold transition ${
                selected === option.id
                  ? option.id === current.id && submitted
                    ? "border-success bg-success/10 text-success"
                    : submitted
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/60"
              }`}
            >
              {option.term}
            </button>
          ))}
        </div>
        {submitted && (
          <div className="mt-4">
            <AnswerState correct={selected === current.id} answer={current.term} />
          </div>
        )}
        <Button
          className="mt-5 w-full"
          disabled={!selected}
          onClick={() => (submitted ? next() : void submit())}
        >
          {submitted ? t("next") : t("check")}
        </Button>
      </div>
    </AppShell>
  );
}
