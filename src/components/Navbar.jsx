import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch {
    return null;
  }
}

export default function Navbar() {
  const [me, setMe] = useState(() => getCurrentUser());
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  // 換頁時同步抓最新使用者、關閉下拉
  useEffect(() => {
    setMe(getCurrentUser());
    setOpen(false);
  }, [loc.pathname]);

  // 監聽 localStorage / 自訂事件同步
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "currentUser") setMe(getCurrentUser());
    };
    const onUserChanged = () => setMe(getCurrentUser());
    window.addEventListener("storage", onStorage);
    window.addEventListener("user:changed", onUserChanged);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("user:changed", onUserChanged);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("authToken"); // 記得連 Token 一起清
    localStorage.removeItem("currentUser");
    setMe(null);
    window.dispatchEvent(new Event("user:changed"));
    setOpen(false);
    window.location.href = "/login"; // 登出後跳轉
  };

  const linkStyle = ({ isActive }) => ({
    color: "#fff",
    textDecoration: "none",
    padding: "8px 10px",
    borderRadius: 8,
    fontWeight: 700,
    background: isActive ? "rgba(255,255,255,.16)" : "transparent",
  });

  return (
    <header
      style={{
        // 🔥 使用 CSS 變數，預設值為原本的藍色 (#1367c2)
        background: "var(--brand, #1367c2)", 
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        gap: 16,
        transition: "background 0.3s ease" // 讓顏色切換時有滑順的效果
      }}
    >
      {/* 左：Logo */}
      <Link to="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 800, fontSize: '1.2rem' }}>
        東華 NDHU
      </Link>

      {/* 中：主選單 */}
      <nav style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <NavLink to="/courses" style={linkStyle}>課程評價版</NavLink>
        <NavLink to="/board"   style={linkStyle}>聊天版</NavLink>
        <NavLink to="/market"  style={linkStyle}>買賣版</NavLink>
      </nav>

      {/* 右：登入 / 使用者下拉 */}
      <div style={{ position: "relative" }}>
        {me ? (
          <>
            <button
              onClick={() => setOpen((v) => !v)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,.15)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 18,
                  overflow: 'hidden'
                }}
              >
                {/* 支援 Emoji 或 圖片網址 */}
                {me.avatar_url?.startsWith('http') ? (
                   <img src={me.avatar_url} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                ) : (
                   me.avatar_url || "🙂"
                )}
              </span>
              
              {/* 優先顯示 username */}
              <span>{me.username || me.name || me.student_id || "使用者"}</span>
              
              <span style={{ opacity: 0.8 }}>▾</span>
            </button>

            {open && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  background: "#fff",
                  color: "#333",
                  border: "1px solid #e6e9f2",
                  borderRadius: 10,
                  minWidth: 140,
                  boxShadow: "0 10px 24px rgba(0,0,0,.12)",
                  overflow: "hidden",
                  zIndex: 40,
                }}
              >
                {/* 🔥 修改 1：個人檔案顏色改為 var(--brand) */}
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  style={{
                    display: "block",
                    padding: "10px 15px",
                    textDecoration: "none",
                    // 這裡改成了 var(--brand, #333)
                    color: "var(--brand, #333)", 
                    fontSize: '14px',
                    fontWeight: 'bold' // 我順便加了粗體，讓它跟主題色更搭
                  }}
                >
                  👤 個人檔案
                </Link>

                {/* 積分商店連結 (原本就是好的) */}
                <Link
                  to="/store"
                  onClick={() => setOpen(false)}
                  style={{
                    display: "block",
                    padding: "10px 15px",
                    textDecoration: "none",
                    color: "var(--brand, #2563eb)", 
                    fontSize: '14px',
                    fontWeight: 'bold',
                    background: '#f8fafc'
                  }}
                >
                  ✨ 積分商店
                </Link>

                {/* 🔥 修改 2：使用說明顏色改為 var(--brand) */}
                <Link
                  to="/help"
                  onClick={() => setOpen(false)}
                  style={{
                    display: "block",
                    padding: "10px 15px",
                    textDecoration: "none",
                    // 這裡改成了 var(--brand, #333)
                    color: "var(--brand, #333)", 
                    fontSize: '14px',
                    fontWeight: 'bold' // 同樣加上粗體
                  }}
                >
                  📖 使用說明
                </Link>

                {/* 分隔線 */}
                <div style={{ height: 1, background: "#eee", margin: "4px 0" }} />

                <button
                  onClick={logout}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 15px",
                    border: "none",
                    background: "#fff",
                    cursor: "pointer",
                    color: "#d32f2f",
                    fontSize: '14px'
                  }}
                >
                  🚪 登出
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: "flex", gap: 12 }}>
            <Link to="/login" style={{ color: "#fff", textDecoration: "none" }}>
              登入
            </Link>
            <span>|</span>
            <Link to="/register" style={{ color: "#fff", textDecoration: "none" }}>
              註冊
            </Link>
            <span>|</span>
            <Link to="/help" style={{ color: "#fff", textDecoration: "none" }}>
              說明
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}