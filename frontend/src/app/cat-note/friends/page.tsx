"use client";

import CatSoon from "@/components/CatSoon";
import { useT } from "@/i18n/LanguageProvider";

export default function Page() {
  const t = useT();
  return <CatSoon title={t.catNote.tabs.friends} />;
}
