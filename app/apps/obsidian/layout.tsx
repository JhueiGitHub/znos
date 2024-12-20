import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Obsidian Clone",
  description: "A clone of Obsidian using Next.js and Zenith design system",
};

export default function ObsidianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return { children };
}
