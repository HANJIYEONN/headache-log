"use client";

import Link from "next/link";
import BlogPostList from "@/components/BlogPostList";
import { PageTitle, useT } from "@/i18n/LanguageProvider";

export default function AllBlogPostsPage() {
  const t = useT();

  return (
    <main className="blog-wood-page mx-auto min-h-screen w-full max-w-5xl px-6 py-10 text-[#3f2b22] shadow-[0_0_34px_rgba(23,13,9,0.22)]">
      <PageTitle title={`${t.blog.allPosts} · ${t.blog.title}`} />
      <Link href="/blog" className="text-sm text-[#806044] hover:underline">
        ← {t.blog.back}
      </Link>

      <div className="mt-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t.blog.allPosts}</h1>
          <p className="mt-1 text-sm text-[#806044]">{t.blog.allPostsDescription}</p>
        </div>
        <Link
          href="/blog/write"
          className="shrink-0 rounded-xl bg-[#74472f] px-4 py-2.5 text-sm font-semibold text-[#fffaf2] shadow-sm transition hover:bg-[#543220]"
        >
          {t.blog.newPost}
        </Link>
      </div>

      <section className="mt-8" aria-label={t.blog.allPosts}>
        <BlogPostList layout="grid" />
      </section>
    </main>
  );
}
