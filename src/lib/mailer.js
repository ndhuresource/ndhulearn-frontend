// src/lib/mailer.js
// 預設 DEV 模式：不真的寄信，直接 alert() 顯示驗證碼。
// 若要真的寄信：把 DEV_MODE 改為 false，並使用 EmailJS (或你自己的 API)。

const DEV_MODE = true;

/* 真的寄信 (EmailJS) 做法（可選）：
import emailjs from "@emailjs/browser";
const EMAILJS_SERVICE_ID = "你的_service_id";
const EMAILJS_TEMPLATE_ID = "你的_template_id";
const EMAILJS_PUBLIC_KEY = "你的_public_key";
*/

export async function sendVerificationEmail(to, code, purpose = "驗證") {
  const subject = `NDHU ${purpose}驗證碼`;
  const text = `您的${purpose}驗證碼：${code}\n10分鐘內有效。`;

  if (DEV_MODE) {
    // 本機/開發：直接顯示
    console.log(`[DEV] Send OTP to ${to}: ${code}`);
    alert(`【開發模式】驗證碼已送到：${to}\n驗證碼：${code}`);
    return true;
  }

  // === 真的寄信（EmailJS 範例）===
  /* 取消註解即可使用
  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      { to_email: to, subject, message: text },
      EMAILJS_PUBLIC_KEY
    );
    return true;
  } catch (e) {
    console.error("EmailJS 發信失敗", e);
    return false;
  }
  */
  return false;
}
