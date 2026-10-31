import { useMemo } from "react";
import katex from "katex";

interface MathTextProps {
  text: string;
  className?: string;
}

export function MathText({ text, className = "" }: MathTextProps) {
  const renderedContent = useMemo(() => {
    if (!text) return "";

    // Parse $$...$$ (block math) and $...$ (inline math)
    return text.replace(/(\$\$[\s\S]+?\$\$|\$[^\$]+?\$)/g, (match) => {
      const isDisplay = match.startsWith("$$");
      const formula = isDisplay ? match.slice(2, -2).trim() : match.slice(1, -1).trim();
      try {
        return katex.renderToString(formula, {
          displayMode: isDisplay,
          throwOnError: false,
        });
      } catch (err) {
        return match;
      }
    });
  }, [text]);

  if (!text) return null;

  if (renderedContent !== text) {
    return (
      <span
        className={className}
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />
    );
  }

  return <span className={className}>{text}</span>;
}

