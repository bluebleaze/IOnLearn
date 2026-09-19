"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { Language, TranslationDictionary, translations } from "@/lib/translations";
import { loadPreferences, savePreferences } from "@/lib/taskStore";
import { UserPreferences } from "@/types";

export type LanguageMode = "id" | "en" | "auto";

interface LanguageContextValue {
  language: Language;
  languageMode: LanguageMode;
  isEn: boolean;
  setLanguage: (lang: Language) => void;
  setLanguageMode: (mode: LanguageMode) => void;
  detectedLanguage: Language;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Detect language from browser locale + timezone.
 * Indonesian timezones: Asia/Jakarta, Asia/Makassar, Asia/Jayapura, Asia/Pontianak
 * Indonesian locales: id-*, in-*
 */
function detectLanguage(): Language {
  if (typeof window === "undefined") return "id";

  // 1. Check timezone (most reliable for geo-detection)
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (
      tz === "Asia/Jakarta" ||
      tz === "Asia/Makassar" ||
      tz === "Asia/Jayapura" ||
      tz === "Asia/Pontianak"
    ) {
      return "id";
    }
  } catch {
    // ignore
  }

  // 2. Check browser locale(s)
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const loc of langs) {
    const base = loc.toLowerCase().split("-")[0];
    if (base === "id" || base === "in") return "id";
  }

  return "en";
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("id");
  const [languageMode, setLanguageModeState] = useState<LanguageMode>("auto");
  const [detectedLanguage, setDetectedLanguage] = useState<Language>("id");

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Detect once on mount
      const detected = detectLanguage();
      setDetectedLanguage(detected);

      const rawMode = localStorage.getItem("ionlearn_language_mode");
      const storedMode: LanguageMode =
        rawMode === "auto" || rawMode === "id" || rawMode === "en" ? rawMode : "auto";
      const directLang = localStorage.getItem("ionlearn_language") as Language | null;
      const prefs = loadPreferences();

      setLanguageModeState(storedMode);

      if (storedMode === "auto") {
        // Use auto-detected language
        setLanguageState(detected);
        document.documentElement.lang = detected;
      } else {
        // Use stored manual preference
        const initial = (directLang === "en" || directLang === "id")
          ? directLang
          : prefs?.language;
        if (initial) {
          setLanguageState(initial);
          document.documentElement.lang = initial;
        }
      }
    }

    const handleSync = () => {
      if (typeof window !== "undefined") {
        const mode = (localStorage.getItem("ionlearn_language_mode") as LanguageMode | null) ?? "auto";
        if (mode === "auto") {
          const detected = detectLanguage();
          setDetectedLanguage(detected);
          setLanguageState(detected);
          document.documentElement.lang = detected;
        } else {
          const directLang = localStorage.getItem("ionlearn_language") as Language | null;
          const current = loadPreferences();
          const nextLang = (directLang === "en" || directLang === "id") ? directLang : current?.language;
          if (nextLang) {
            setLanguageState(nextLang);
            document.documentElement.lang = nextLang;
          }
        }
      }
    };

    window.addEventListener("taskStoreChange", handleSync);
    window.addEventListener("language-changed", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("taskStoreChange", handleSync);
      window.removeEventListener("language-changed", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  /** Set a manual language — saves mode equal to chosen lang ("id" | "en") */
  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    setLanguageModeState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("ionlearn_language", newLang);
      localStorage.setItem("ionlearn_language_mode", newLang);
      document.documentElement.lang = newLang;
    }
    const existing = loadPreferences();
    const updated: UserPreferences = existing
      ? { ...existing, language: newLang }
      : {
          learningStyle: "Visual",
          explanationDetail: "Detail",
          aiTone: "Santai",
          language: newLang,
        };
    savePreferences(updated);
    window.dispatchEvent(new Event("language-changed"));
  };

  /** Set mode: "auto" re-runs detection, "manual" keeps current */
  const setLanguageMode = (mode: LanguageMode) => {
    setLanguageModeState(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("ionlearn_language_mode", mode);
    }
    if (mode === "auto") {
      const detected = detectLanguage();
      setDetectedLanguage(detected);
      setLanguageState(detected);
      if (typeof window !== "undefined") {
        document.documentElement.lang = detected;
      }
      const existing = loadPreferences();
      const updated: UserPreferences = existing
        ? { ...existing, language: detected }
        : {
            learningStyle: "Visual",
            explanationDetail: "Detail",
            aiTone: "Santai",
            language: detected,
          };
      savePreferences(updated);
      window.dispatchEvent(new Event("language-changed"));
    }
  };

  const isEn = language === "en";
  const t = useMemo(() => translations[language] || translations.id, [language]);

  return (
    <LanguageContext.Provider value={{ language, languageMode, isEn, setLanguage, setLanguageMode, detectedLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback safe value for components rendered outside provider
    return {
      language: "id",
      languageMode: "auto",
      isEn: false,
      setLanguage: () => {},
      setLanguageMode: () => {},
      detectedLanguage: "id",
      t: translations.id,
    };
  }
  return ctx;
}
