import axiosClient from '../api/axiosClient';

// 輔助函式，用來取得 Header 中的 Token
const authHeader = () => {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  }
  return {};
};

export const forumService = {
  // 🔥 1. 修改：取得貼文列表 (支援搜尋與排序)
  getPosts: async (search = '', sort = 'newest') => {
    // 將搜尋關鍵字與排序方式一起放入參數
    const params = { search, sort };
    const response = await axiosClient.get('/forum/posts', { params });
    return response.data;
  },

  // 2. 取得單篇貼文詳情 (包含留言、投票選項)
  getPostById: async (id) => {
    const response = await axiosClient.get(`/forum/posts/${id}`);
    return response.data;
  },

  // 3. 發布新貼文 (支援圖片、匿名、投票)
  createPost: async (title, content, pollOptions, isAnonymous, imageFile) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('isAnonymous', isAnonymous); 

    if (imageFile) {
      formData.append('image', imageFile);
    }

    if (pollOptions && Array.isArray(pollOptions) && pollOptions.length > 0) {
      formData.append('pollOptions', JSON.stringify(pollOptions));
    }

    const response = await axiosClient.post('/forum/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...authHeader() 
      },
    });
    return response.data;
  },

  // 4. 新增留言 (修正匿名無效的問題)
  addComment: async (postId, content, isAnonymous) => {
    const body = { 
      content, 
      is_anonymous: isAnonymous,
      isAnonymous: isAnonymous 
    };

    const response = await axiosClient.post(`/forum/posts/${postId}/comments`, body);
    return response.data;
  },

  // 5. 投票功能
  votePoll: async (optionId) => {
    const response = await axiosClient.post('/forum/vote', { optionId });
    return response.data;
  },

  // 6. 點讚功能
  toggleLike: async (postId) => {
    const response = await axiosClient.post(`/forum/posts/${postId}/like`);
    return response.data;
  },

  // 7. 刪除貼文功能
  deletePost: async (postId) => {
    const response = await axiosClient.delete(`/forum/posts/${postId}`);
    return response.data;
  },

  // 8. 刪除留言功能 (對應頁面上的垃圾桶按鈕)
  deleteComment: async (commentId) => {
    const response = await axiosClient.delete(`/forum/comments/${commentId}`);
    return response.data;
  }
};