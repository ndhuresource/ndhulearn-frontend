// src/i18n/I18nContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

export const LANG_OPTIONS = [
  { code: "zh", label: "中文" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "ja", label: "日本語" },
];

const translations = {
  zh: {
    "hero.title": "歡迎來到國立東華大學",
    "nav.courses": "課程評價板",
    "nav.board": "聊天板",
    "nav.games": "遊戲板",
    "nav.market": "買賣板",
    "nav.profile": "個人檔案",
    "nav.login": "登入",
    "nav.logout": "登出",
    "profile.lang": "介面語言",
  },
  en: {
    "hero.title": "Welcome to National Dong Hwa University",
    "nav.courses": "Course Reviews",
    "nav.board": "Board",
    "nav.games": "Games",
    "nav.market": "Marketplace",
    "nav.profile": "Profile",
    "nav.login": "Login",
    "nav.logout": "Logout",
    "profile.lang": "Language",
  },
  fr: {
    "hero.title": "Bienvenue à l'Université Nationale Dong Hwa",
    "nav.courses": "Évaluations des cours",
    "nav.board": "Forum",
    "nav.games": "Jeux",
    "nav.market": "Marché",
    "nav.profile": "Profil",
    "nav.login": "Connexion",
    "nav.logout": "Déconnexion",
    "profile.lang": "Langue",
  },
  ja: {
    "hero.title": "国立東華大学へようこそ",
    "nav.courses": "授業評価板",
    "nav.board": "掲示板",
    "nav.games": "ゲーム",
    "nav.market": "マーケット",
    "nav.profile": "プロフィール",
    "nav.login": "ログイン",
    "nav.logout": "ログアウト",
    "profile.lang": "言語",
  },
};

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState("zh");

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved) setLang(saved);
  }, []);

  const t = (key) => translations[lang]?.[key] || key;

  const changeLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  return (
    <I18nContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
