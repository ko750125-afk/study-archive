export type ItemType = "text" | "url" | "image" | "notion";

export interface SubItem {
  id: string;
  type: "url" | "text";
  title: string;
  content: string;
}

export interface ArchiveItem {
  id: string;
  type: ItemType;
  title: string;
  content: string;       // URL, 텍스트, 이미지 URL, Notion 내용
  thumbnail?: string;    // URL 미리보기 이미지
  description?: string;  // URL 설명 또는 메모
  tags: string[];
  subItems?: SubItem[];
  createdAt: number;
  updatedAt: number;
  isPriority?: boolean;
}
