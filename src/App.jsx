import React from "react";

import { Routes, Route, Navigate, Link } from "react-router-dom";



import Navbar from "./components/Navbar";

import HeroBackground from "./components/HeroBackground";



// ── 板頁 ─────────────────────────────────────────

import CoursesBoard from "./pages/CoursesBoard";

import CourseDetail from "./pages/CourseDetail";



import BoardList from "./pages/BoardList";

import PostEditor from "./pages/PostEditor";



// ── 買賣板 ───────────────────────────────────────

import MarketBoard from "./pages/MarketBoard";

import MarketEditor from "./pages/MarketEditor";

import MarketDetail from "./pages/MarketDetail";



// ── 積分商店 ───────────────────────────────────────

import PointsStore from "./pages/PointsStore";



// ── 帳號 / 受保護頁 ───────────────────────────────

import Profile from "./pages/Profile";

import Login from "./pages/Login";

import Register from "./pages/Register";

import ProtectedRoute from "./ProtectedRoute";

import Forgot from "./pages/Forgot";



// 引入 HelpDisclaimer

import HelpDisclaimer from "./pages/HelpDisclaimer";



// ── 文章詳頁 (聊天版) ─────────────────────────────

import PostDetail from "./pages/PostDetail";



// ── NDHU 卡通場景頁 ──────────────────────────────

import NdhuScene from "./pages/NdhuScene";



// 🔥🔥🔥 新增：主題套用小工具 🔥🔥🔥

// 解析 JSON 並設定 CSS 變數 (例如 --brand: #ff0000)

const applyTheme = (themeJson) => {

  if (!themeJson) {

    // 如果沒有主題，移除變數 (恢復預設藍色)

    document.documentElement.style.removeProperty('--brand');

    document.documentElement.style.removeProperty('--brand2');

    return;

  }

  try {

    const vars = JSON.parse(themeJson);

    Object.keys(vars).forEach(key => {

      document.documentElement.style.setProperty(key, vars[key]);

    });

  } catch (e) {

    console.error("主題解析失敗", e);

  }

};



// 首頁

function Home() {

  return (

    <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>

      <Link to="/ndhu" className="btn-primary" style={{ fontSize: 18 }}>

        進入東華卡通場景

      </Link>

    </div>

  );

}



export default function App() {

 

  // 🔥🔥🔥 新增：主題監聽引擎 🔥🔥🔥

  // 當 App 啟動或使用者切換帳號/裝備時，自動更新全站顏色

  React.useEffect(() => {

    const syncTheme = () => {

      try {

        const u = JSON.parse(localStorage.getItem("currentUser") || "null");

        // 如果使用者有 themeStyles (後端回傳的)，就套用

        if (u && u.themeStyles) {

          applyTheme(u.themeStyles);

        } else {

          applyTheme(null); // 恢復預設

        }

      } catch (e) {}

    };



    // 1. 初始化執行一次 (確保F5重新整理後顏色還在)

    syncTheme();



    // 2. 監聽全域事件 (登入/登出/裝備變更時觸發)

    window.addEventListener("user:changed", syncTheme);

    return () => window.removeEventListener("user:changed", syncTheme);

  }, []);



  return (

    <>

      <HeroBackground />

      <Navbar />



      <main style={{ padding: "1.25rem 1rem" }}>

        <Routes>

          {/* 首頁 */}

          <Route path="/" element={<Home />} />



          {/* 四大板 (課程) */}

          <Route path="/courses" element={<CoursesBoard />} />

          <Route path="/courses/:id" element={<CourseDetail />} />



          {/* 聊天版 */}

          <Route path="/board" element={<BoardList />} />

          <Route path="/board/:id" element={<PostDetail />} />

          <Route

            path="/board/new"

            element={

              <ProtectedRoute>

                <PostEditor />

              </ProtectedRoute>

            }

          />



          {/* 買賣板 */}

          <Route path="/market" element={<MarketBoard />} />

          <Route path="/market/posts/:id" element={<MarketDetail />} />

          <Route

            path="/market/new"

            element={

              <ProtectedRoute>

                <MarketEditor />

              </ProtectedRoute>

            }

          />



          {/* 積分商店路由 */}

          <Route path="/store" element={<PointsStore />} />



          {/* 個人檔案（需登入） */}

          <Route

            path="/profile"

            element={

              <ProtectedRoute>

                <Profile />

              </ProtectedRoute>

            }

          />



          {/* 帳號 */}

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route path="/forgot" element={<Forgot />} />



          {/* 使用說明頁面路由 */}

          <Route path="/help" element={<HelpDisclaimer />} />



          {/* NDHU 場景 */}

          <Route path="/ndhu" element={<NdhuScene />} />



          {/* 兜底 */}

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>

      </main>

    </>

  );

}