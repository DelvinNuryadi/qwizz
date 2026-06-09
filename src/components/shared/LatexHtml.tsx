"use client";

import { useEffect, useRef, memo } from "react";
import katex from "katex";

interface LatexHtmlProps {
  html: string;
  className?: string;
}

export const LatexHtml = memo(function LatexHtml({ html, className }: LatexHtmlProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.querySelectorAll<HTMLElement>(
      '[data-type="inline-math"], [data-type="block-math"]'
    ).forEach((el) => {
      const latex = el.getAttribute("data-latex");
      if (!latex) return;

      try {
        katex.render(latex, el, {
          throwOnError: false,
          displayMode: el.dataset.type === "block-math",
        });
      } catch {
        el.textContent = latex;
      }
    });
  }, [html]);

  return (
    <div
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});

