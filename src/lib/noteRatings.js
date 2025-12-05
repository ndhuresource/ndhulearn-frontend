// 本地評分/留言與「下載憑證」的極簡資料層（localStorage）
// keys：
// - note_ratings        -> { [noteId]: Rating[] }
// - note_download_proofs-> { [noteId]: string[] }  // 存放已下載的 email 列表

const KEY_RATINGS = "note_ratings";
const KEY_PROOFS  = "note_download_proofs";

/* ---------------- 通用存取 ---------------- */
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

/* ---------------- 下載憑證 ---------------- */
export function markDownloaded(noteId, email) {
  if (!noteId || !email) return;
  const map = load(KEY_PROOFS, {});
  const set = new Set(map[noteId] || []);
  set.add(email);
  map[noteId] = Array.from(set);
  save(KEY_PROOFS, map);
}

export function canRate(noteId, email) {
  if (!noteId || !email) return false;
  const map = load(KEY_PROOFS, {});
  return Array.isArray(map[noteId]) && map[noteId].includes(email);
}

/* ---------------- 評分/留言存取 ---------------- */
// 取出該筆記所有評分
export function getNoteRatings(noteId) {
  const db = load(KEY_RATINGS, {});
  const arr = db[noteId];
  return Array.isArray(arr) ? arr : [];
}

// 新增或覆寫（同帳號只有一筆，可重複修改）
export function upsertNoteRating(
  noteId,
  me,
  { stars = {}, overall = 0, comment = "", isAnon = false }
) {
  if (!noteId) return null;

  const db = load(KEY_RATINGS, {});
  const arr = Array.isArray(db[noteId]) ? db[noteId].slice() : [];

  const email = me?.email || "unknown";
  const idx = arr.findIndex((r) => r.email === email);
  const now = Date.now();

  const normStars = {
    completeness: num(stars.completeness),
    accuracy:     num(stars.accuracy),
    relevance:    num(stars.relevance),
    readability:  num(stars.readability),
    credibility:  num(stars.credibility),
  };

  const row = {
    id:        idx > -1 ? arr[idx].id : `nrt_${now}`,
    email,
    by:        isAnon ? "匿名" : (me?.name || email.split("@")[0] || "使用者"),
    isAnon:    !!isAnon,
    stars:     normStars,
    overall:   num(overall || avgStars(normStars)),
    comment:   (comment || "").trim(),
    createdAt: idx > -1 ? (arr[idx].createdAt || now) : now,
    updatedAt: now,
  };

  if (idx > -1) arr[idx] = row;
  else arr.push(row);

  db[noteId] = arr;
  save(KEY_RATINGS, db);
  return row;
}

/* ---------------- 聚合 ---------------- */
export function getNoteAgg(noteId) {
  const list = getNoteRatings(noteId);

  // 整體評分平均（只算 >0 的）
  const valsOverall = list.map((r) => num(r.overall)).filter((v) => v > 0);
  const count = valsOverall.length;
  const avg = count ? round1(valsOverall.reduce((s, v) => s + v, 0) / count) : 0;

  const dims = ["completeness", "accuracy", "relevance", "readability", "credibility"];
  const avgByDim = {};
  for (const d of dims) {
    const arr = list.map((r) => num(r.stars?.[d])).filter((v) => v > 0);
    avgByDim[d] = arr.length ? round1(arr.reduce((s, v) => s + v, 0) / arr.length) : 0;
  }

  return { avg, count, avgByDim, list };
}

/* ---------------- 小工具 ---------------- */
function num(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return clamp(round1(n), 0, 5);
}
function round1(x) { return Math.round(x * 10) / 10; }
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

function avgStars(st) {
  const arr = [
    num(st?.completeness),
    num(st?.accuracy),
    num(st?.relevance),
    num(st?.readability),
    num(st?.credibility),
  ].filter((v) => v > 0);
  if (!arr.length) return 0;
  return round1(arr.reduce((s, v) => s + v, 0) / arr.length);
}
