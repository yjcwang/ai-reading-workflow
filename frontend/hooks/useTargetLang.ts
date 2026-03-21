"use client";

import { useEffect, useState } from "react";
import type { TargetLang } from "@/lib/types";

const TARGET_LANG_KEY = "target_lang";

function isValidTargetLang(value: string | null): value is TargetLang {
  return value === "zh" || value === "en";
}

export function useTargetLang() {
  const [targetLang, setTargetLang] = useState<TargetLang>("zh");

  useEffect(() => {
    const savedLang = localStorage.getItem(TARGET_LANG_KEY);
    if (isValidTargetLang(savedLang)) {
      setTargetLang(savedLang);
    }
  }, []);

  function handleLanguageChange(newLang: TargetLang) {
    if (newLang === targetLang) return;

    setTargetLang(newLang);
    localStorage.setItem(TARGET_LANG_KEY, newLang);
  }

  return {
    targetLang,
    handleLanguageChange,
  };
}