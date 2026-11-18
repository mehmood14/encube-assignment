import { afterEach, expect, it, vi } from "vitest";
import type { Thread } from "../shared/types";
import { loadThreads } from "./persistence";
import { seeds } from "./threads";

function useStorage(value: string) {
  const values = new Map([["mini3-review.threads", value]]);
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, next: string) => values.set(key, next),
  });
}

afterEach(() => vi.unstubAllGlobals());

it("updates only untouched legacy seeds and preserves user threads and replies", () => {
  const previous = [
    {
      ...seeds[0],
      root: {
        ...seeds[0].root,
        text: "Keep some breathing room around the propeller tips. Clearance needs a physical check.",
      },
    },
    {
      ...seeds[1],
      root: {
        ...seeds[1].root,
        author: { id: "sara", name: "Sara" },
        text: "Could this clip attach without loading the motor housing?",
      },
      replies: [seeds[1].root],
    },
    {
      ...seeds[2],
      position: { x: 790, y: 530 },
      root: {
        ...seeds[2].root,
        author: { id: "alex", name: "Alex" },
        text: "Mark the material choice as provisional until we test weight and flexibility.",
      },
    },
  ] satisfies Thread[];
  const userThread = { ...seeds[0], id: "user-created" };
  useStorage(
    JSON.stringify({ version: 1, threads: [...previous, userThread] }),
  );

  const loaded = loadThreads();
  const guard = loaded.threads.find((thread) => thread.id === "clearance");
  const material = loaded.threads.find((thread) => thread.id === "material");

  expect(loaded.persistent).toBe(true);
  expect(guard?.root.text).toBe(seeds[0].root.text);
  expect(
    loaded.threads.find((thread) => thread.id === "attachment")?.replies,
  ).toEqual(previous[1].replies);
  expect(material?.position).toEqual(seeds[2].position);
  expect(loaded.threads).toContainEqual(userThread);
  expect(loaded.threads.map((thread) => thread.id)).toContain("checklist");
});

it("does not rewrite a user-edited legacy seed", () => {
  const edited = {
    ...seeds[0],
    root: {
      ...seeds[0].root,
      text: "A reviewer-edited note.",
      editedAt: "2026-11-17T10:00:00Z",
    },
  };
  useStorage(JSON.stringify({ version: 1, threads: [edited] }));

  const loaded = loadThreads();

  expect(loaded.threads[0]).toEqual(edited);
});
