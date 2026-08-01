"use client";

import { AlertCircle, Check, ChevronRight, Mic, RotateCcw, Sparkles, Volume2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { Button, Card, ProgressBar } from "@/components/ui";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useSpeech } from "@/hooks/use-speech";
import { useI18n } from "@/lib/i18n";
import { getSet } from "@/lib/nhost/graphql";
import { comparePronunciation, type WordMatch } from "@/lib/pronunciation";
import type { VocabularySet } from "@/lib/types";

export default function PronunciationPage() {
  const { setId } = useParams<{ setId: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const { speak, supported: speechPlaybackSupported } = useSpeech();
  const recognition = useSpeechRecognition();
  const [set, setSet] = useState<VocabularySet | null>(null);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [scores, setScores] = useState<number[]>([]);

  useEffect(() => {
    void getSet(setId).then(setSet);
  }, [setId]);

  const cards = set?.cards ?? [];
  const current = cards[index];
  const comparison = useMemo(
    () => current && recognition.finalTranscript
      ? comparePronunciation(current.term, recognition.finalTranscript)
      : null,
    [current, recognition.finalTranscript],
  );

  const retry = () => recognition.reset();
  const goNext = () => {
    if (!comparison) return;
    setScores((value) => [...value, comparison.score]);
    recognition.reset();
    if (index >= cards.length - 1) {
      setDone(true);
      return;
    }
    setIndex((value) => value + 1);
  };
  const restart = () => {
    recognition.reset();
    setIndex(0);
    setDone(false);
    setScores([]);
  };

  const beginRecording = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    recognition.start();
  };
  const endRecording = () => recognition.stop();
  const beginRecordingWithKeyboard = (event: KeyboardEvent<HTMLButtonElement>) => {
    if ((event.key === " " || event.key === "Enter") && !event.repeat) {
      event.preventDefault();
      recognition.start();
    }
  };
  const endRecordingWithKeyboard = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      recognition.stop();
    }
  };

  if (!set) {
    return <AppShell title={t("pronunciationPractice")} back={`/sets/${setId}`} hideNav><p className="text-sm text-muted-foreground">{t("loading")}</p></AppShell>;
  }

  if (cards.length === 0) {
    return <AppShell title={t("pronunciationPractice")} back={`/sets/${setId}`} hideNav><Card className="p-10 text-center"><h2 className="text-xl font-bold">{t("noCards")}</h2><p className="mt-2 text-sm text-muted-foreground">{t("noCardsBody")}</p></Card></AppShell>;
  }

  if (done) {
    const average = scores.length ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length) : 0;
    return (
      <AppShell title={t("pronunciationPractice")} back={`/sets/${setId}`} hideNav>
        <div className="mx-auto max-w-md py-10 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-success/15 text-success"><Check className="h-8 w-8" /></div>
          <h2 className="mt-5 text-2xl font-bold">{t("pronunciationDone")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("pronunciationDoneBody")}</p>
          <Card className="mt-7 p-5">
            <p className="text-4xl font-bold text-primary">{average}%</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("averageMatch")}</p>
          </Card>
          <div className="mt-7 flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={restart}><RotateCcw className="h-4 w-4" />{t("again")}</Button>
            <Button className="flex-1" onClick={() => router.push(`/sets/${setId}`)}>{t("complete")}</Button>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!current) return null;
  const recognitionError = recognition.error ? t(`speechRecognitionError.${recognition.error}`) : null;

  return (
    <AppShell title={t("pronunciationPractice")} back={`/sets/${setId}`} hideNav>
      <div className="mx-auto max-w-2xl">
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("phraseProgress").replace("{current}", String(index + 1)).replace("{total}", String(cards.length))}</span>
            <span>{comparison ? `${comparison.score}%` : t("speakFromMemory")}</span>
          </div>
          <ProgressBar value={((index + (comparison ? 1 : 0)) / cards.length) * 100} />
        </div>

        <Card className="relative overflow-hidden border-primary/20 p-6 sm:p-8">
          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-primary">
              <Sparkles className="h-4 w-4" />
              {t("translateAndSay")}
            </div>
            <p className="mt-6 text-balance text-3xl font-bold leading-tight sm:text-4xl">{current.translation}</p>
            <p className="mt-4 text-sm text-muted-foreground">{t("pronunciationPrompt")}</p>
          </div>
        </Card>

        <div className="py-7 text-center">
          {recognition.supported ? (
            <>
              <div className="flex items-center justify-center gap-3">
                <Waveform active={recognition.listening} />
                <button
                  type="button"
                  onPointerDown={beginRecording}
                  onPointerUp={endRecording}
                  onPointerCancel={endRecording}
                  onKeyDown={beginRecordingWithKeyboard}
                  onKeyUp={endRecordingWithKeyboard}
                  className={`relative grid h-24 w-24 shrink-0 touch-none place-items-center rounded-full border-4 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 ${recognition.listening ? "scale-105 border-primary/30 bg-primary text-primary-foreground shadow-[0_0_0_14px_color-mix(in_oklab,var(--primary)_12%,transparent)]" : "border-primary/15 bg-card text-primary shadow-lg hover:-translate-y-0.5 hover:border-primary/30"}`}
                  aria-label={t("holdToSpeak")}
                >
                  <Mic className="h-9 w-9" />
                </button>
                <Waveform active={recognition.listening} reverse />
              </div>
              <p className={`mt-4 text-sm font-semibold ${recognition.listening ? "text-primary" : "text-foreground"}`}>
                {recognition.listening ? t("listening") : t("holdToSpeak")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{t("releaseToCheck")}</p>
            </>
          ) : (
            <Card className="border-warning/30 bg-warning/10 p-4 text-left">
              <div className="flex gap-3"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" /><div><p className="font-semibold">{t("speechRecognitionUnavailable")}</p><p className="mt-1 text-sm text-muted-foreground">{t("speechRecognitionUnavailableBody")}</p></div></div>
            </Card>
          )}
        </div>

        {(recognition.listening || recognition.transcript) && !comparison && (
          <Card className="mb-4 border-primary/20 bg-primary/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">{t("liveTranscript")}</p>
            <p className="mt-3 min-h-7 text-lg font-semibold">{recognition.transcript || t("listeningEllipsis")}</p>
          </Card>
        )}

        {recognitionError && !recognition.listening && (
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{recognitionError.startsWith("speechRecognitionError.") ? t("speechRecognitionError.generic") : recognitionError}</span>
          </div>
        )}

        {comparison && (
          <Card className="overflow-hidden border-border/80">
            <div className="flex items-center justify-between border-b border-border/70 bg-muted/35 px-5 py-4">
              <div><p className="text-xs font-semibold uppercase tracking-[.15em] text-muted-foreground">{t("pronunciationResult")}</p><p className="mt-1 font-bold">{scoreLabel(comparison.score, t)}</p></div>
              <div className={`grid h-14 w-14 place-items-center rounded-full text-sm font-bold ${comparison.score >= 80 ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"}`}>{comparison.score}%</div>
            </div>
            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.15em] text-muted-foreground">{t("youSaid")}</p>
                <ComparisonLine words={comparison.words} source="spoken" />
              </div>
              <div className="h-px bg-border/70" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.15em] text-muted-foreground">{t("correctAnswer")}</p>
                <ComparisonLine words={comparison.words} source="expected" />
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-success" />{t("matched")}</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-destructive" />{t("needsWork")}</span>
              </div>
            </div>
          </Card>
        )}

        {comparison && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Button variant="secondary" onClick={retry}><RotateCcw className="h-4 w-4" />{t("tryAgain")}</Button>
            <Button variant="secondary" disabled={!speechPlaybackSupported} onClick={() => speak(current.term)}><Volume2 className="h-4 w-4" />{t("listenEnglish")}</Button>
            <Button className="col-span-2 sm:col-span-1" onClick={goNext}>{index === cards.length - 1 ? t("complete") : t("next")}<ChevronRight className="h-4 w-4" /></Button>
          </div>
        )}

        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">{t("browserSpeechNote")}</p>
      </div>
    </AppShell>
  );
}

