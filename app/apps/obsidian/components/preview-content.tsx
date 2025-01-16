// components/editor/PreviewContent.tsx
import React from 'react';
import { Note } from '../types/note';

interface PreviewContentProps {
  content: string;
  accentColor: string;
  note: Note;
}

const SYMBOL_PATTERN = /(->|- |"|"|"|:|;)/g;

const getSymbolType = (symbol: string) => {
  switch (symbol) {
    case "->": return "arrow";
    case "- ": return "bullet";
    case '"':
    case '"':
    case '"': return "quote";
    case ":":
    case ";": return "punctuation";
    default: return "text";
  }
};

export const PreviewContent: React.FC<PreviewContentProps> = React.memo(({ content, accentColor, note }) => {
  const transformContent = (text: string) => {
    return text.split(SYMBOL_PATTERN).map((part, index) => {
      const symbolType = getSymbolType(part);

      if (symbolType === "text") return part;

      const style = {
        color: accentColor,
        opacity: symbolType === "punctuation" ? 0.9 : 1,
        fontWeight: symbolType === "quote" ? 500 : "inherit",
      };

      if (symbolType === "bullet") {
        return (
          <span key={index} style={style}>
            •
          </span>
        );
      }

      return (
        <span key={index} style={style}>
          {part}
        </span>
      );
    });
  };

  return (
    <div className="prose prose-invert min-w-full">
      <h1
        className="text-2xl font-bold mb-4"
        style={{
          fontFamily: "ExemplarPro",
          color: note.isDaily ? accentColor : "#4C4F69",
          opacity: 0.81,
        }}
      >
        {note.title}
      </h1>
      <div className="whitespace-pre-wrap">
        {transformContent(content)}
      </div>
    </div>
  );
});

PreviewContent.displayName = 'PreviewContent';
