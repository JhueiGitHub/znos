import { EditorView } from "@codemirror/view";

export const createSyntaxHighlighter = (accentColor: string) => {
  return EditorView.updateListener.of((update) => {
    const arrows = /(->>?)/g;
    const text = update.state.doc.toString();
    const matches = [...text.matchAll(arrows)];

    if (!matches.length) return;

    // Create overlay spans for arrows
    matches.forEach((match) => {
      const span = document.createElement("span");
      span.className = "arrow-overlay";
      span.style.color = accentColor;
      span.textContent = match[0];

      // Position overlay precisely using editor coordinates
      const pos = update.view.coordsAtPos(match.index!);
      if (pos) {
        span.style.position = "absolute";
        span.style.left = `${pos.left}px`;
        span.style.top = `${pos.top}px`;
      }
    });
  });
};
