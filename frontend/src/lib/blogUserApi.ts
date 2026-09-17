import { API_URL, authHeaders, checkAuth, fail, jsonHeaders } from "./apiBase";

const BASE = `${API_URL}/api/v1/blog/users`;

export type BlogUser = { exists: true; nickname: string };
export type NoBlogUser = { exists: false };
export type BlogUserResponse = BlogUser | NoBlogUser;

export async function fetchBlogUser(): Promise<BlogUserResponse> {
  const res = await fetch(`${BASE}/me`, { headers: authHeaders() });
  checkAuth(res);
  if (!res.ok) return fail(res, "블로그 닉네임을 불러오지 못했어요");
  return res.json();
}

export async function createBlogUser(nickname: string): Promise<BlogUser> {
  const res = await fetch(`${BASE}/me`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ nickname }),
  });
  checkAuth(res);
  if (!res.ok) return fail(res, "블로그 닉네임을 저장하지 못했어요");
  return res.json();
}
