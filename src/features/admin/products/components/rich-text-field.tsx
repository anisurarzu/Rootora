"use client";

import { useRef } from "react";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type RichTextFieldProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
};

function wrapSelection(
  value: string,
  start: number,
  end: number,
  before: string,
  after: string
) {
  const selected = value.slice(start, end) || "text";
  const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
  return {
    next,
    caret: start + before.length + selected.length + after.length,
  };
}

export function RichTextField({
  id,
  value,
  onChange,
  placeholder,
  rows = 8,
  className,
}: RichTextFieldProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function apply(before: string, after: string = before) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const { next, caret } = wrapSelection(value, start, end, before, after);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border border-input", className)}>
      <div className="flex flex-wrap gap-1 border-b border-border bg-muted/30 p-2">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => apply("**", "**")}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => apply("_", "_")}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => apply("\n- ", "")}
          aria-label="Bullet list"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => apply("\n1. ", "")}
          aria-label="Numbered list"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      <Textarea
        ref={ref}
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
}
