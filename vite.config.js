// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 🚨 關鍵修正：確保 Vite define 語法正確，避免建構失敗
const RENDER_API_BASE_URL_FULL = 'https://ndhulearn-backend.onrender.com/api';
const RENDER_API_BASE_URL_ROOT = 'https://ndhulearn-backend.onrender.com';


export default defineConfig({
  plugins: [react()], 
  // 👇 修正後的 define 配置 👇
  define: {
    // 1. 替換 import.meta.env 的值 (確保變數讀取正確)
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(RENDER_API_BASE_URL_FULL),
    'process.env.VITE_API_BASE_URL': JSON.stringify(RENDER_API_BASE_URL_FULL),

    // 2. 替換硬編碼字串字面量 (關鍵修正: 使用單引號包裹整個鍵)
    //    這能確保 Vite 在解析配置檔時不會因為引號嵌套而失敗。
    "'http://localhost:5000/api'": JSON.stringify(RENDER_API_BASE_URL_FULL),
    "'http://localhost:5000'": JSON.stringify(RENDER_API_BASE_URL_ROOT), 
  },
  // ⬆️ 修正後的 define 配置 ⬆️
});