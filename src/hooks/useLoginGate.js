// src/hooks/useLoginGate.js
import { useNavigate } from "react-router-dom";

export default function useLoginGate() {
  const nav = useNavigate();

  // 取得當前登入使用者（localStorage.currentUser）
  const getUser = () => {
    try { return JSON.parse(localStorage.getItem("currentUser") || "null"); }
    catch { return null; }
  };

  // 呼叫此函式以確保登入；未登入會導到 /login
  return function ensureLogin() {
    const u = getUser();
    if (u) return u;
    const ok = window.confirm("需要先登入才能進行此操作，要前往登入嗎？");
    if (ok) nav("/login");
    return null;
  };
}
