"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CatSittingIcon from "@/components/CatSittingIcon";
import { PageTitle, useT } from "@/i18n/LanguageProvider";
import { ApiError } from "@/lib/apiBase";
import { createBlogUser, fetchBlogUser } from "@/lib/blogUserApi";
import { useLoginUser } from "@/lib/useLoginUser";

const NICKNAME_MAX = 20;

export default function BlogNicknamePage() {
  const t = useT();
  const router = useRouter();
  const { token, isKnown } = useLoginUser();
  const [nickname, setNickname] = useState("");
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isKnown) return;
    if (token === null) {
      router.replace("/login");
      return;
    }

    let cancelled = false;
    fetchBlogUser()
      .then((profile) => {
        if (cancelled) return;
        if (profile.exists) {
          localStorage.setItem("blog_nickname", profile.nickname);
          router.replace("/blog");
          return;
        }
        setChecking(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError(t.blogNickname.loadFailed);
          setChecking(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isKnown, router, t.blogNickname.loadFailed, token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = nickname.trim();
    if (!value || saving) return;

    setSaving(true);
    setError("");
    try {
      const profile = await createBlogUser(value);
      localStorage.setItem("blog_nickname", profile.nickname);
      router.replace("/blog");
    } catch (failure) {
      setError(
        failure instanceof ApiError && failure.status === 409
          ? t.blogNickname.alreadySet
          : t.blogNickname.saveFailed,
      );
      setSaving(false);
    }
  }

  if (!isKnown || token === null || checking) return null;

  return (
    <main className="blog-wood-page flex min-h-screen w-full items-center justify-center p-6 text-[#4a2f22]">
      <PageTitle title={t.blogNickname.pageTitle} />

      <div className="blog-wood-card w-full max-w-sm rounded-3xl border border-[#b9895e] p-8 shadow-[0_8px_24px_rgba(74,47,34,0.20)]">
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ddc09e] text-[#6b412c]">
            <CatSittingIcon className="h-10 w-10" />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-[#4a2f22]">{t.blogNickname.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#806044]">
            {t.blogNickname.description}
          </p>
        </div>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-semibold text-[#4a2f22]">{t.blogNickname.label}</span>
            <input
              autoFocus
              type="text"
              value={nickname}
              maxLength={NICKNAME_MAX}
              onChange={(event) => setNickname(event.target.value)}
              placeholder={t.blogNickname.placeholder}
              className="mt-2 w-full rounded-xl border border-[#b99368] bg-[#fffaf2] px-4 py-3 text-[#4a2f22] outline-none transition placeholder:text-[#a98b6d] focus:border-[#74472f] focus:ring-2 focus:ring-[#ddc09e]"
            />
          </label>

          <div className="rounded-xl bg-[#e6caa6] px-4 py-3 text-sm font-medium leading-relaxed text-[#6a4b35]">
            {t.blogNickname.warning}
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!nickname.trim() || saving}
            className="w-full rounded-xl bg-[#74472f] px-4 py-3 font-semibold text-[#fffaf2] transition hover:bg-[#543220] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? t.blogNickname.saving : t.blogNickname.submit}
          </button>
        </form>
      </div>
    </main>
  );
}
