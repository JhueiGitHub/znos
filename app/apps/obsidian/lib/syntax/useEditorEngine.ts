// /root/app/apps/obsidian/lib/editor-engine.ts

interface ProcessedSegment {
  text: string;
  type: "arrow" | "text" | "heading" | "separator";
  start: number;
  end: number;
}

export class EditorEngine {
  private static patterns = {
    arrow: /(?:^|\s)(->)(?:\s|$)/g,
  };

  static processText(text: string): ProcessedSegment[] {
    const segments: ProcessedSegment[] = [];
    let lastIndex = 0;
    let match;

    // Reset regex
    this.patterns.arrow.lastIndex = 0;

    while ((match = this.patterns.arrow.exec(text)) !== null) {
      const arrowStart = match.index + match[0].indexOf("->");
      const arrowEnd = arrowStart + 2;

      // Add text before arrow
      if (arrowStart > lastIndex) {
        segments.push({
          text: text.slice(lastIndex, arrowStart),
          type: "text",
          start: lastIndex,
          end: arrowStart,
        });
      }

      // Add arrow
      segments.push({
        text: "->",
        type: "arrow",
        start: arrowStart,
        end: arrowEnd,
      });

      lastIndex = arrowEnd;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      segments.push({
        text: text.slice(lastIndex),
        type: "text",
        start: lastIndex,
        end: text.length,
      });
    }

    return segments;
  }
}
