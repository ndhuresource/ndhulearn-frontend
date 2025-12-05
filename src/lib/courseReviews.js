// src/lib/courseReviews.js
import { DIMENSIONS } from "./ratingDims";

const KEY = "courseReviews"; // { [courseId]: { reviews: [], avg: number, avgByDim: {}, count: number } }

const clamp = (n) => Math.max(1, Math.min(5, Number(n) || 0));

const emptyAgg = () => ({
  reviews: [],
  avg: 0,
  avgByDim: Object.fromEntries(DIMENSIONS.map(d => [d.key, 0])),
  count: 0,
});

export const loadAll = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch { return {}; }
};
export const saveAll = (obj) => localStorage.setItem(KEY, JSON.stringify(obj));

export const getCourseAgg = (courseId) => {
  const map = loadAll();
  return map[courseId] || emptyAgg();
};

const setCourseAgg = (courseId, data) => {
  const map = loadAll();
  map[courseId] = data;
  saveAll(map);
  return data;
};

/** 新增/更新一則課程評價 */
export const upsertCourseReview = (courseId, { userEmail, overall, dims = {}, comment = "", anonymous = false }) => {
  const agg = getCourseAgg(courseId);
  const idx = agg.reviews.findIndex(r => r.userEmail === userEmail);
  const now = Date.now();

  const safeDims = {};
  DIMENSIONS.forEach(d => {
    if (dims[d.key]) safeDims[d.key] = clamp(dims[d.key]);
  });

  const rec = {
    userEmail,
    overall: clamp(overall),
    dims: safeDims,
    comment,
    anonymous: !!anonymous,
    createdAt: now,
  };

  if (idx === -1) agg.reviews.push(rec);
  else agg.reviews[idx] = rec;

  // 重算平均
  const sumOverall = agg.reviews.reduce((s, r) => s + (Number(r.overall) || 0), 0);
  agg.count = agg.reviews.length;
  agg.avg = agg.count ? Math.round((sumOverall / agg.count) * 10) / 10 : 0;

  const sums = Object.fromEntries(DIMENSIONS.map(d => [d.key, 0]));
  const cnts = Object.fromEntries(DIMENSIONS.map(d => [d.key, 0]));
  agg.reviews.forEach(r => {
    DIMENSIONS.forEach(d => {
      const v = Number(r.dims?.[d.key]) || 0;
      if (v > 0) { sums[d.key] += v; cnts[d.key] += 1; }
    });
  });
  agg.avgByDim = Object.fromEntries(
    DIMENSIONS.map(d => [
      d.key,
      cnts[d.key] ? Math.round((sums[d.key] / cnts[d.key]) * 10) / 10 : 0,
    ])
  );

  return setCourseAgg(courseId, agg);
};
