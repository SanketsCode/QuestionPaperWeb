"use client";

import "katex/dist/katex.min.css";
import katex from "katex";
import { useEffect, useRef } from "react";

type MathRendererProps = {
  text: string;
  className?: string;
  block?: boolean;
};

export default function MathRenderer({
  text,
  className = "",
  block = false,
}: MathRendererProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Basic regex to find math content.
    // Adjust based on your API's format (e.g., $...$, $$...$$, \(...\), \[...\])
    // For now, let's assume specific delimiters or just render the whole string if it's purely math.
    // But usually, text contains mixed content.
    // If we want to render mixed content, we need to parse it. 
    // A simple approach is to use a library, but since we are avoiding complex dependencies:
    
    renderMath(containerRef.current, text);
  }, [text]);

  const renderMath = (element: HTMLElement, content: string) => {
    // This is a simplified parser. For production, consider a robust parser or handling specific delimiters.
    // Here we split by $...$ (inline) and $$...$$ (block).
    // Note: This simple split might be fragile with escaped characters.
    
    // Check if the content is just a pure format or mixed. 
    // If the backend sends pure LaTeX for specific fields, we can just use renderToString.
    // If it's mixed text, we need to locate delimiters.

    // Let's assume the text might contain $...$ or $$...$$
    
    const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);

    element.innerHTML = "";

    parts.forEach(part => {
      if (part.startsWith("$$") && part.endsWith("$$")) {
        // Block math
        const math = part.slice(2, -2);
        try {
          const span = document.createElement("div");
          katex.render(math, span, { displayMode: true, throwOnError: false });
          element.appendChild(span);
        } catch (e) {
          element.appendChild(document.createTextNode(part));
        }
      } else if (part.startsWith("$") && part.endsWith("$")) {
        // Inline math
        const math = part.slice(1, -1);
        try {
          const span = document.createElement("span");
          katex.render(math, span, { displayMode: false, throwOnError: false });
          element.appendChild(span);
        } catch (e) {
          element.appendChild(document.createTextNode(part));
        }
      } else {
        // Plain text
        // Ensure to preserve creating text nodes to avoid XSS if possible, 
        // but here we are appending to innerHTML so we should be careful. 
        // For safety, let's use textNode for plain text.
        element.appendChild(document.createTextNode(part));
      }
    });
  };

  return <span ref={containerRef} className={className} />;
}
