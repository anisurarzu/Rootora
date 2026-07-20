"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type VoiceSearchState = {
  supported: boolean;
  listening: boolean;
  transcript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

/**
 * Voice-ready architecture — uses Web Speech API when available.
 * UI can call start/stop without coupling to a specific vendor.
 */
export function useVoiceSearch(onResult?: (transcript: string) => void): VoiceSearchState {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognitionCtor =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionCtor() as SpeechRecognitionLike;
    recognition.lang = "bn-BD";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      const text = last?.[0]?.transcript?.trim() || "";
      if (!text) return;
      setTranscript(text);
      onResult?.(text);
    };
    recognition.onerror = (event) => {
      setError(event.error || "voice_error");
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    setSupported(true);

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognitionRef.current = null;
    };
  }, [onResult]);

  const start = useCallback(() => {
    setError(null);
    try {
      recognitionRef.current?.start();
      setListening(true);
    } catch {
      setError("voice_start_failed");
      setListening(false);
    }
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { supported, listening, transcript, error, start, stop };
}
