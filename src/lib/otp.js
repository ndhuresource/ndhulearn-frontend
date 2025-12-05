// src/lib/otp.js
// 以 localStorage 模擬 OTP：每個 email+purpose 存一筆，10 分鐘有效，最多 5 次嘗試
const OTP_KEY = "otpStore";
const EXPIRE_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function load() {
  try { return JSON.parse(localStorage.getItem(OTP_KEY) || "{}"); }
  catch { return {}; }
}
function save(obj) {
  localStorage.setItem(OTP_KEY, JSON.stringify(obj));
}
function makeKey(email, purpose) {
  return `${email}::${purpose}`;
}

// 建立 OTP；回傳 { code, expiresAt }
export function issueOTP(email, purpose = "generic") {
  const store = load();
  const k = makeKey(email, purpose);
  const code = String(Math.floor(100000 + Math.random() * 900000)); // 6 碼
  const expiresAt = Date.now() + EXPIRE_MS;
  store[k] = { code, expiresAt, attempts: 0 };
  save(store);
  return { code, expiresAt };
}

// 驗證 OTP；正確→刪除並回傳 { ok: true }；錯誤/過期→ { ok:false, reason }
export function verifyOTP(email, purpose, codeInput) {
  const store = load();
  const k = makeKey(email, purpose);
  const item = store[k];
  if (!item) return { ok: false, reason: "請先取得驗證碼" };
  if (Date.now() > item.expiresAt) {
    delete store[k]; save(store);
    return { ok: false, reason: "驗證碼已過期，請重新取得" };
  }
  if (item.attempts >= MAX_ATTEMPTS) {
    delete store[k]; save(store);
    return { ok: false, reason: "嘗試過多，請重新取得驗證碼" };
  }
  if (String(codeInput).trim() !== String(item.code)) {
    item.attempts += 1; save(store);
    return { ok: false, reason: "驗證碼錯誤" };
  }
  delete store[k]; save(store);
  return { ok: true };
}
