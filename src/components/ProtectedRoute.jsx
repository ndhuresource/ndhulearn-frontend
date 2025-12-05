import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "../utils/db";

/**
 * 只要 localStorage 沒有 currentUser 就導去 /login
 * 並透過 state.from 記住原本想去的路由，登入後自動返回
 */
export default function ProtectedRoute({ children }) {
  const user = getCurrentUser(); // 每次即時從 localStorage 取，避免舊 state
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
