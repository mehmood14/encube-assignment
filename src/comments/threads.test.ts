import { it, expect } from "vitest";
import { threadsReducer, seeds, CURRENT_AUTHOR } from "./threads";
it("creates and replies immutably", () => {
  const thread = { ...seeds[0], id: "new", replies: [] };
  const state = threadsReducer([], { type: "create", thread });
  const message = { ...thread.root, id: "reply", author: CURRENT_AUTHOR };
  const next = threadsReducer(state, {
    type: "reply",
    threadId: "new",
    message,
  });
  expect(next[0].replies).toEqual([message]);
  expect(state[0].replies).toHaveLength(0);
});
it("edits own root and reply only, and marks changed saves", () => {
  let s = [
    {
      ...seeds[0],
      root: { ...seeds[0].root, author: CURRENT_AUTHOR },
      replies: [{ ...seeds[0].root, id: "r", author: CURRENT_AUTHOR }],
    },
  ];
  s = threadsReducer(s, {
    type: "edit",
    threadId: s[0].id,
    messageId: s[0].root.id,
    text: "changed",
    at: "2026-11-17T12:00:00Z",
  });
  expect(s[0].root.text).toBe("changed");
  expect(s[0].root.editedAt).toBeDefined();
  s = threadsReducer(s, {
    type: "edit",
    threadId: s[0].id,
    messageId: "r",
    text: "reply edited",
    at: "2026-11-17T12:00:00Z",
  });
  expect(s[0].replies[0].text).toBe("reply edited");
  const other = threadsReducer(seeds, {
    type: "edit",
    threadId: seeds[1].id,
    messageId: seeds[1].root.id,
    text: "forbidden",
    at: "now",
  });
  expect(other).toEqual(seeds);
});
it("resolves and reopens without changing messages", () => {
  const resolved = threadsReducer(seeds, {
    type: "resolve",
    threadId: seeds[0].id,
    resolved: true,
  });
  expect(resolved[0].resolved).toBe(true);
  expect(resolved[0].root).toEqual(seeds[0].root);
  expect(
    threadsReducer(resolved, {
      type: "resolve",
      threadId: seeds[0].id,
      resolved: false,
    })[0].resolved,
  ).toBe(false);
});
