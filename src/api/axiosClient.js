import axios from 'axios';

// 🚨 修正：確保基礎 URL 優先使用 Vercel 的 HTTPS 地址

// 1. 定義 Render 的正式 URL (使用 HTTPS)
const RENDER_API_URL = 'https://ndhulearn-backend.onrender.com/api';

// 2. 判斷基礎 URL：
//    - 如果當前環境是部署的網站 (即 Vercel/Render)，強制使用 RENDER_API_URL。
//    - 否則，使用 Vite 提供的環境變數 (在本地開發時會是 localhost)。
const baseUrl = (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('onrender.com'))
    ? RENDER_API_URL 
    : import.meta.env.VITE_API_BASE_URL;


const axiosClient = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. 攔截器：每次發送請求前，自動把 Token 加上去
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