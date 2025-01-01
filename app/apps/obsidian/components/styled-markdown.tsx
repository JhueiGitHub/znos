// components/styled-markdown.tsx
import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface StyledMarkdownProps {
  content: string;
  accentColor: string;
}

const StyledMarkdown: React.FC<StyledMarkdownProps> = ({
  content,
  accentColor,
}) => {
  // Custom components for markdown elements
  const components = useMemo(
    () => ({
      // Headings
      h1: ({ children }: any) => (
        <h1 style={{ color: accentColor }} className="text-2xl font-bold mb-4">
          {children}
        </h1>
      ),
      h2: ({ children }: any) => (
        <h2 style={{ color: accentColor }} className="text-xl font-bold mb-3">
          {children}
        </h2>
      ),
      h3: ({ children }: any) => (
        <h3 style={{ color: accentColor }} className="text-lg font-bold mb-2">
          {children}
        </h3>
      ),
      h4: ({ children }: any) => (
        <h4 style={{ color: accentColor }} className="text-base font-bold mb-2">
          {children}
        </h4>
      ),
      h5: ({ children }: any) => (
        <h5 style={{ color: accentColor }} className="text-sm font-bold mb-1">
          {children}
        </h5>
      ),
      h6: ({ children }: any) => (
        <h6 style={{ color: accentColor }} className="text-xs font-bold mb-1">
          {children}
        </h6>
      ),

      // Separators (horizontal rules)
      hr: () => <hr style={{ borderColor: accentColor }} className="my-4" />,

      // Handle punctuation and arrows in paragraphs
      p: ({ children }: any) => {
        if (typeof children === "string") {
          // Style punctuation marks and arrows
          const styledText = children.replace(
            /([.,:;!?]|->|=>|←|→|↑|↓|⇒|⇐|⇔)/g,
            (match) => `<span style="color: ${accentColor}">${match}</span>`
          );
          return (
            <p
              dangerouslySetInnerHTML={{ __html: styledText }}
              className="mb-4 text-[#7E8691]"
            />
          );
        }
        return <p className="mb-4 text-[#7E8691]">{children}</p>;
      },

      // Style inline code blocks
      code: ({ children }: any) => (
        <code className="bg-black/20 rounded px-1 py-0.5 font-mono text-sm">
          {children}
        </code>
      ),

      // Style blockquotes
      blockquote: ({ children }: any) => (
        <blockquote
          style={{ borderLeftColor: accentColor }}
          className="border-l-4 pl-4 italic my-4"
        >
          {children}
        </blockquote>
      ),
    }),
    [accentColor]
  );

  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default StyledMarkdown;
