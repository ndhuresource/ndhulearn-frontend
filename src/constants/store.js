// src/constants/store.js

export const CATALOG = {
  // 1. 頭貼 (Avatars)
  avatars: [
    { id: "smile", name: "基本笑臉", cost: 0, fallback: "🙂" },
    { id: "cool", name: "酷墨鏡", cost: 50, fallback: "😎" },
    { id: "love", name: "戀愛中", cost: 100, fallback: "😍" },
    { id: "cat", name: "貓咪", cost: 150, fallback: "🐱" },
    { id: "dog", name: "狗狗", cost: 150, fallback: "🐶" },
    { id: "fox", name: "神秘狐狸", cost: 300, fallback: "🦊" },
    { id: "robot", name: "機器人", cost: 500, fallback: "🤖" },
    { id: "alien", name: "外星人", cost: 1000, fallback: "👽" },
  ],

  // 2. 外框 (Frames) - 這裡用 CSS box-shadow 模擬
  frames: [
    { id: "none", name: "無外框", cost: 0, css: "none" },
    { id: "simple", name: "簡約灰", cost: 50, css: "0 0 0 4px #cbd5e1" },
    { id: "gold", name: "黃金光輝", cost: 500, css: "0 0 0 4px #fbbf24, 0 0 10px #fbbf24" },
    { id: "neon", name: "霓虹藍", cost: 800, css: "0 0 0 3px #3b82f6, 0 0 15px #3b82f6" },
    { id: "danger", name: "危險氣息", cost: 1200, css: "0 0 0 4px #ef4444, 0 0 20px #ef4444" },
  ],

  // 3. 徽章 (Badges)
  badges: [
    { id: "newbie", name: "新手上路", cost: 0, emoji: "🔰", tip: "剛加入的證明" },
    { id: "rich", name: "大富翁", cost: 2000, emoji: "💰", tip: "積分很多的人" },
    { id: "star", name: "超級巨星", cost: 5000, emoji: "🌟", tip: "閃亮亮的存在" },
    { id: "king", name: "管理員氣場", cost: 9999, emoji: "👑", tip: "雖然不是真的管理員" },
  ],

  // 4. 主題 (Themes) - 改變顏色變數
  themes: [
    { id: "default", name: "預設藍", cost: 0, vars: { "--brand": "#216fff", "--brand2": "#2a7bff" } },
    { id: "pink", name: "粉紅泡泡", cost: 300, vars: { "--brand": "#ec4899", "--brand2": "#f472b6" } },
    { id: "dark", name: "暗夜黑", cost: 600, vars: { "--brand": "#1e293b", "--brand2": "#334155" } },
    { id: "green", name: "森林綠", cost: 600, vars: { "--brand": "#16a34a", "--brand2": "#22c55e" } },
  ]
};