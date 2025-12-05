// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 🚨 關鍵修正：這是最終手段，直接在編譯時替換錯誤的硬編碼字串
const RENDER_API_BASE_URL = 'https://ndhulearn-backend.onrender.com/api';

export default defineConfig({
  plugins: [react()], 
  // 👇 新增 define 配置 👇
  define: {
    // 讓 Vite 在編譯時，將程式碼中所有出現的 'http://localhost:5000' 字串
    // 強制替換為 Render 的正確 URL。
    'process.env.VITE_API_BASE_URL': JSON.stringify(RENDER_API_BASE_URL),
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(RENDER_API_BASE_URL),
    // 這是最關鍵的一步：直接替換硬編碼的錯誤字串，以防某處未被捕捉
    'http://localhost:5000': JSON.stringify('https://ndhulearn-backend.onrender.com'),
    'http://localhost:5000/api': JSON.stringify(RENDER_API_BASE_URL),
  },
  // ⬆️ 新增 define 配置 ⬆️
});