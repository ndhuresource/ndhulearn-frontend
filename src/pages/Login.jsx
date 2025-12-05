import React, { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { authService } from "../services/authService"; // 引入我們寫好的服務

import "../styles/Auth.css";



export default function Login() {

  const [sid, setSid] = useState("");

  const [pwd, setPwd] = useState("");

  const [isLoading, setIsLoading] = useState(false); // 增加讀取狀態

  const navigate = useNavigate();



  const submit = async (e) => {

    e.preventDefault();

   

    // 🔥 修改 1：驗證邏輯改成「允許英文與數字」，不再只是 \d (純數字)

    if (!/^[a-zA-Z0-9]{9}$/.test(sid)) return alert("請輸入 9 位學號");

    if (!pwd) return alert("請輸入密碼");



    setIsLoading(true); // 開始讀取，鎖住按鈕



    try {

      // 呼叫後端 API

      await authService.login(sid, pwd);

     

      // 成功後跳轉回首頁

      alert("登入成功！");

      navigate("/");

     

    } catch (error) {

      console.error(error);

      // 抓取後端回傳的錯誤訊息

      const msg = error.response?.data?.message || "登入失敗，請檢查帳號密碼";

      alert(msg);

    } finally {

      setIsLoading(false); // 結束讀取

    }

  };



  return (

    <div className="auth-container">

      <h2>登入</h2>

      <form onSubmit={submit} className="auth-form">

        <label className="auth-label">學號（9 碼）</label>

        <div className="inline-email">

          <input

            type="text" // 🔥 修改 2：改為 text，避免手機跳出純數字鍵盤無法輸入英文

            maxLength={9}

            placeholder="輸入 9 位學號"

            value={sid}

            // 🔥 修改 3：允許輸入英文與數字，並自動轉大寫 (411b -> 411B)

            onChange={(e) => setSid(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 9))}

            disabled={isLoading} // 登入中禁止輸入

          />

          <span className="inline-domain">@gms.ndhu.edu.tw</span>

        </div>



        <label className="auth-label">密碼</label>

        <input

          type="password"

          placeholder="密碼"

          value={pwd}

          onChange={(e) => setPwd(e.target.value)}

          disabled={isLoading}

          // 🔥 修改 4：加入 style 強制寬度 100%，解決對齊問題

          style={{ width: "100%", boxSizing: "border-box" }}

        />



        <button type="submit" className="auth-primary" disabled={isLoading}>

          {isLoading ? "登入中..." : "登入"}

        </button>

       

        <div className="auth-links">

          <Link to="/register">沒有帳號？前往註冊</Link>

          <span>　|　</span>

          <Link to="/forgot">忘記密碼？</Link>

        </div>

      </form>

    </div>

  );

}