import axios from 'axios';

// 🔥 強制指定後端網址 (確保是 5000)
const API_URL = 'http://localhost:5000/api/marketplace';

// 取得 Token 的小工具
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  // 注意：有些系統存的是 "currentUser" 物件，如果你是用 currentUser，請確保這裡邏輯正確
  // 如果你的 Token 是存在 currentUser 裡面的話，請改成這樣：
  // const user = JSON.parse(localStorage.getItem("currentUser"));
  // return user && user.token ? { Authorization: `Bearer ${user.token}` } : {};
  
  // 按照你原本的寫法：
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 為了保險起見，增加一個相容的 Header 取得方式 (針對論壇那邊的寫法)
const getSafeAuthHeader = () => {
  const tokenStr = localStorage.getItem('authToken');
  if (tokenStr) return { Authorization: `Bearer ${tokenStr}` };

  const userStr = localStorage.getItem('currentUser');
  if (userStr) {
    const user = JSON.parse(userStr);
    if (user.token) return { Authorization: `Bearer ${user.token}` };
  }
  return {};
};

export const marketplaceService = {
  // 1. 取得貼文列表
  getPosts: async (params = {}) => {
    const response = await axios.get(`${API_URL}/posts`, { params });
    return response.data;
  },

  // 2. 取得單篇詳情
  getPostById: async (id) => {
    const response = await axios.get(`${API_URL}/posts/${id}`);
    return response.data;
  },

  // 3. 發布新貼文
  createPost: async (postData) => {
    const response = await axios.post(`${API_URL}/posts`, postData, {
      headers: { ...getSafeAuthHeader() } 
    });
    return response.data;
  },

  // 4. 標記已售出
  markAsSold: async (id) => {
    const response = await axios.patch(`${API_URL}/posts/${id}/sold`, {}, {
      headers: { ...getSafeAuthHeader() }
    });
    return response.data;
  },

  // 5. 留言 (包含匿名參數)
  addComment: async (id, content, isAnonymous) => {
    const response = await axios.post(`${API_URL}/posts/${id}/comments`, 
      { content, isAnonymous }, 
      { headers: { ...getSafeAuthHeader() } }
    );
    return response.data;
  },

  // 🔥 6. 新增：刪除留言功能
  deleteComment: async (commentId) => {
    const response = await axios.delete(`${API_URL}/comments/${commentId}`, { 
      headers: { ...getSafeAuthHeader() } 
    });
    return response.data;
  }
};