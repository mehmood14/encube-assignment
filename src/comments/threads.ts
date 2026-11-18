import type { Author, Message, Thread } from "../shared/types";
export const CURRENT_AUTHOR: Author = { id: "mehmood", name: "Mehmood" };
export type ThreadAction =
  | { type: "create"; thread: Thread }
  | { type: "reply"; threadId: string; message: Message }
  | {
      type: "edit";
      threadId: string;
      messageId: string;
      text: string;
      at: string;
    }
  | { type: "resolve"; threadId: string; resolved: boolean };
export function threadsReducer(
  state: Thread[],
  action: ThreadAction,
): Thread[] {
  if (action.type === "create")
    return action.thread.root.text.trim() &&
      !state.some((t) => t.id === action.thread.id)
      ? [...state, action.thread]
      : state;
  return state.map((t) => {
    if (t.id !== action.threadId) return t;
    if (action.type === "resolve") return { ...t, resolved: action.resolved };
    if (action.type === "reply")
      return action.message.text.trim()
        ? { ...t, replies: [...t.replies, action.message] }
        : t;
    const edit = (m: Message): Message =>
      m.id === action.messageId &&
      m.author.id === CURRENT_AUTHOR.id &&
      action.text.trim() &&
      m.text !== action.text.trim()
        ? { ...m, text: action.text.trim(), editedAt: action.at }
        : m;
    return { ...t, root: edit(t.root), replies: t.replies.map(edit) };
  });
}
export const seeds: Thread[] = [
  {
    id: "clearance",
    position: { x: 390, y: 140 },
    resolved: false,
    root: {
      id: "m1",
      author: CURRENT_AUTHOR,
      text: "Could the guard deform toward the propeller during impact?",
      createdAt: "2026-11-17T09:10:00Z",
    },
    replies: [],
  },
  {
    id: "attachment",
    position: { x: 970, y: 180 },
    resolved: false,
    root: {
      id: "m2",
      author: { id: "sara", name: "Sara" },
      text: "We need to measure the actual rotor sweep and verify tip clearance.",
      createdAt: "2026-11-17T09:20:00Z",
    },
    replies: [],
  },
  {
    id: "material",
    position: { x: 246, y: 575 },
    resolved: true,
    root: {
      id: "m4",
      author: { id: "alex", name: "Alex" },
      text: "Which material gives us the best balance between stiffness, flexibility, and weight?",
      createdAt: "2026-11-17T09:30:00Z",
    },
    replies: [
      {
        id: "m5",
        author: CURRENT_AUTHOR,
        text: "Keep all four as exploratory candidates until physical testing.",
        createdAt: "2026-11-17T09:35:00Z",
      },
    ],
  },
  {
    id: "checklist",
    position: { x: 968, y: 630 },
    resolved: false,
    root: {
      id: "m6",
      author: CURRENT_AUTHOR,
      text: "Let's confirm the attachment fit before proceeding to a physical prototype.",
      createdAt: "2026-11-17T09:40:00Z",
    },
    replies: [],
  },
];
