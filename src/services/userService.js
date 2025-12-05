import axiosClient from '../api/axiosClient';

export const userService = {
  // ── 個人檔案相關 ──

  // 1. 取得個人資料
  getProfile: async () => {
    const response = await axiosClient.get('/profile/me');
    return response.data.data; 
  },

  // 2. 更新個人資料 (名字、頭貼、密碼)
  updateProfile: async (data) => {
    // 這裡我們統一呼叫更新頭貼/資料的接口
    // 如果你後端有分開寫，這裡可能要根據 data 內容判斷呼叫哪一個
    // 暫時假設 /profile/avatar 負責處理頭貼更新
    const response = await axiosClient.put('/profile/avatar', data); 
    return response.data;
  },
  
  // 3. 簽到
  checkIn: async () => {
    const response = await axiosClient.post('/points/checkin');
    return response.data;
  },

  // ── 🔥 新增：商店相關功能 (對應後端 routes/shop.js) ──

  // 4. 取得商店商品列表 (GET /api/shop/items)
  getShopItems: async () => {
    // 假設你在 app.js 設定路由是 app.use('/api/shop', shopRoutes)
    const response = await axiosClient.get('/shop/items');
    return response.data; // 預期回傳 { success: true, data: [...] }
  },

  // 5. 購買商品 (POST /api/shop/buy)
  purchaseItem: async (itemId) => {
    // 傳送 { itemId: 1 } 給後端
    const response = await axiosClient.post('/shop/buy', { itemId });
    return response.data; // 預期回傳 { success: true, message: "..." }
  },

  // 6. 取得我的背包/已擁有商品 (GET /api/shop/inventory)
  getInventory: async () => {
    const response = await axiosClient.get('/shop/inventory');
    return response.data; // 預期回傳 { success: true, data: [...] }
  }
};