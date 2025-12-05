import axios from 'axios';

// 1. 設定基礎網址 (後端的地址)
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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