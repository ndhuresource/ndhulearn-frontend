// src/services/resourceService.js
import axios from 'axios';

// 設定你的後端網址 (請確認你的後端是否跑在 3000 port)
const API_URL = 'http://localhost:5000/api/resources';

// 取得 Token 的小幫手 (從 LocalStorage 拿)
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const resourceService = {
  // 1. 上傳資源 (傳送 FormData)
  upload: async (formData) => {
    // axios 會自動偵測 FormData 並設定正確的 Content-Type
    const response = await axios.post(API_URL, formData, {
      headers: { ...getAuthHeader() }
    });
    return response.data;
  },

  // 2. 獲取下載連結
  // 前端呼叫這個方法，後端會回傳一個 Cloudinary 的網址
  getDownloadUrl: async (resourceId) => {
    const response = await axios.get(`${API_URL}/${resourceId}/download`, {
      headers: { ...getAuthHeader() }
    });
    return response.data; // 回傳格式: { downloadUrl: "https://...", fileName: "..." }
  }
};