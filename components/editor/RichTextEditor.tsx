"use client";

import { TipTapEditor } from "./TipTapEditor";
import type { Locale } from "@/lib/i18n/settings";

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  locale: Locale;
  placeholder?: string;
  minRows?: number;
}

export function RichTextEditor({
  value,
  onChange,
  locale,
  placeholder,
}: RichTextEditorProps) {
  return (
    <TipTapEditor
      value={value}
      onChange={onChange}
      locale={locale}
      placeholder={placeholder}
    />
  );
}

export { TipTapEditor };
