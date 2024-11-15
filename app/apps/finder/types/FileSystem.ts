export interface FileSystemItem {
  id: string;
  name: string;
  parentId: string | null;
  position: { x: number; y: number };
  isInSidebar?: boolean;
}
