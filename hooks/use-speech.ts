"use client";

import { useCallback, useRef, useState } from "react";

export function useSpeech() {
  const [supported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const speak = useCallback((term: string) => {
    if (!supported) return false;
    window.speechSynthesis.cancel();
    const next = new SpeechSynthesisUtterance(term);
    next.lang = "en-US";
    next.rate = 0.88;
    utterance.current = next;
    window.speechSynthesis.speak(next);
    return true;
  }, [supported]);
  return { supported, speak };
}
