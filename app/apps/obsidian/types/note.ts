// types/note.ts
export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  vaultId: string;
  frontmatter?: {
    date?: string;
    type?: string;
    [key: string]: any;
  };
  isDaily?: boolean;
}
