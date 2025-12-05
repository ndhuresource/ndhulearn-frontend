// src/utils/market.js
const KEY = "marketPosts";

export function getMarketPosts() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}
export function setMarketPosts(list) {
  localStorage.setItem(KEY, JSON.stringify(list || []));
}
