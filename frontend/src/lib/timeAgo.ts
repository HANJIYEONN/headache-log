// ─────────────────────────────────────────────
// timeAgo : "10분 전" 같은 문구를 만들어요
//
// 서버는 시각만 주고 문구는 화면에서 만들기로 했어요 (D-25).
// 앱이 4개 언어라 서버가 문구를 만들면 번역까지 서버 몫이 되거든요.
//
// Intl.RelativeTimeFormat 이 언어별 표현을 알아서 해줘요.
//   ko "10분 전"  en "10 minutes ago"  ja "10 分前"  zh "10分钟前"
// ─────────────────────────────────────────────

/**
 * @returns 1분이 안 지났으면 null — "방금" 같은 말은 부르는 쪽에서 붙여요.
 *          시각을 못 읽으면도 null.
 */
export function timeAgo(iso: string, locale: string, now: number = Date.now()): string | null {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;

  const seconds = Math.round((then - now) / 1000); // 음수 = 지난 일
  if (Math.abs(seconds) < 60) return null;

  const relative = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return relative.format(minutes, "minute");

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relative.format(hours, "hour");

  return relative.format(Math.round(hours / 24), "day");
}
