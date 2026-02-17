"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "hi" | "mr";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => any;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Basic dictionary structure
// Ideally, this should be in a separate file, but for now, we can import it.
import { translations } from "./dictionaries";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    // Load persisted language
    const saved = localStorage.getItem("qp_language");
    if (saved && ["en", "hi", "mr"].includes(saved)) {
      setLanguage(saved as Language);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("qp_language", lang);
  };

  const t = (key: string) => {
    const keys = key.split(".");
    let current: any = translations[language];
    for (const k of keys) {
      if (current[k] === undefined) {
        // Fallback to English
        let fallback: any = translations["en"];
        for (const fk of keys) {
          if (fallback[fk] === undefined) return key;
          fallback = fallback[fk];
        }
        return fallback;
      }
      current = current[k];
    }
    return current;
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
