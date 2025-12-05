// src/components/HeroBackground.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import "../styles/Hero.css";

export default function HeroBackground() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <>
      {/* 背景圖：從 public/ndhu-hero.jpg 讀取 */}
      <div
        className="hero-bg"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}ndhu-hero.jpg)` }}
        aria-hidden
      />

      {/* 白色半透明遮罩：首頁透明，其他頁面微白 */}
      <div className={`hero-overlay ${isHome ? "" : "dim"}`} aria-hidden />

      {/* 首頁標題（回到首頁會重新 Mount，因此動畫會重新播放） */}
      {isHome && (
        <div className="hero-title" role="heading" aria-level={1}>
          歡迎來到國立東華大學
        </div>
      )}
    </>
  );
}
