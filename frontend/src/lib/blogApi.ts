import { API_URL, authHeaders, checkAuth, fail, jsonHeaders } from "./apiBase";

const BASE = `${API_URL}/api/v1/blog/posts`;

export type BlogPost = {
  id: number;
  title: string;
  content: string;
  author_nickname: string;
  is_author: boolean;
  created_at: string;
  updated_at: string;
};

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const res = await fetch(BASE, { headers: authHeaders() });
  checkAuth(res);
  if (!res.ok) return fail(res, "블로그 글을 불러오지 못했어요");
  return res.json();
}

export async function createBlogPost(title: string, content: string): Promise<BlogPost> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ title, content }),
  });
  checkAuth(res);
  if (!res.ok) return fail(res, "블로그 글을 게시하지 못했어요");
  return res.json();
}

export async function fetchBlogPost(id: number): Promise<BlogPost> {
  const res = await fetch(`${BASE}/${id}`, { headers: authHeaders() });
  checkAuth(res);
  if (!res.ok) return fail(res, "글을 불러오지 못했어요");
  return res.json();
}

export async function updateBlogPost(
  id: number,
  title: string,
  content: string,
): Promise<BlogPost> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify({ title, content }),
  });
  checkAuth(res);
  if (!res.ok) return fail(res, "글을 수정하지 못했어요");
  return res.json();
}

export async function deleteBlogPost(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  checkAuth(res);
  if (!res.ok) return fail(res, "글을 삭제하지 못했어요");
}
