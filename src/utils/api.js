// src/utils/api.js
import { getCurrentUser } from "./db";

// 模擬網路延遲 (讓感覺比較像真的在跟伺服器溝通)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const authApi = {
  // 取得當前使用者資料 (模擬從後端資料庫讀取)
  me: async () => {
    await delay(300); // 假裝讀取中...
    
    const user = getCurrentUser();
    if (!user) {
      // 如果沒登入，拋出一個類似 HTTP 401 的錯誤
      const error = new Error("未登入");
      error.status = 401;
      throw error;
    }
    
    return user; // 回傳最新的使用者資料 (包含積分)
  },

  // 如果未來有登入/註冊 API 也可以寫在這裡
  login: async (credentials) => {
    // ...
  }
};

export const profileApi = {
  // 如果未來有簽到 API 也可以寫在這裡
  checkin: async () => {
    // ...
  }
};