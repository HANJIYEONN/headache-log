"use client";

import { FormEvent, use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageTitle, useT } from "@/i18n/LanguageProvider";
import { fetchBlogPost, updateBlogPost } from "@/lib/blogApi";

const TITLE_MAX = 100;
const CONTENT_MAX = 5000;

export default function BlogEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = use(params);
  const id = Number(rawId);
  const t = useT();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!Number.isInteger(id) || id < 1) {
      router.replace("/blog");
      return;
    }
    let cancelled = false;
    fetchBlogPost(id)
      .then((post) => {
        if (cancelled) return;
        if (!post.is_author) {
          router.replace(`/blog/${id}`);
          return;
        }
        setTitle(post.title);
        setContent(post.content);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) router.replace(`/blog/${id}`);
      });
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    if (!cleanTitle || !cleanContent || saving) return;

    setSaving(true);
    setError("");
    try {
      await updateBlogPost(id, cleanTitle, cleanContent);
      router.replace(`/blog/${id}`);
    } catch {
      setError(t.blog.updateFailed);
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="py-16 text-center text-sm text-[#806044]">{t.blog.loading}</p>;
  }

  return (
    <main className="blog-wood-page mx-auto min-h-screen w-full max-w-2xl px-6 py-10 text-[#3f2b22] shadow-[0_0_34px_rgba(23,13,9,0.22)]">
      <PageTitle title={`${t.blog.editTitle} · ${t.blog.title}`} />
      <Link href={`/blog/${id}`} className="text-sm text-[#806044] hover:underline">
        ← {t.blog.backToPost}
      </Link>
      <h1 className="mt-8 text-3xl font-bold">{t.blog.editTitle}</h1>

      <form onSubmit={save} className="mt-8 space-y-6">
        <label className="block">
          <span className="text-sm font-semibold">{t.blog.titleLabel}</span>
          <input
            autoFocus
            value={title}
            maxLength={TITLE_MAX}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 w-full rounded-xl border border-[#b99368] bg-[#fffaf2] px-4 py-3 outline-none focus:border-[#74472f] focus:ring-2 focus:ring-[#ddc09e]"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">{t.blog.contentLabel}</span>
          <textarea
            value={content}
            maxLength={CONTENT_MAX}
            onChange={(event) => setContent(event.target.value)}
            rows={14}
            className="mt-2 w-full resize-y rounded-xl border border-[#b99368] bg-[#fffaf2] px-4 py-3 leading-7 outline-none focus:border-[#74472f] focus:ring-2 focus:ring-[#ddc09e]"
          />
        </label>

        {error && <p role="alert" className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-3">
          <Link
            href={`/blog/${id}`}
            className="rounded-xl border border-[#b99368] bg-[#fffaf2] px-5 py-3 text-sm font-semibold text-[#6a4b35] hover:bg-[#ead7be]"
          >
            {t.common.cancel}
          </Link>
          <button
            type="submit"
            disabled={!title.trim() || !content.trim() || saving}
            className="rounded-xl bg-[#74472f] px-5 py-3 text-sm font-semibold text-[#fffaf2] hover:bg-[#543220] disabled:opacity-40"
          >
            {saving ? t.blog.saving : t.blog.save}
          </button>
        </div>
      </form>
    </main>
  );
}
