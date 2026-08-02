"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Check,
  Flame,
  Languages,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-provider";
import { useI18n } from "@/lib/i18n";
import { Button, Card } from "@/components/ui";

const reviewWords = [
  { word: "reliable", hint: "Listen and remember" },
  { word: "curious", hint: "Tap to explore" },
  { word: "confident", hint: "Ready to speak" },
];

export default function LandingPage() {
  const { user, loading, signInWithGoogle, error } = useAuth();
  const { t } = useI18n();
  const previewRef = useRef<HTMLDivElement>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setWordIndex((current) => (current + 1) % reviewWords.length);
    }, 4200);

    return () => window.clearInterval(interval);
  }, []);

  if (loading || user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        {t("loading")}
      </div>
    );
  }

  const activeWord = reviewWords[wordIndex];

  function handlePreviewMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || !previewRef.current) return;

    const bounds = previewRef.current.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    previewRef.current.style.setProperty("--tilt-x", `${-y * 8}deg`);
    previewRef.current.style.setProperty("--tilt-y", `${x * 10}deg`);
    previewRef.current.style.setProperty("--glow-x", `${(x + 0.5) * 100}%`);
    previewRef.current.style.setProperty("--glow-y", `${(y + 0.5) * 100}%`);
  }

  function resetPreviewTilt() {
    previewRef.current?.style.setProperty("--tilt-x", "0deg");
    previewRef.current?.style.setProperty("--tilt-y", "0deg");
  }

  function selectWord(index: number) {
    setIsSpeaking(false);
    setWordIndex(index);
  }

  function speakWord() {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeWord.word);
    utterance.lang = "en-US";
    utterance.rate = 0.82;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <main className="landing-shell relative min-h-screen overflow-hidden bg-background">
      <div className="landing-grid absolute inset-0" aria-hidden="true" />
      <div className="landing-orb landing-orb-one" aria-hidden="true" />
      <div className="landing-orb landing-orb-two" aria-hidden="true" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-16 px-5 py-10 lg:grid-cols-[1fr_1fr] lg:px-10">
        <section className="relative">
          <div className="landing-enter mb-10 flex items-center gap-2" style={{ "--enter-delay": "40ms" } as React.CSSProperties}>
            <Image
              src="/logo-cropped.webp"
              alt=""
              width={40}
              height={40}
              priority
              className="h-10 w-10 shrink-0 object-contain"
            />
            <span className="text-lg font-bold">{t("appName")}</span>
          </div>

          <p
            className="landing-enter mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[.22em] text-primary"
            style={{ "--enter-delay": "120ms" } as React.CSSProperties}
          >
            <Sparkles className="h-4 w-4" />
            {t("tagline")}
          </p>
          <h1
            className="landing-enter max-w-xl text-4xl font-bold tracking-tight sm:text-6xl"
            style={{ "--enter-delay": "200ms" } as React.CSSProperties}
          >
            {t("welcome")}
          </h1>
          <p
            className="landing-enter mt-5 max-w-md text-base leading-7 text-muted-foreground"
            style={{ "--enter-delay": "280ms" } as React.CSSProperties}
          >
            {t("signInSubtitle")}
          </p>

          <Card
            className="landing-enter landing-auth-card mt-8 max-w-md p-5"
            style={{ "--enter-delay": "360ms" } as React.CSSProperties}
          >
            <Button
              className="landing-google-button group relative w-full overflow-hidden"
              size="lg"
              onClick={() => {
                void signInWithGoogle();
              }}
            >
              <GoogleIcon />
              <span>{t("google")}</span>
              <ArrowRight className="ml-auto h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
            {error && (
              <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {t("authError")} {error}
              </p>
            )}
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Google OAuth uses Nhost PKCE and keeps credentials out of the browser.
            </p>
          </Card>
        </section>

        <section className="landing-preview-enter relative mx-auto w-full max-w-md">
          <div className="landing-pulse absolute -inset-12 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
          <div className="landing-float-badge landing-float-badge-left" aria-hidden="true">
            <Flame className="h-4 w-4 text-warning" />
            7 day streak
          </div>
          <div className="landing-float-badge landing-float-badge-right" aria-hidden="true">
            <Sparkles className="h-4 w-4 text-primary" />
            92% recall
          </div>

          <div
            ref={previewRef}
            className="landing-preview-card relative rounded-[2rem] border border-border/80 bg-card p-5 shadow-2xl"
            onPointerMove={handlePreviewMove}
            onPointerLeave={resetPreviewTilt}
          >
            <div className="landing-card-shine pointer-events-none absolute inset-0 rounded-[2rem]" aria-hidden="true" />
            <div className="relative flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="landing-live-dot" />
                Daily review
              </span>
              <span className="landing-xp rounded-full bg-success/15 px-2 py-1 text-success">+24 XP</span>
            </div>

            <div className="relative mt-5 rounded-[1.5rem] border border-primary/30 bg-background p-8 text-center">
              <p className="text-xs uppercase tracking-[.2em] text-muted-foreground">English</p>
              <button
                type="button"
                className="group mx-auto mt-5 block min-h-14 cursor-pointer px-4"
                onClick={() => selectWord((wordIndex + 1) % reviewWords.length)}
                aria-label="Show the next review word"
              >
                <span key={activeWord.word} className="landing-word block text-4xl font-bold">
                  {activeWord.word}
                </span>
                <span className="mt-1 block text-[10px] uppercase tracking-[.18em] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  click for next word
                </span>
              </button>

              <button
                type="button"
                className={`landing-listen mx-auto mt-4 flex w-fit items-center gap-2 rounded-full bg-accent px-3 py-2 text-xs transition-colors hover:bg-primary hover:text-primary-foreground ${isSpeaking ? "is-speaking" : ""}`}
                onClick={speakWord}
              >
                <Volume2 className="h-4 w-4 text-primary transition-colors [button:hover_&]:text-primary-foreground" />
                <span>{activeWord.hint}</span>
                <span className="landing-sound-bars" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              </button>

              <div className="mt-5 flex justify-center gap-2" aria-label="Choose a review word">
                {reviewWords.map((item, index) => (
                  <button
                    key={item.word}
                    type="button"
                    className={`landing-dot ${index === wordIndex ? "is-active" : ""}`}
                    onClick={() => selectWord(index)}
                    aria-label={`Show ${item.word}`}
                    aria-current={index === wordIndex ? "true" : undefined}
                  />
                ))}
              </div>
            </div>

            <div className="relative mt-5 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="landing-stat rounded-xl bg-muted p-3">
                <Languages className="mx-auto mb-1 h-4 w-4 text-primary" />2 languages
              </div>
              <div className="landing-stat rounded-xl bg-muted p-3">
                <Check className="mx-auto mb-1 h-4 w-4 text-success" />Focused
              </div>
              <div className="landing-stat rounded-xl bg-muted p-3">
                <BookOpen className="mx-auto mb-1 h-4 w-4 text-primary" />Your sets
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-sm font-bold text-[#4285F4] shadow-sm">
      G
    </span>
  );
}
