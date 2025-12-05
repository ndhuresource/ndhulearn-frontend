// src/utils/user.js
import { getCurrentUser as getDbUser, setCurrentUser as setDbUser, getUsers, setUsers } from "./db";

// 重新匯出 getCurrentUser，讓頁面可以直接用
export function getCurrentUser() {
  return getDbUser();
}

/**
 * 購買商品
 * @param {object} params { type: "avatars"|"frames"..., id: "item_id", cost: 100 }
 */
export function purchaseItem({ type, id, cost }) {
  const me = getDbUser();
  if (!me) return { ok: false, reason: "not_login" };

  // 1. 初始化欄位 (如果使用者資料是舊的，可能沒有 points 或 inventory)
  const points = me.points || 0;
  
  // 對應的解鎖清單欄位名稱，例如 unlockedAvatars
  const unlockKey = `unlocked${type.charAt(0).toUpperCase() + type.slice(1)}`; 
  const unlocked = Array.isArray(me[unlockKey]) ? me[unlockKey] : [];

  // 2. 檢查是否已擁有
  if (unlocked.includes(id)) {
    return { ok: false, reason: "owned" };
  }

  // 3. 檢查錢夠不夠
  if (points < cost) {
    return { ok: false, reason: "no_points" };
  }

  // 4. 執行購買：扣錢 + 加入清單
  const nextUser = {
    ...me,
    points: points - cost,
    [unlockKey]: [...unlocked, id],
  };

  // 5. 存檔 (更新 CurrentUser 和 Users 列表)
  updateUserInStorage(nextUser);

  return { ok: true, left: nextUser.points };
}

/**
 * 裝備商品
 * @param {object} params { type: "avatars"|"frames"..., id: "item_id" }
 */
export function equipItem({ type, id }) {
  const me = getDbUser();
  if (!me) return { ok: false };

  // 設定對應的欄位，例如 avatarId, frameId
  // 這裡稍微做個轉換： avatars -> avatarId
  let field = "";
  if (type === "avatars") field = "avatarId";
  else if (type === "frames") field = "frameId";
  else if (type === "badges") field = "badgeId";
  else if (type === "themes") field = "themeId";
  
  if (!field) return { ok: false };

  const nextUser = {
    ...me,
    [field]: id
  };

  updateUserInStorage(nextUser);
  return { ok: true };
}

// 內部小工具：同時更新 CurrentUser 和 Users 陣列中的那一筆資料
function updateUserInStorage(newUser) {
  // 1. 更新當前使用者
  setDbUser(newUser);

  // 2. 更新使用者列表中的那一筆 (同步)
  const allUsers = getUsers();
  const index = allUsers.findIndex(u => u.email === newUser.email); // 假設用 email 辨識
  if (index !== -1) {
    allUsers[index] = newUser;
    setUsers(allUsers);
  }

  // 3. 發送事件通知頁面更新 (讓 UI 立即反應)
  window.dispatchEvent(new Event("user:changed"));
}