// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 🚨 關鍵修正：確保 Vite define 語法正確，避免建構失敗
const RENDER_API_BASE_URL_FULL = 'https://ndhulearn-backend.onrender.com/api';
const RENDER_API_BASE_URL_ROOT = 'https://ndhulearn-backend.onrender.com';


export default defineConfig({
  plugins: [react()], 
  // 👇 最終修正的 define 配置 👇
  define: {
    // 1. 替換 import.meta.env 的值 (標準做法)
    //    這裡的鍵必須是識別符，所以不用引號。
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(RENDER_API_BASE_URL_FULL),
    'process.env.VITE_API_BASE_URL': JSON.stringify(RENDER_API_BASE_URL_FULL),

    // 2. 替換硬編碼字串字面量 (解決 Build Failed 的最終關鍵)
    //    🔑 鍵：使用 JSON.stringify 包裹錯誤的字串。
    //    這告訴編譯器：將程式碼中所有的 "http://localhost:5000/api" 字串替換為新的 URL 字串。
    JSON.stringify("http://localhost:5000/api"): JSON.stringify(RENDER_API_BASE_URL_FULL),
    JSON.stringify("http://localhost:5000"): JSON.stringify(RENDER_API_BASE_URL_ROOT), 
  },
});