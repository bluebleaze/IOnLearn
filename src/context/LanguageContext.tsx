"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { Language, TranslationDictionary, translations } from "@/lib/translations";
import { loadPreferences, savePreferences } from "@/lib/taskStore";
import { UserPreferences } from "@/types";

interface LanguageContextValue {
  language: Language;
  isEn: boolean;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("id");

  useEffect(() => {
    // Load initial preference from direct key or user preferences
    if (typeof window !== "undefined") {
      const directLang = localStorage.getItem("ionlearn_language") as Language | null;
      const prefs = loadPreferences();
      const initial = (directLang === "en" || directLang === "id") ? directLang : prefs?.language;
      if (initial) {
        setLanguageState(initial);
        document.documentElement.lang = initial;
      }
    }

    const handleSync = () => {
      if (typeof window !== "undefined") {
        const directLang = localStorage.getItem("ionlearn_language") as Language | null;
        const current = loadPreferences();
        const nextLang = (directLang === "en" || directLang === "id") ? directLang : current?.language;
        if (nextLang && nextLang !== language) {
          setLanguageState(nextLang);
          document.documentElement.lang = nextLang;
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
  }, [language]);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("ionlearn_language", newLang);
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

  const isEn = language === "en";
  const t = useMemo(() => translations[language] || translations.id, [language]);

  return (
    <LanguageContext.Provider value={{ language, isEn, setLanguage, t }}>
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
      isEn: false,
      setLanguage: () => {},
      t: translations.id,
    };
  }
  return ctx;
}
