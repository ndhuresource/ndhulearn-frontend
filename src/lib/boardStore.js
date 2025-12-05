// src/lib/boardStore.js
export const BOARD_KEY = "boardPosts";

export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function loadPosts() {
  try {
    return JSON.parse(localStorage.getItem(BOARD_KEY) || "[]");
  } catch {
    return [];
  }
}

export function savePosts(posts) {
  localStorage.setItem(BOARD_KEY, JSON.stringify(posts));
}

export function getPost(id) {
  return loadPosts().find((p) => p.id === id) || null;
}

export function upsertPost(post) {
  const posts = loadPosts();
  const i = posts.findIndex((x) => x.id === post.id);
  if (i === -1) posts.push(post);
  else posts[i] = post;
  savePosts(posts);
}

export function updatePost(id, updater) {
  const posts = loadPosts();
  const i = posts.findIndex((x) => x.id === id);
  if (i === -1) return null;
  posts[i] = updater(posts[i]);
  savePosts(posts);
  return posts[i];
}
