"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type RecognitionAlternative = { transcript: string };
type RecognitionResult = { isFinal: boolean; length: number; [index: number]: RecognitionAlternative };
type RecognitionResultList = { length: number; [index: number]: RecognitionResult };
type RecognitionEvent = Event & { results: RecognitionResultList };
type RecognitionErrorEvent = Event & { error: string };

type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
};

type RecognitionConstructor = new () => Recognition;
type RecognitionWindow = Window & {
  SpeechRecognition?: RecognitionConstructor;
  webkitSpeechRecognition?: RecognitionConstructor;
};

export function useSpeechRecognition() {
  const [supported] = useState(() => {
    if (typeof window === "undefined") return false;
    const recognitionWindow = window as RecognitionWindow;
    return Boolean(recognitionWindow.SpeechRecognition || recognitionWindow.webkitSpeechRecognition);
  });
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognition = useRef<Recognition | null>(null);

  const reset = useCallback(() => {
    const current = recognition.current;
    recognition.current = null;
    if (current) {
      current.onstart = null;
      current.onresult = null;
      current.onerror = null;
      current.onend = null;
      current.abort();
    }
    setListening(false);
    setTranscript("");
    setFinalTranscript("");
    setError(null);
  }, []);

  const start = useCallback(() => {
    if (!supported || listening) return;
    const recognitionWindow = window as RecognitionWindow;
    const Constructor = recognitionWindow.SpeechRecognition || recognitionWindow.webkitSpeechRecognition;
    if (!Constructor) return;

    const next = new Constructor();
    next.lang = "en-US";
    next.continuous = false;
    next.interimResults = true;
    next.maxAlternatives = 1;
    let sessionTranscript = "";
    next.onstart = () => setListening(true);
    next.onresult = (event) => {
      let nextTranscript = "";
      for (let index = 0; index < event.results.length; index += 1) {
        nextTranscript += `${event.results[index][0]?.transcript ?? ""} `;
      }
      const cleaned = nextTranscript.trim();
      sessionTranscript = cleaned;
      setTranscript(cleaned);
    };
    next.onerror = (event) => {
      if (event.error !== "aborted") setError(event.error);
    };
    next.onend = () => {
      setListening(false);
      setFinalTranscript(sessionTranscript);
      if (recognition.current === next) recognition.current = null;
    };

    setTranscript("");
    setFinalTranscript("");
    setError(null);
    recognition.current = next;
    try {
      next.start();
    } catch {
      setError("start-failed");
    }
  }, [listening, supported]);

  const stop = useCallback(() => {
    try {
      recognition.current?.stop();
    } catch {
      // The pointer may be released before the recognition engine has fully started.
    }
  }, []);

  useEffect(() => () => {
    const current = recognition.current;
    if (!current) return;
    current.onstart = null;
    current.onresult = null;
    current.onerror = null;
    current.onend = null;
    current.abort();
  }, []);

  return { supported, listening, transcript, finalTranscript, error, start, stop, reset };
}
