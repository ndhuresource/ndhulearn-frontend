// src/pages/Forgot.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import { issueOTP, verifyOTP } from "../lib/otp";
import { sendVerificationEmail } from "../lib/mailer";

export default function Forgot() {
  const [sid, setSid] = useState("");
  const [step, setStep] = useState(1); // 1輸入學號→寄碼，2驗證碼，3重設密碼
  const [cooldown, setCooldown] = useState(0);
  const [codeInput, setCodeInput] = useState("");
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");
  const navigate = useNavigate();

  const email = /^\d{9}$/.test(sid) ? `${sid}@gms.ndhu.edu.tw` : "";

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const sendCode = async () => {
    if (!/^\d{9}$/.test(sid)) return alert("請輸入 9 位學號");
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const u = users.find((x) => x.email === email);
    if (!u) return alert("查無此帳號");

    const { code } = issueOTP(email, "reset");
    const ok = await sendVerificationEmail(email, code, "重設密碼");
    if (!ok) return alert("寄送驗證碼失敗，稍後再試");
    setStep(2);
    setCooldown(60);
    alert(`驗證碼已寄出到：${email}`);
  };

  const checkCode = () => {
    const res = verifyOTP(email, "reset", codeInput);
    if (!res.ok) return alert(res.reason || "驗證失敗");
    setStep(3);
  };

  const resetPwd = (e) => {
    e.preventDefault();
    if (pwd1.length < 6) return alert("新密碼至少 6 碼");
    if (pwd1 !== pwd2) return alert("兩次輸入的密碼不一致");

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const idx = users.findIndex((u) => u.email === email);
    if (idx === -1) return alert("查無此帳號");
    users[idx] = { ...users[idx], password: pwd1 };
    localStorage.setItem("users", JSON.stringify(users));

    alert("密碼已更新，請重新登入");
    navigate("/login");
  };

  return (
    <div className="auth-container">
      <h2>忘記密碼</h2>

      {step === 1 && (
        <form className="auth-form" onSubmit={(e) => { e.preventDefault(); sendCode(); }}>
          <label className="auth-label">學號（9 碼）</label>
          <div className="inline-email">
            <input
              inputMode="numeric"
              maxLength={9}
              placeholder="輸入 9 位學號"
              value={sid}
              onChange={(e) => setSid(e.target.value.replace(/\D/g, "").slice(0, 9))}
            />
            <span className="inline-domain">@gms.ndhu.edu.tw</span>
          </div>

          <button type="submit" className="auth-primary" disabled={!/^\d{9}$/.test(sid) || cooldown > 0}>
            {cooldown > 0 ? `重新寄送（${cooldown}s）` : "寄送驗證碼"}
          </button>

          <div className="auth-links">
            <Link to="/login">回登入</Link>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="auth-form">
          <div style={{ marginBottom: 8, color: "#555" }}>我們已將驗證碼寄到：<b>{email}</b></div>
          <div className="otp-row">
            <input
              placeholder="輸入 6 位驗證碼"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
            <button className="auth-primary" onClick={checkCode} disabled={!codeInput}>
              驗證
            </button>
          </div>
          <div className="auth-links">
            <button className="btn-ghost" onClick={sendCode} disabled={cooldown > 0}>
              重新寄送{cooldown > 0 ? `（${cooldown}s）` : ""}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form className="auth-form" onSubmit={resetPwd}>
          <label className="auth-label">新密碼（至少 6 碼）</label>
          <input type="password" value={pwd1} onChange={(e) => setPwd1(e.target.value)} />
          <label className="auth-label">再輸入一次新密碼</label>
          <input type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} />
          <button type="submit" className="auth-primary">更新密碼</button>
          <div className="auth-links">
            <Link to="/login">回登入</Link>
          </div>
        </form>
      )}
    </div>
  );
}
