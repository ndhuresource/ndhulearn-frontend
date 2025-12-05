import axiosClient from '../api/axiosClient';

export const courseService = {
  // 1. 取得學院與科系結構 
  getColleges: async () => {
    const response = await axiosClient.get('/colleges');
    return response.data; // 回傳包含科系的學院陣列
  },

  // 2. 取得課程列表 (支援 搜尋/科系/學制/排序)
  getCourses: async ({ search, department, group, level, type, sort, page } = {}) => {
    const params = {
      search,
      department,
      group,
      course_level: level,
      course_type: type, // 傳送必修/選修
      sort,
      page
    };
    const response = await axiosClient.get('/courses', { params });
    return response.data;
  },

  // 3. 建立新課程
  createCourse: async (courseData) => {
    // courseData = { id, name, courseLevel, departmentId, type }
    const response = await axiosClient.post('/courses', courseData);
    return response.data;
  },

  // 4. 取得單門課程詳情 (包含資源列表)
  getCourseById: async (id) => {
    const response = await axiosClient.get(`/courses/${id}`);
    return response.data;
  },

  // 5. 上傳資源
  uploadResource: async (resourceData) => {
    const response = await axiosClient.post('/resources', resourceData);
    return response.data;
  },

  // 下載資源
  downloadResource: async (id) => {
    const response = await axiosClient.post(`/resources/${id}/download`);
    return response.data;
  },

  // 🔥 6. 刪除資源功能
  deleteResource: async (resourceId) => {
    const response = await axiosClient.delete(`/resources/${resourceId}`);
    return response.data;
  },

  // 提交評價
  submitRating: async (ratingData) => {
    const response = await axiosClient.post('/ratings', ratingData);
    return response.data;
  },

  // 🔥 7. 新增：刪除評價功能
  deleteRating: async (ratingId) => {
    const response = await axiosClient.delete(`/ratings/${ratingId}`);
    return response.data;
  },

  // 8. 查看/下載資源
  getResourceById: async (id) => {
    const response = await axiosClient.get(`/resources/${id}`);
    return response.data;
  }
};