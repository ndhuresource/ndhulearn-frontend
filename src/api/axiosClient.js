import axios from 'axios';

// 🚨 最終修正：完全忽略 VITE_API_BASE_URL，強制使用正確的生產 URL。
// 這是唯一能繞過建構時被錯誤值覆蓋的方法。

// 1. 定義 Render 的正式 URL (使用 HTTPS)
const RENDER_API_URL = 'https://ndhulearn-backend.onrender.com/api';

// 2. 判斷基礎 URL：
//    - 如果是本地開發環境 (Vite Dev Server)，使用 VITE 的變數。
//    - 如果是部署環境 (Vercel)，**強制使用 RENDER_API_URL**。

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const baseUrl = isLocalhost 
    ? import.meta.env.VITE_API_BASE_URL // 本地開發時使用本地配置
    : RENDER_API_URL; // 部署到 Vercel/Render 時，強制使用 HTTPS 網址

const axiosClient = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. 攔截器：每次發送請求前，自動把 Token 加上去 (保持不變)
axiosClient.interceptors.request.use(
  (config) => {
    // 從 localStorage 拿出 Token
    const token = localStorage.getItem('authToken');
    
    // 如果有 Token，就加到 Header 裡面
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;

// 👇 新增：導出基礎 URL，供其他組件使用
export const API_BASE_URL = baseUrl;