// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 🚨 關鍵修正：這是最終手段，直接在編譯時替換錯誤的硬編碼字串
const RENDER_API_BASE_URL_FULL = 'https://ndhulearn-backend.onrender.com/api';
const RENDER_API_BASE_URL_ROOT = 'https://ndhulearn-backend.onrender.com';


export default defineConfig({
  plugins: [react()], 
  // 👇 最終的 define 配置 👇
  define: {
    // 1. 替換完整的 URL
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(RENDER_API_BASE_URL_FULL),
    'process.env.VITE_API_BASE_URL': JSON.stringify(RENDER_API_BASE_URL_FULL),

    // 2. 替換硬編碼的錯誤字串 (關鍵)
    // 程式碼中只要有 'http://localhost:5000' 字串，都會被替換
    '"http://localhost:5000/api"': JSON.stringify(RENDER_API_BASE_URL_FULL),
    '"http://localhost:5000"': JSON.stringify(RENDER_API_BASE_URL_ROOT), 
  },
  // ⬆️ 最終的 define 配置 ⬆️
});