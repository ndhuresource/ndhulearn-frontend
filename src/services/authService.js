import axiosClient from '../api/axiosClient';

export const authService = {
  // 1. 登入
  login: async (studentId, password) => {
    const response = await axiosClient.post('/auth/login', {
      studentId,
      password
    });
    
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));
      window.dispatchEvent(new Event("user:changed"));
    }
    
    return response.data;
  },

  // 2. 發送註冊驗證碼 (新增這個函數！)
  sendCode: async (email, username) => {
    // 呼叫後端 /api/auth/send-code
    const response = await axiosClient.post('/auth/send-code', { email, username });
    return response.data;
  },

  // 3. 註冊 (提交資料 + 驗證碼)
  register: async (registerData) => {
    // registerData 包含: { studentId, username, email, password, code }
    const response = await axiosClient.post('/auth/register', registerData);
    return response.data;
  },

  // 4. 登出
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.dispatchEvent(new Event("user:changed"));
    window.location.href = "/login"; // 建議登出後強制跳轉
  }
};