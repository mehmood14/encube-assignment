export interface WorldPoint {
  x: number;
  y: number;
}
export interface ScreenPoint {
  x: number;
  y: number;
}
export interface Viewport {
  scale: number;
  translation: ScreenPoint;
}
export interface Author {
  id: string;
  name: string;
}
export interface Message {
  id: string;
  author: Author;
  text: string;
  createdAt: string;
  editedAt?: string;
}
export interface Thread {
  id: string;
  position: WorldPoint;
  resolved: boolean;
  root: Message;
  replies: Message[];
}
export type Tool = "hand" | "comment";
export type Filter = "all" | "open" | "resolved";
