import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import "../styles/Auth.css";

// 移除 EMOJI_CATALOG 常數

export default function Register() {
  const [sid, setSid] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  // 移除 emoji 狀態

  // OTP 狀態
  const [codeSent, setCodeSent] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 自動產生 email 字串
  const email = /^[a-zA-Z0-9]{9}$/.test(sid) ? `${sid}@gms.ndhu.edu.tw` : "";

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const sendCode = async () => {
    if (!/^[a-zA-Z0-9]{9}$/.test(sid)) return alert("請輸入 9 位學號");
    
    setLoading(true);
    try {
      await authService.sendCode(email, name);
      alert(`驗證碼已寄出到：${email}\n請至信箱收信 (若未收到請檢查垃圾郵件)`);
      setCodeSent(true);
      setCooldown(60);
    } catch (error) {
      if (error.response?.status === 409) {
        alert("此信箱已註冊，請直接登入");
        navigate("/login");
      } else {
        alert("寄送失敗：" + (error.response?.data?.message || "請稍後再試"));
      }
    } finally {
      setLoading(false);
    }
  };

  const checkCode = async () => {
    if (!codeInput || codeInput.length !== 6) return alert("請輸入 6 位數驗證碼");
    
    setLoading(true);
    try {
      setVerified(true); 
      alert("驗證碼格式正確！請填寫剩餘資料並送出註冊。");
    } catch (error) {
      alert("驗證失敗");
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!verified) return alert("請先點擊「驗證」確認驗證碼");
    if (!/^[a-zA-Z0-9]{9}$/.test(sid)) return alert("請輸入 9 位學號");
    if (password.length < 6) return alert("密碼至少 6 碼");

    setLoading(true);
    try {
      await authService.register({
        studentId: sid,
        username: name || `同學${sid.slice(-3)}`,
        email: email,
        password: password,
        code: codeInput,
        // 移除 emoji 欄位傳送
      });

      alert("註冊成功！即將跳轉登入...");
      setTimeout(() => {
        navigate("/login");
      }, 500);

    } catch (error) {
      console.error(error);
      alert("註冊失敗：" + (error.response?.data?.message || "請稍後再試"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>註冊（東華校園帳號）</h2>

      <form onSubmit={submit} className="auth-form">
        <label className="auth-label">學號（9 碼）</label>
        
        {/* 學號與網域分開顯示，中間有間隔 */}
        <div className="inline-email">
          <input
            type="text"
            maxLength={9}
            placeholder="輸入 9 位學號"
            value={sid}
            onChange={(e) => {
              const val = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 9);
              setSid(val);
              setVerified(false);
              setCodeSent(false);
            }}
            disabled={loading || verified}
            style={{ flex: 1 }} // 自動填滿剩餘空間
          />
          <span className="inline-domain" style={{ whiteSpace: 'nowrap' }}>@gms.ndhu.edu.tw</span>
        </div>

        <label className="auth-label">名字（暱稱）</label>
        <input
          type="text"
          placeholder="顯示於發文/留言的名稱"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          style={{ width: '100%', boxSizing: 'border-box' }}
        />

        <label className="auth-label">設定密碼（至少 6 碼）</label>
        <input
          type="password"
          placeholder="密碼"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          style={{ width: '100%', boxSizing: 'border-box' }}
        />

        {/* 🔥 已刪除「選擇 emoji 當頭貼」區塊 */}

        {/* 驗證碼區塊 */}
        <div className="otp-row" style={{display:'flex', gap: 8, alignItems:'center', marginBottom:15}}>
          <button
            type="button"
            className="auth-primary"
            onClick={sendCode}
            disabled={!/^[a-zA-Z0-9]{9}$/.test(sid) || cooldown > 0 || verified || loading}
            style={{ width: '120px', fontSize: '13px', height: '42px', padding: 0 }}
          >
            {cooldown > 0 ? `重送(${cooldown})` : "寄送驗證碼"}
          </button>
          
          <input
            placeholder="6位驗證碼"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
            disabled={!codeSent || verified || loading}
            style={{ flex: 1, height: '42px', boxSizing: 'border-box' }}
          />
          
          <button
            type="button"
            className="btn-ghost"
            onClick={checkCode}
            disabled={!codeSent || verified || !codeInput || loading}
            style={{ width: '80px', height: '42px', padding: 0 }}
          >
            {verified ? "OK" : "驗證"}
          </button>
        </div>
        
        {verified && <div style={{color: 'green', fontSize: 14, marginBottom: 10, textAlign: 'center'}}>✅ 信箱驗證通過，請點擊下方按鈕完成註冊</div>}

        <button type="submit" className="auth-primary" disabled={!verified || loading}>
          {loading ? "處理中..." : "註冊"}
        </button>
        
        <div className="auth-links">
          <Link to="/login">已有帳號？前往登入</Link>
        </div>
      </form>
    </div>
  );
}