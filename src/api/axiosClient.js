import axios from 'axios';

// 🚨 修正：確保基礎 URL 不會遺失或指向 localhost
// Vercel 部署時，應該讀取到 HTTPS 的 Render URL
const defaultApiUrl = 'https://ndhulearn-backend.onrender.com/api'; 
const baseUrl = import.meta.env.VITE_API_BASE_URL || defaultApiUrl;

const axiosClient = axios.create({
  baseURL: baseUrl, // 使用已經檢查過的 baseUrl
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