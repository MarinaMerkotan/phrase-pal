"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechOptions = { lang?: "en-US" | "uk-UA"; rate?: number; onStart?: () => void; onEnd?: () => void };

export function useSpeech() {
  const [supported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const speak = useCallback((term: string, options: SpeechOptions = {}) => {
    if (!supported) return false;
    window.speechSynthesis.cancel();
    const next = new SpeechSynthesisUtterance(term);
    next.lang = options.lang ?? "en-US";
    next.rate = options.rate ?? 0.88;
    next.onstart = () => options.onStart?.();
    next.onend = () => options.onEnd?.();
    next.onerror = () => options.onEnd?.();
    utterance.current = next;
    window.speechSynthesis.speak(next);
    return true;
  }, [supported]);
  const stop = useCallback(() => { if (supported) window.speechSynthesis.cancel(); utterance.current = null; }, [supported]);
  useEffect(() => () => { if (supported) window.speechSynthesis.cancel(); }, [supported]);
  return { supported, speak, stop };
}
