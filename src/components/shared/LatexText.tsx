"use client";

import { useEffect, useRef, memo } from "react";
import renderMathInElement from "katex/contrib/auto-render";

interface LatexTextProps {
  text: string;
  className?: string;
}

export const LatexText = memo(function LatexText({ text, className }: LatexTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current) {
      renderMathInElement(ref.current, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
        ],
        throwOnError: false,
      });
    }
  }, [text]);

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
});