function Waveform({ active, reverse = false }: { active: boolean; reverse?: boolean }) {
  const heights = reverse ? [10, 18, 28, 20, 12] : [12, 20, 28, 18, 10];
  return (
    <div className="flex h-10 w-20 items-center justify-center gap-1" aria-hidden="true">
      {heights.map((height, index) => (
        <span
          key={`${height}-${index}`}
          className={`w-1 rounded-full bg-primary transition-opacity ${active ? "animate-pulse opacity-80" : "opacity-20"}`}
          style={{ height, animationDelay: `${index * 90}ms` }}
        />
      ))}
    </div>
  );
}

function ComparisonLine({ words, source }: { words: WordMatch[]; source: "expected" | "spoken" }) {
  return (
    <p className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-xl font-bold leading-relaxed sm:text-2xl">
      {words.map((word, wordIndex) => {
        const value = source === "expected" ? word.expected : word.spoken;
        const characters = source === "expected" ? word.expectedCharacters : word.spokenCharacters;
        if (!value) return null;
        return (
          <span key={`${source}-${wordIndex}`}>
            {characters.map(({ character, correct }, characterIndex) => (
              <span key={`${character}-${characterIndex}`} className={correct ? "text-success" : "text-destructive underline decoration-destructive/35 decoration-2 underline-offset-4"}>{character}</span>
            ))}
          </span>
        );
      })}
    </p>
  );
}

function scoreLabel(score: number, t: (key: string) => string) {
  if (score >= 90) return t("pronunciationScore.great");
  if (score >= 70) return t("pronunciationScore.close");
  return t("pronunciationScore.retry");
}
