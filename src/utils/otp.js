// 前端示範用 OTP 儲存/驗證（localStorage）
// 正式上線請改用後端或第三方寄信（Firebase/SendGrid/SES）

const OTP_STORE_KEY = "otp_store_v1";

function loadStore() {
  try {
    return JSON.parse(localStorage.getItem(OTP_STORE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveStore(store) {
  localStorage.setItem(OTP_STORE_KEY, JSON.stringify(store));
}

export function generateCode(len = 6) {
  let s = "";
  for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
  return s;
}

export function saveCode(email, code, ttlMs) {
  const store = loadStore();
  store[email] = { code, exp: Date.now() + ttlMs };
  saveStore(store);
}

export function verifyCode(email, code) {
  const store = loadStore();
  const rec = store[email];
  if (!rec) return { ok: false, reason: "沒有發送驗證碼或已過期" };
  if (Date.now() > rec.exp) {
    delete store[email];
    saveStore(store);
    return { ok: false, reason: "驗證碼已過期，請重新發送" };
  }
  if (String(rec.code) !== String(code)) {
    return { ok: false, reason: "驗證碼錯誤" };
  }
  // 一次性：驗證通過後清除
  delete store[email];
  saveStore(store);
  return { ok: true };
}
