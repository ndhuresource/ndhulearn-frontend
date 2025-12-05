import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * 需登入的路由外層：
 * - 讀 localStorage currentUser
 * - 沒登入就導到 /login，並帶 state.from 以便回跳
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const current = JSON.parse(localStorage.getItem("currentUser") || "null");
  if (!current) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
