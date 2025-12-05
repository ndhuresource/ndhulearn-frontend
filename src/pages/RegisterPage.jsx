import React, { useState } from "react";
import "./RegisterPage.css"; // 若沒有這檔可先移除這行

function mockSendCode(email) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  alert(`驗證碼已寄到 ${email}: ${code}`);
  return code;
}

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [realCode, setRealCode] = useState(null);
  const [verified, setVerified] = useState(false);

  const handleSendCode = () => {
    if (!email.includes("@")) {
      alert("請輸入有效 Email");
      return;
    }
    setRealCode(mockSendCode(email));
  };

  const handleVerify = () => {
    if (code === realCode) {
      setVerified(true);
      alert("驗證成功 ✅ 可以註冊！");
    } else {
      alert("驗證碼錯誤 ❌");
    }
  };

  return (
    <div className="register-card">
      <h2>註冊</h2>
      <label>Email:</label>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />

      <button onClick={handleSendCode}>寄送驗證碼</button>

      <label>驗證碼:</label>
      <input value={code} onChange={(e) => setCode(e.target.value)} />
      <button onClick={handleVerify}>驗證</button>

      {verified && <p>🎉 恭喜完成註冊！</p>}
    </div>
  );
}
