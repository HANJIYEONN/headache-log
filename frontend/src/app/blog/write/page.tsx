"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageTitle, useT } from "@/i18n/LanguageProvider";
import { createBlogPost } from "@/lib/blogApi";

const TITLE_MAX = 100;
const CONTENT_MAX = 5000;

export default function BlogWritePage() {
  const t = useT();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    if (!cleanTitle || !cleanContent || publishing) return;

    setPublishing(true);
    setError("");
    try {
      await createBlogPost(cleanTitle, cleanContent);
      router.replace("/blog");
    } catch {
      setError(t.blog.publishFailed);
      setPublishing(false);
    }
  }

  return (
    <main className="blog-wood-page mx-auto min-h-screen w-full max-w-2xl px-6 py-10 text-[#3f2b22] shadow-[0_0_34px_rgba(23,13,9,0.22)]">
      <PageTitle title={`${t.blog.writeTitle} · ${t.blog.title}`} />
      <Link href="/blog" className="text-sm text-[#806044] hover:underline">
        ← {t.blog.back}
      </Link>

      <h1 className="mt-8 text-3xl font-bold">{t.blog.writeTitle}</h1>

      <form onSubmit={publish} className="mt-8 space-y-6">
        <label className="block">
          <span className="text-sm font-semibold">{t.blog.titleLabel}</span>
          <input
            autoFocus
            value={title}
            maxLength={TITLE_MAX}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t.blog.titlePlaceholder}
            className="mt-2 w-full rounded-xl border border-[#b99368] bg-[#fffaf2] px-4 py-3 outline-none transition placeholder:text-[#a98b6d] focus:border-[#74472f] focus:ring-2 focus:ring-[#ddc09e]"
          />
          <span className="mt-1 block text-right text-xs text-[#8a674b]">
            {title.length}/{TITLE_MAX}
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-semibold">{t.blog.contentLabel}</span>
          <textarea
            value={content}
            maxLength={CONTENT_MAX}
            onChange={(event) => setContent(event.target.value)}
            placeholder={t.blog.contentPlaceholder}
            rows={14}
            className="mt-2 w-full resize-y rounded-xl border border-[#b99368] bg-[#fffaf2] px-4 py-3 leading-7 outline-none transition placeholder:text-[#a98b6d] focus:border-[#74472f] focus:ring-2 focus:ring-[#ddc09e]"
          />
          <span className="mt-1 block text-right text-xs text-[#8a674b]">
            {content.length}/{CONTENT_MAX}
          </span>
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Link
            href="/blog"
            className="rounded-xl border border-[#b99368] bg-[#fffaf2] px-5 py-3 text-sm font-semibold text-[#6a4b35] hover:bg-[#ead7be]"
          >
            {t.common.cancel}
          </Link>
          <button
            type="submit"
            disabled={!title.trim() || !content.trim() || publishing}
            className="rounded-xl bg-[#74472f] px-5 py-3 text-sm font-semibold text-[#fffaf2] hover:bg-[#543220] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {publishing ? t.blog.publishing : t.blog.publish}
          </button>
        </div>
      </form>
    </main>
  );
}
