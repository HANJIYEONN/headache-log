"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import { fetchBlogPosts, type BlogPost } from "@/lib/blogApi";

type BlogPostListProps = {
  limit?: number;
  layout?: "list" | "grid";
};

export default function BlogPostList({ limit, layout = "list" }: BlogPostListProps) {
  const { locale, t } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchBlogPosts()
      .then((loaded) => {
        if (!cancelled) setPosts(loaded);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function writtenAt(iso: string) {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  }

  const visiblePosts = typeof limit === "number" ? posts.slice(0, limit) : posts;

  if (loading) {
    return <p className="mt-10 text-center text-sm text-[#806044]">{t.blog.loading}</p>;
  }

  if (failed) {
    return (
      <div className="mt-8 rounded-lg border border-[#b89678] bg-[#f8f2e9] p-8 text-center shadow-sm">
        <p className="text-[#806044]">{t.blog.loadFailed}</p>
      </div>
    );
  }

  if (visiblePosts.length === 0) {
    return (
      <div className="mt-8 rounded-lg border border-[#b89678] bg-[#f8f2e9] p-8 text-center shadow-sm">
        <p className="text-[#806044]">{t.blog.empty}</p>
      </div>
    );
  }

  return (
    <div
      data-testid="blog-post-list"
      data-layout={layout}
      className={
        layout === "grid"
          ? "mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          : "mt-4 space-y-4"
      }
    >
      {visiblePosts.map((post) => (
        <Link
          key={post.id}
          href={`/blog/${post.id}`}
          className={`blog-wood-card block rounded-lg border border-[#b89678] shadow-[0_2px_5px_rgba(55,34,24,0.10)] transition hover:-translate-y-0.5 hover:border-[#76513b] hover:shadow-[0_6px_14px_rgba(55,34,24,0.16)] ${
            layout === "grid" ? "min-h-64 p-5" : "p-6"
          }`}
        >
          <h2 className={`${layout === "grid" ? "text-lg" : "text-xl"} font-bold text-[#4a2f22]`}>
            {post.title}
          </h2>
          <p className="mt-2 text-xs text-[#8a674b]">
            {writtenAt(post.created_at)} · {post.author_nickname}
          </p>
          <p
            className={`mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-[#6a4b35] ${
              layout === "grid" ? "line-clamp-6" : "line-clamp-3"
            }`}
          >
            {post.content}
          </p>
        </Link>
      ))}
    </div>
  );
}
