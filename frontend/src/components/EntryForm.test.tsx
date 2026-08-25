// ─────────────────────────────────────────────
// EntryForm 테스트 — "수정 버튼을 누르면 폼이 채워지는지"
//
// 이 부분은 원래 useEffect로 되어 있었는데, 리액트가 권하는 방식
// (렌더 중에 이전 값과 비교)으로 바꿨어요. 동작이 그대로인지
// 이 테스트가 지켜줘요.
// ─────────────────────────────────────────────
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import EntryForm from "./EntryForm";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import type { Entry } from "@/lib/api";

const 기록: Entry = {
  id: 1,
  entry_date: "2026-07-14",
  menstruating: false,
  took_painkiller: true,
  medication: "타이레놀",
  effective: true,
  dose_count: 3,
  trigger: "수면 부족",
  bp_systolic: 118,
  bp_diastolic: 76,
  bp_pulse: 82,
};

/** 부모가 주는 값들. editing만 테스트마다 바꿔요 */
function renderForm(editing: Entry | null) {
  const props = {
    onSaved: vi.fn(),
    editing,
    onCancelEdit: vi.fn(),
    medications: [],
    favorites: [],
    onFavoritesChanged: vi.fn(),
    editingFavorite: null,
    onCancelFavoriteEdit: vi.fn(),
  };
  const view = render(
    <LanguageProvider>
      <EntryForm {...props} />
    </LanguageProvider>,
  );
  return {
    ...view,
    /** editing 값만 바꿔서 다시 그리기 (부모가 수정 버튼을 누른 상황) */
    setEditing: (next: Entry | null) =>
      view.rerender(
        <LanguageProvider>
          <EntryForm {...props} editing={next} />
        </LanguageProvider>,
      ),
  };
}

describe("EntryForm — 수정할 기록이 정해지면 폼 채우기", () => {
  it("수정할 게 없으면 폼이 비어있다", () => {
    renderForm(null);

    expect(screen.queryByDisplayValue("타이레놀")).not.toBeInTheDocument();
  });

  it("수정할 기록을 주면 그 값들이 폼에 들어간다", () => {
    renderForm(기록);

    expect(screen.getByDisplayValue("타이레놀")).toBeInTheDocument();
    expect(screen.getByDisplayValue("수면 부족")).toBeInTheDocument();
    expect(screen.getByDisplayValue("3")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2026-07-14")).toBeInTheDocument();
  });

  it("도중에 수정 대상이 생겨도 폼이 채워진다 (수정 버튼을 누른 상황)", () => {
    const { setEditing } = renderForm(null);
    expect(screen.queryByDisplayValue("타이레놀")).not.toBeInTheDocument();

    setEditing(기록); // ← 부모가 "이거 수정해줘"

    expect(screen.getByDisplayValue("타이레놀")).toBeInTheDocument();
  });

  it("수정을 취소하면 폼이 비워진다", () => {
    const { setEditing } = renderForm(기록);
    expect(screen.getByDisplayValue("타이레놀")).toBeInTheDocument();

    setEditing(null); // ← 취소

    expect(screen.queryByDisplayValue("타이레놀")).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue("수면 부족")).not.toBeInTheDocument();
  });

  it("혈압이 있던 기록이면 혈압칸이 열려있다", () => {
    renderForm(기록);

    expect(screen.getByDisplayValue("118")).toBeInTheDocument();
    expect(screen.getByDisplayValue("76")).toBeInTheDocument();
  });
});
