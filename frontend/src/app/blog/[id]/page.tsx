"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageTitle, useLanguage } from "@/i18n/LanguageProvider";
import { deleteBlogPost, fetchBlogPost, type BlogPost } from "@/lib/blogApi";

export default function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = use(params);
  const id = Number(rawId);
  const router = useRouter();
  const { locale, t } = useLanguage();
  const invalidId = !Number.isInteger(id) || id < 1;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [failed, setFailed] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (invalidId) return;
    let cancelled = false;
    fetchBlogPost(id)
      .then((loaded) => {
        if (!cancelled) setPost(loaded);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id, invalidId]);

  async function remove() {
    if (!post || deleting || !window.confirm(t.blog.deleteConfirm)) return;
    setDeleting(true);
    try {
      await deleteBlogPost(post.id);
      router.replace("/blog");
    } catch {
      setDeleting(false);
      window.alert(t.blog.deleteFailed);
    }
  }

  if (failed || invalidId) {
    return (
      <main className="blog-wood-page mx-auto min-h-screen w-full max-w-2xl px-6 py-10 text-[#3f2b22] shadow-[0_0_34px_rgba(23,13,9,0.22)]">
        <Link href="/blog" className="text-sm text-[#806044] hover:underline">
          ← {t.blog.back}
        </Link>
        <p className="mt-10 text-center text-[#806044]">{t.blog.notFound}</p>
      </main>
    );
  }

  if (!post) {
    return <p className="py-16 text-center text-sm text-[#806044]">{t.blog.loading}</p>;
  }

  const date = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(post.created_at));

  return (
    <main className="blog-wood-page mx-auto min-h-screen w-full max-w-2xl px-6 py-10 text-[#3f2b22] shadow-[0_0_34px_rgba(23,13,9,0.22)]">
      <PageTitle title={`${post.title} · ${t.blog.title}`} />
      <Link href="/blog" className="text-sm text-[#806044] hover:underline">
        ← {t.blog.back}
      </Link>

      <article className="mt-8">
        <header className="border-b border-[#c9a77d] pb-6">
          <h1 className="break-words text-3xl font-bold leading-tight">{post.title}</h1>
          <p className="mt-3 text-sm text-[#806044]">
            {date} · {post.author_nickname}
          </p>

          {post.is_author && (
            <div className="mt-5 flex gap-2">
              <Link
                href={`/blog/${post.id}/edit`}
                className="rounded-lg border border-[#b99368] bg-[#fffaf2] px-4 py-2 text-sm font-semibold text-[#6a4b35] hover:bg-[#ead7be]"
              >
                {t.common.edit}
              </Link>
              <button
                type="button"
                disabled={deleting}
                onClick={() => void remove()}
                className="rounded-lg border border-[#e4b9ac] bg-white px-4 py-2 text-sm font-semibold text-[#a24e3f] hover:bg-[#fff1ed] disabled:opacity-40"
              >
                {deleting ? t.blog.deleting : t.common.delete}
              </button>
            </div>
          )}
        </header>

        <div className="whitespace-pre-wrap break-words py-8 text-base leading-8 text-[#563a29]">
          {post.content}
        </div>
      </article>
    </main>
  );
}
