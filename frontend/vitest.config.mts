// ─────────────────────────────────────────────
// vitest.config.mts : 테스트 실행 설정  (.mts = ESM 방식이라는 표시)
//
// Vitest = 요즘 쓰는 테스트 도구 (Jest의 최신 대체재).
// 실행: npm test          — 파일을 고치면 자동으로 다시 돌려줘요
//       npm run test:run  — 한 번만 돌리고 끝 (CI/자동화용)
// ─────────────────────────────────────────────
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // 코드에서 쓰는 "@/..." 를 src 폴더로 연결해줘요
    alias: { "@": new URL("./src", import.meta.url).pathname },
  },
  test: {
    // jsdom = 가짜 브라우저. localStorage, Audio 같은 걸 쓸 수 있어요
    environment: "jsdom",
    globals: true, // describe/it/expect 를 import 없이 바로 사용
    setupFiles: ["./vitest.setup.ts"],
  },
});
