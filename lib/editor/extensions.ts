// lib/editor/extensions.ts
import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

interface CreateArrowThemeOptions {
  accentColor: string;
}

export const createArrowTheme = ({
  accentColor,
}: CreateArrowThemeOptions): Extension => {
  const arrowHighlighting = HighlightStyle.define([
    {
      tag: tags.operator,
      color: accentColor,
      fontFamily: "Dank",
    },
  ]);

  return [
    syntaxHighlighting(arrowHighlighting),
    EditorView.baseTheme({
      "&.cm-editor .cm-operator": {
        color: accentColor,
      },
      "&.cm-editor": {
        fontFamily: "Dank",
      },
    }),
  ];
};
