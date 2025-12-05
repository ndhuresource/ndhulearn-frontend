// src/lib/notesStore.js
//
// notesRatings 結構：
// notesRatings = {
//   [noteId]: {
//     ratings: [{
//       userEmail,
//       overall,              // 整體星等 (1~5)
//       dims: {               // 各面向星等 (1~5)
//         completeness, accuracy, relevance, readability, credibility
//       },
//       comment,
//       createdAt
//     }],
//     avg,                    // 整體平均
//     avgByDim: { completeness, accuracy, relevance, readability, credibility },
//     count
//   }
// }
// noteDownloads = { [noteId]: [email1, ...] }  // 本機下載憑證

export const DIMENSIONS = [
  { key: "completeness", label: "內容完整性" },
  { key: "accuracy",     label: "內容準確性" },
  { key: "relevance",    label: "內容相關性" },
  { key: "readability",  label: "易讀性（排版、清晰度）" },
  { key: "credibility",  label: "來源可信度" },
];

const RATINGS_KEY = "notesRatings";
const DL_KEY = "noteDownloads";

/* -------------------- 工具 -------------------- */
const clampStar = (n) => Math.max(1, Math.min(5, Number(n) || 0));

const emptyAgg = () => ({
  ratings: [],
  avg: 0,
  avgByDim: Object.fromEntries(DIMENSIONS.map(d => [d.key, 0])),
  count: 0,
});

/* -------------------- Ratings 存取 -------------------- */
export const loadRatingsAll = () => {
  try { return JSON.parse(localStorage.getItem(RATINGS_KEY) || "{}"); }
  catch { return {}; }
};
export const saveRatingsAll = (obj) =>
  localStorage.setItem(RATINGS_KEY, JSON.stringify(obj));

export const getNoteRating = (noteId) => {
  const raw = loadRatingsAll()[noteId];
  if (!raw) return emptyAgg();

  // 與舊資料相容：若 rating.stars 存在，轉成 overall
  const ratings = (raw.ratings || []).map(r => {
    if (r.stars && !r.overall) {
      return { ...r, overall: r.stars };
    }
    return r;
  });

  const agg = { ...emptyAgg(), ratings };
  // 重新計算平均
  if (ratings.length) {
    const sumOverall = ratings.reduce((s, r) => s + (Number(r.overall) || 0), 0);
    agg.count = ratings.length;
    agg.avg = agg.count ? Math.round((sumOverall / agg.count) * 10) / 10 : 0;

    const sums = Object.fromEntries(DIMENSIONS.map(d => [d.key, 0]));
    const cnts = Object.fromEntries(DIMENSIONS.map(d => [d.key, 0]));
    ratings.forEach(r => {
      const dims = r.dims || {};
      DIMENSIONS.forEach(d => {
        const v = Number(dims[d.key]) || 0;
        if (v > 0) {
          sums[d.key] += v;
          cnts[d.key] += 1;
        }
      });
    });
    agg.avgByDim = Object.fromEntries(
      DIMENSIONS.map(d => [
        d.key,
        cnts[d.key] ? Math.round((sums[d.key] / cnts[d.key]) * 10) / 10 : 0,
      ])
    );
  }
  return agg;
};

export const setNoteRating = (noteId, data) => {
  const all = loadRatingsAll();
  all[noteId] = data;
  saveRatingsAll(all);
  return data;
};

/* -------------------- 下載憑證 -------------------- */
export const loadDownloads = () => {
  try { return JSON.parse(localStorage.getItem(DL_KEY) || "{}"); }
  catch { return {}; }
};
export const saveDownloads = (obj) =>
  localStorage.setItem(DL_KEY, JSON.stringify(obj));

/** ✅ 在「下載成功」後呼叫：markDownloaded(noteId, email) */
export const markDownloaded = (noteId, email) => {
  const map = loadDownloads();
  const set = new Set(map[noteId] || []);
  if (email) set.add(email);
  map[noteId] = Array.from(set);
  saveDownloads(map);
};
/** 檢查是否已下載（本機憑證） */
export const canRateNote = (noteId, email) => {
  const map = loadDownloads();
  const arr = map[noteId] || [];
  return email ? arr.includes(email) : false;
};

/* -------------------- 新增 / 更新評分 -------------------- */
/**
 * rateNote(noteId, {
 *   userEmail,
 *   overall,           // 整體星等 1~5
 *   dims,              // { completeness, accuracy, relevance, readability, credibility } 各 1~5 (可缺省)
 *   comment
 * })
 */
export const rateNote = (noteId, { userEmail, overall, dims = {}, comment }) => {
  const cur = getNoteRating(noteId);
  const i = cur.ratings.findIndex((r) => r.userEmail === userEmail);
  const now = Date.now();

  const safeDims = {};
  DIMENSIONS.forEach(d => {
    if (dims[d.key]) safeDims[d.key] = clampStar(dims[d.key]);
  });

  const nextRecord = {
    userEmail,
    overall: clampStar(overall),
    dims: safeDims,
    comment: comment || "",
    createdAt: now,
  };

  if (i === -1) cur.ratings.push(nextRecord);
  else cur.ratings[i] = nextRecord;

  // 重算平均
  const sumOverall = cur.ratings.reduce((s, r) => s + (Number(r.overall) || 0), 0);
  cur.count = cur.ratings.length;
  cur.avg = cur.count ? Math.round((sumOverall / cur.count) * 10) / 10 : 0;

  const sums = Object.fromEntries(DIMENSIONS.map(d => [d.key, 0]));
  const cnts = Object.fromEntries(DIMENSIONS.map(d => [d.key, 0]));
  cur.ratings.forEach(r => {
    const rd = r.dims || {};
    DIMENSIONS.forEach(d => {
      const v = Number(rd[d.key]) || 0;
      if (v > 0) {
        sums[d.key] += v;
        cnts[d.key] += 1;
      }
    });
  });
  cur.avgByDim = Object.fromEntries(
    DIMENSIONS.map(d => [
      d.key,
      cnts[d.key] ? Math.round((sums[d.key] / cnts[d.key]) * 10) / 10 : 0,
    ])
  );

  return setNoteRating(noteId, cur);
};
