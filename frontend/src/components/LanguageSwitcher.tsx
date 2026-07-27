"use client";

// ─────────────────────────────────────────────
// LanguageSwitcher : 한 · EN · 日 · 中 언어 전환 버튼
// 화면 왼쪽 위에 항상 떠 있어요 (fixed = 스크롤해도 따라와요)
// 지금 언어는 진하게, 나머지는 연하게 보여줘요.
// ─────────────────────────────────────────────

import { useLanguage } from "@/i18n/LanguageProvider";
import { LOCALES, LOCALE_LABELS } from "@/i18n/dictionaries";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    // z-50 : 다른 요소들보다 위에 떠 있게
    <div className="fixed left-3 top-3 z-50 flex overflow-hidden rounded-full border border-[#f8ccdd] bg-white/90 shadow-sm backdrop-blur">
      {LOCALES.map((code) => {
        const isCurrent = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            title={LOCALE_LABELS[code].full}
            // aria-current : 지금 선택된 항목이라고 보조기기에 알려줘요
            aria-current={isCurrent ? "true" : undefined}
            className={`px-2.5 py-1.5 text-xs font-semibold transition ${
              isCurrent
                ? "bg-[#ffe4ee] text-[#c9457a]"
                : "text-[#c9a5b4] hover:bg-[#fff5f9] hover:text-[#e05a86]"
            }`}
          >
            {LOCALE_LABELS[code].short}
          </button>
        );
      })}
    </div>
  );
}
