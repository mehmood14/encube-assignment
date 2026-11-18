import type { Message, Thread } from "../shared/types";
import { seeds } from "./threads";
const KEY = "mini3-review.threads";
const previousSeedRoots: Record<string, { authorId: string; text: string }> = {
  clearance: {
    authorId: "mehmood",
    text: "Keep some breathing room around the propeller tips. Clearance needs a physical check.",
  },
  attachment: {
    authorId: "sara",
    text: "Could this clip attach without loading the motor housing?",
  },
  material: {
    authorId: "alex",
    text: "Mark the material choice as provisional until we test weight and flexibility.",
  },
};
const object = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;
const timestamp = (v: unknown): v is string =>
  typeof v === "string" && Number.isFinite(Date.parse(v));
function message(v: unknown): v is Message {
  return (
    object(v) &&
    typeof v.id === "string" &&
    typeof v.text === "string" &&
    timestamp(v.createdAt) &&
    (v.editedAt === undefined || timestamp(v.editedAt)) &&
    object(v.author) &&
    typeof v.author.id === "string" &&
    typeof v.author.name === "string"
  );
}
function thread(v: unknown): v is Thread {
  return (
    object(v) &&
    typeof v.id === "string" &&
    typeof v.resolved === "boolean" &&
    object(v.position) &&
    typeof v.position.x === "number" &&
    Number.isFinite(v.position.x) &&
    typeof v.position.y === "number" &&
    Number.isFinite(v.position.y) &&
    message(v.root) &&
    Array.isArray(v.replies) &&
    v.replies.every(message)
  );
}
function updateSeedThreads(saved: Thread[]): Thread[] {
  const updated = saved.map((stored) => {
    const previous = previousSeedRoots[stored.id];
    const seed = seeds.find((candidate) => candidate.id === stored.id);
    if (
      !previous ||
      !seed ||
      stored.root.author.id !== previous.authorId ||
      stored.root.text !== previous.text ||
      stored.root.editedAt
    )
      return stored;
    return {
      ...stored,
      position: seed.position,
      root: {
        ...seed.root,
        id: stored.root.id,
        createdAt: stored.root.createdAt,
      },
    };
  });
  const savedIds = new Set(updated.map((stored) => stored.id));
  return [...updated, ...seeds.filter((seed) => !savedIds.has(seed.id))];
}
export function loadThreads(): {
  threads: Thread[];
  persistent: boolean;
  notice: string;
} {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return { threads: seeds, persistent: true, notice: "" };
    const value: unknown = JSON.parse(raw);
    if (
      !object(value) ||
      value.version !== 1 ||
      !Array.isArray(value.threads) ||
      !value.threads.every(thread) ||
      new Set(value.threads.map((t) => t.id)).size !== value.threads.length
    )
      throw Error("Invalid storage");
    return {
      threads: updateSeedThreads(value.threads),
      persistent: true,
      notice: "",
    };
  } catch {
    return {
      threads: seeds,
      persistent: false,
      notice: "Saved review unavailable. Working in memory for this session.",
    };
  }
}
export function saveThreads(threads: Thread[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: 1, threads }));
    return true;
  } catch {
    return false;
  }
}
