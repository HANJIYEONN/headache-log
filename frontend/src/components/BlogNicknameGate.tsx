"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useT } from "@/i18n/LanguageProvider";
import { fetchBlogUser } from "@/lib/blogUserApi";
import { useLoginUser } from "@/lib/useLoginUser";

type GateState = "checking" | "ready" | "failed";

export default function BlogNicknameGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useT();
  const { token, isKnown } = useLoginUser();
  const [state, setState] = useState<GateState>("checking");
  const isNicknamePage = pathname === "/blog/nickname";

  async function retry() {
    setState("checking");
    try {
      const profile = await fetchBlogUser();
      if (!profile.exists) {
        localStorage.removeItem("blog_nickname");
        router.replace("/blog/nickname");
        return;
      }
      localStorage.setItem("blog_nickname", profile.nickname);
      setState("ready");
    } catch {
      setState("failed");
    }
  }

  useEffect(() => {
    if (isNicknamePage || !isKnown) return;
    if (token === null) {
      router.replace("/login");
      return;
    }

    let cancelled = false;
    fetchBlogUser()
      .then((profile) => {
        if (cancelled) return;
        if (!profile.exists) {
          localStorage.removeItem("blog_nickname");
          router.replace("/blog/nickname");
          return;
        }
        localStorage.setItem("blog_nickname", profile.nickname);
        setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("failed");
      });

    return () => {
      cancelled = true;
    };
  }, [isKnown, isNicknamePage, router, token]);

  if (isNicknamePage) return children;
  if (!isKnown || token === null || state === "checking") return null;

  if (state === "failed") {
    return (
      <main className="blog-wood-page flex min-h-screen w-full items-center justify-center p-6">
        <div className="blog-wood-card w-full max-w-sm rounded-2xl border border-[#b9895e] p-8 text-center shadow-sm">
          <p className="text-sm text-[#6a4b35]">{t.blogNickname.loadFailed}</p>
          <button
            type="button"
            onClick={() => void retry()}
            className="mt-4 rounded-xl bg-[#74472f] px-5 py-2.5 text-sm font-semibold text-[#fffaf2] hover:bg-[#543220]"
          >
            {t.blogNickname.retry}
          </button>
        </div>
      </main>
    );
  }

  return children;
}
