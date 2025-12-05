// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../utils/db";
import "./Navbar.css";

export default function Navbar() {
  const [user, setUser] = useState(getCurrentUser());
  const nav = useNavigate();

  // 監聽 localStorage 變化，讓頭像/名字即時更新
  useEffect(() => {
    const syncUser = () => setUser(getCurrentUser());
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    nav("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">東華 NDHU</Link>
      <div className="nav-links">
        <Link to="/courses">課程評價板</Link>
        <Link to="/board">聊天板</Link>
        <Link to="/games">遊戲板</Link>
        <Link to="/market">買賣板</Link>
      </div>
      <div className="nav-user">
        {user ? (
          <div className="dropdown">
            <span className="avatar">{user.avatar}</span>
            <span className="name">{user.name}</span>
            <div className="dropdown-content">
              <Link to="/profile">個人檔案</Link>
              <button onClick={handleLogout}>登出</button>
            </div>
          </div>
        ) : (
          <Link to="/login" className="btn-login">登入</Link>
        )}
      </div>
    </nav>
  );
}
