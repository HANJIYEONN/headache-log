"use client";

// ─────────────────────────────────────────────
// cat-note/page.tsx : 고양이 수첩에 들어오면 제일 먼저 거치는 곳 🚪
//
// 여기서 세 갈래로 나뉘어요.
//   로그인 안 함     → /login
//   수첩이 아직 없음 → /cat-note/start (짝꿍 고르고 아이디 만들기)
//   수첩이 있음      → 인사하고 쓰러 보내기
// ─────────────────────────────────────────────

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import CatIcon from "@/components/CatIcon";
import { PageTitle, useT } from "@/i18n/LanguageProvider";
import { fetchMe, type CatAccount } from "@/lib/catApi";
import { useLoginUser } from "@/lib/useLoginUser";

export default function CatNoteHome() {
  const t = useT();
  const router = useRouter();
  const { token, isKnown } = useLoginUser();

  // undefined = 아직 확인 중 / null = 수첩 없음 / 객체 = 수첩 있음
  const [account, setAccount] = useState<CatAccount | null | undefined>(undefined);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // isKnown 이 false 면 아직 로그인 여부를 몰라요.
    // 여기서 성급하게 /login 으로 보내면 로그인한 사람도 튕겨나가요.
    if (!isKnown) return;

    if (token === null) {
      router.replace("/login");
      return;
    }

    // 화면을 떠난 뒤에 응답이 와서 setState 하는 걸 막아요
    let alive = true;
    fetchMe()
      .then((me) => alive && setAccount(me.exists ? me : null))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [isKnown, token, router]);

  useEffect(() => {
    if (account === null) router.replace("/cat-note/start");
  }, [account, router]);

  if (failed) {
    return (
      <Waiting>
        <p className="text-sm text-[#7a6a48]">{t.catNote.error.generic}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-2xl bg-[#f5c64b] px-6 py-2.5 text-sm font-bold text-[#4a3a20] shadow-[0_3px_0_#dca92e] transition hover:bg-[#f0bb38]"
        >
          {t.catNote.error.retry}
        </button>
      </Waiting>
    );
  }

  // 확인 중이거나, 수첩이 없어서 만들러 가는 중
  if (!account) {
    return (
      <Waiting>
        <p className="text-sm text-[#a08c66]">{t.catNote.gate.checking}</p>
      </Waiting>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <PageTitle title={t.catNote.title} />

      <div className="w-full max-w-sm rounded-3xl border border-[#efe3c8] bg-[#fffdf5] px-8 py-10 shadow-sm">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#f5c64b] bg-[#fbefc9] text-[#b98a1f]">
          <CatIcon className="h-9 w-9" />
        </span>

        <h1 className="mt-5 text-2xl font-bold text-[#4a3a20]">
          {t.catNote.home.greeting(account.nickname)}
        </h1>
        <p className="mt-2 text-sm text-[#7a6a48]">{t.catNote.home.invite}</p>

        <Link
          href="/cat-note/write"
          className="mt-8 inline-block rounded-2xl bg-[#f5c64b] px-7 py-3 text-sm font-bold text-[#4a3a20] shadow-[0_3px_0_#dca92e] transition hover:bg-[#f0bb38]"
        >
          {t.catNote.home.goWrite}
        </Link>
      </div>
    </main>
  );
}

/** 기다리는 중·문제가 생겼을 때 쓰는 가운데 정렬 자리 */
function Waiting({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#efe3c8] bg-[#fffdf5] text-[#dca92e]">
        <CatIcon className="h-8 w-8" />
      </span>
      <div className="mt-4">{children}</div>
    </main>
  );
}
