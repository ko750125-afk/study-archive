export type ItemType = "text" | "url" | "image" | "notion";
export type Priority = "high" | "medium" | "low" | "none";

export interface ArchiveItem {
  id: string;
  type: ItemType;
  title: string;
  content: string;       // URL, 텍스트, 이미지 URL, Notion 내용
  thumbnail?: string;    // URL 미리보기 이미지
  description?: string;  // URL 설명 또는 메모
  tags: string[];
  priority: Priority;
  createdAt: number;
  updatedAt: number;
}
