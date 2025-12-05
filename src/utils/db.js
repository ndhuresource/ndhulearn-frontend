// src/utils/db.js
// ------------------------------------------------------------
// LocalStorage 小型資料庫：統一 key 與 JSON 存取
// ------------------------------------------------------------

const KEY = {
  USERS: "users",
  CURRENT: "currentUser",
  POSTS: "posts",      // 聊天板 / 買賣板 共用：每篇有 board = "chat" | "market"
  COURSES: "courses",  // 課程評價板
};

// 讀寫工具（內部使用）
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const val = JSON.parse(raw);
    return val ?? fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ------------------------------------------------------------
// 使用者 User
// 結構範例：
// {
//   id: "u_1712345678900",
//   studentId: "410812345",
//   email: "410812345@gms.ndhu.edu.tw",
//   displayName: "花蓮小狐狸",
//   avatar: "🦊",
//   password: "xxxx",
//   emailVerified: true,
//   createdAt: 1712345678900
// }
// ------------------------------------------------------------

export function getUsers() {
  const arr = loadJSON(KEY.USERS, []);
  return Array.isArray(arr) ? arr : [];
}

export function setUsers(users) {
  if (!Array.isArray(users)) throw new Error("setUsers: users must be an array");
  saveJSON(KEY.USERS, users);
}

export function getCurrentUser() {
  const u = loadJSON(KEY.CURRENT, null);
  return u ?? null;
}

export function setCurrentUser(user) {
  // 允許 null? 一律要求物件
  if (!user || typeof user !== "object") throw new Error("setCurrentUser: user must be an object");
  saveJSON(KEY.CURRENT, user);
}

export function logoutCurrentUser() {
  localStorage.removeItem(KEY.CURRENT);
}

// ------------------------------------------------------------
// 文章（聊天板 / 買賣板）Posts
// 結構範例（共用）：
// {
//   id: "p_1712345678900",
//   board: "chat" | "market",
//   title: "標題",
//   content: "內文",
//   authorId: "u_xxx" | null,
//   authorName: "匿名" | "暱稱",
//   authorAvatar: "👤" | "🦊",
//   anonymous: true/false,
//   createdAt: 1712345678900,
//   deleted: false,
//   // 買賣板額外欄位：
//   tradeType: "出售" | "徵求",
//   price: 500,
//   comments: [
//     {
//       id: "c_171234...",
//       content: "留言文字或（已刪除）",
//       authorId, authorName, authorAvatar, anonymous, createdAt, deleted
//     }
//   ]
// }
// ------------------------------------------------------------

export function getPosts() {
  const arr = loadJSON(KEY.POSTS, []);
  return Array.isArray(arr) ? arr : [];
}

export function setPosts(posts) {
  if (!Array.isArray(posts)) throw new Error("setPosts: posts must be an array");
  saveJSON(KEY.POSTS, posts);
}

// ------------------------------------------------------------
// 課程評價板 Courses
// 結構範例：
// {
//   id: "c_1712345678900",
//   name: "微積分（一）",
//   teacher: "王OO",
//   subject: "通識" | "資訊工程學系" | ...,
//   grade: "大一" | "大二" | "大三" | "大四" | "碩一" | "碩二",
//   createdBy: "u_xxx" | null,
//   createdAt: 1712345678900,
//   deleted: false,
//   reviews: [
//     { id:"r_...", rating:5, comment:"", authorId, authorName, authorAvatar, anonymous, createdAt, deleted }
//   ],
//   materials: [
//     { id:"m_...", type:"考古題"|"筆記", title, url, text, authorId, authorName, authorAvatar, anonymous, createdAt, deleted }
//   ]
// }
// ------------------------------------------------------------

export function getCourses() {
  const arr = loadJSON(KEY.COURSES, []);
  return Array.isArray(arr) ? arr : [];
}

export function setCourses(list) {
  if (!Array.isArray(list)) throw new Error("setCourses: list must be an array");
  saveJSON(KEY.COURSES, list);
}

/**
 * 建立一門新課程（不直接存入 localStorage，交由呼叫方決定是否 setCourses）
 * 若你希望「建立後自動存入」，可改用 createCourseAndSave。
 */
export function createCourse({ name, teacher, subject, grade, createdBy }) {
  const now = Date.now();
  return {
    id: `c_${now}`,
    name: String(name || "").trim(),
    teacher: String(teacher || "").trim(),
    subject: String(subject || "").trim(),
    grade: String(grade || "").trim(),
    createdBy: createdBy ?? null,
    createdAt: now,
    deleted: false,
    reviews: [],
    materials: [],
  };
}

/**
 * （可選）立即建立並存入
 * 用法：
 *   const course = createCourseAndSave({ ... });
 *   // 會回傳新課程物件
 */
export function createCourseAndSave(payload) {
  const list = getCourses();
  const item = createCourse(payload);
  list.push(item);
  setCourses(list);
  return item;
}

// ------------------------------------------------------------
// 其他：可視需要擴充（如資料重置、初始化等）
// ------------------------------------------------------------

export function resetAllData() {
  // 謹慎使用：清掉所有我們管理的 key
  localStorage.removeItem(KEY.USERS);
  localStorage.removeItem(KEY.CURRENT);
  localStorage.removeItem(KEY.POSTS);
  localStorage.removeItem(KEY.COURSES);
}

export function migrateEnsureArrays() {
  // 若早期資料不是陣列，這裡強制修正
  ["USERS", "POSTS", "COURSES"].forEach((k) => {
    const val = loadJSON(KEY[k], null);
    if (val !== null && !Array.isArray(val)) {
      saveJSON(KEY[k], []);
    }
  });
}
