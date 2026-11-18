import { useEffect, useEffectEvent, useReducer, useRef, useState } from "react";
import type { Filter, Thread, Tool, WorldPoint } from "./shared/types";
import { Board, Pin } from "./board/Board";
import { worldToScreen } from "./viewport/math";
import { useBoardInput } from "./viewport/useBoardInput";
import { threadsReducer } from "./comments/threads";
import { loadThreads, saveThreads } from "./comments/persistence";
import { CommentsPanel, newMessage } from "./comments/CommentsPanel";
import { initialOrientation, rotateModel } from "./preview/rotation";
const editable = (target: EventTarget | null) =>
  target instanceof Element &&
  Boolean(
    target.closest(
      'input,textarea,select,[contenteditable]:not([contenteditable="false"])',
    ),
  );
export default function App() {
  const [initial] = useState(loadThreads);
  const [threads, dispatch] = useReducer(threadsReducer, initial.threads);
  const persistent = useRef(initial.persistent);
  const [status, setStatus] = useState(initial.notice),
    [tool, setTool] = useState<Tool>("hand");
  const [draft, setDraft] = useState<WorldPoint | null>(null),
    [draftText, setDraftText] = useState(""),
    [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all"),
    [editingId, setEditingId] = useState<string | null>(null),
    [shortcuts, setShortcuts] = useState(true);
  const [rotationEnabled, setRotationEnabled] = useState(false);
  const [orientation, setOrientation] = useState(initialOrientation);
  const rotationEnabledRef = useRef(false);
  const setRotationMode = (enabled: boolean) => {
    rotationEnabledRef.current = enabled;
    setRotationEnabled(enabled);
  };
  const [narrow, setNarrow] = useState(
      () => matchMedia("(max-width: 767px)").matches,
    ),
    [drawer, setDrawer] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    origin = useRef<HTMLElement | null>(null);
  const selected = threads.find((t) => t.id === selectedId);
  const place = (p: WorldPoint) => {
    if (!draft)
      origin.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
    setDraft(p);
    setSelectedId(null);
    setEditingId(null);
    setDrawer(true);
    setStatus(draft ? "Draft pin moved." : "Draft placed. Write your comment.");
  };
  const input = useBoardInput({
    tool,
    onPlace: place,
    rotationEnabled,
    onRotate: (dx, dy) =>
      setOrientation((current) => rotateModel(current, dx, dy)),
  });
  const toggleRotation = () => {
    input.cancel();
    if (tool === "comment") setTool("hand");
    setRotationMode(!rotationEnabledRef.current);
  };
  const restore = () =>
    requestAnimationFrame(() => {
      const target = origin.current?.isConnected
        ? origin.current
        : input.surface.current;
      target?.focus();
    });
  const close = () => {
    setDraft(null);
    setDraftText("");
    setSelectedId(null);
    setEditingId(null);
    setDrawer(false);
    restore();
  };
  const backToAllNotes = () => {
    setSelectedId(null);
    setDraft(null);
    setEditingId(null);
    setDrawer(true);
    input.fitSmooth();
    restore();
  };
  const selectTool = (next: Tool) => {
    input.cancel();
    if (next === "comment") setRotationMode(false);
    setTool(next);
  };
  const escape = () => {
    if (rotationEnabledRef.current) {
      input.cancel();
      setRotationMode(false);
      return;
    }
    if (input.cancel()) return;
    if (editingId) {
      setEditingId(null);
      return;
    }
    if (draft) {
      close();
      setStatus("Draft cancelled.");
      return;
    }
    if (selectedId || drawer) close();
  };
  useEffect(() => {
    const m = matchMedia("(max-width: 767px)");
    const update = () => setNarrow(m.matches);
    m.addEventListener("change", update);
    return () => m.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (narrow && drawer && !dialog.current?.open) {
      dialog.current?.showModal();
      requestAnimationFrame(() =>
        dialog.current
          ?.querySelector<HTMLElement>("textarea,h3[tabindex]")
          ?.focus(),
      );
    } else if (dialog.current?.open) dialog.current.close();
  }, [narrow, drawer]);
  useEffect(() => {
    if (persistent.current && !saveThreads(threads)) {
      persistent.current = false;
      setStatus(
        "Storage unavailable. Changes remain in memory for this session.",
      );
    }
  }, [threads]);
  const handleShortcut = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "Escape" && rotationEnabledRef.current) {
      e.preventDefault();
      input.cancel();
      setRotationMode(false);
      setStatus("3D rotation off.");
      return;
    }
    if (
      e.defaultPrevented ||
      e.repeat ||
      e.isComposing ||
      e.ctrlKey ||
      e.metaKey ||
      e.altKey ||
      e.shiftKey
    )
      return;
    if (editable(e.target)) return;
    if (e.key === "Escape") {
      e.preventDefault();
      escape();
    } else if (shortcuts && ["c", "h"].includes(e.key.toLowerCase())) {
      e.preventDefault();
      selectTool(e.key.toLowerCase() === "c" ? "comment" : "hand");
    }
  });
  useEffect(() => {
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);
  const select = (t: Thread, navigate = true) => {
    origin.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setSelectedId(t.id);
    setDraft(null);
    setEditingId(null);
    setDrawer(true);
    if (navigate)
      input.navigate(t.position, narrow ? window.innerHeight * 0.55 : 0);
  };
  const panel = (
    <CommentsPanel
      threads={threads}
      selected={selected}
      draft={draft}
      draftText={draftText}
      setDraftText={setDraftText}
      filter={filter}
      setFilter={setFilter}
      editingId={editingId}
      setEditingId={setEditingId}
      dispatch={dispatch}
      onSelect={select}
      onBackToAllNotes={backToAllNotes}
      onClose={close}
      showCloseButton={narrow || Boolean(selected) || Boolean(draft)}
      onStatus={setStatus}
      onMoveDraft={() => {
        setDrawer(false);
        selectTool("comment");
        requestAnimationFrame(() => input.surface.current?.focus());
      }}
      onSubmit={() => {
        if (!draft || !draftText.trim()) return;
        const id = crypto.randomUUID();
        dispatch({
          type: "create",
          thread: {
            id,
            position: draft,
            resolved: false,
            root: newMessage(draftText),
            replies: [],
          },
        });
        setSelectedId(id);
        setDraft(null);
        setDraftText("");
        setStatus("Comment posted.");
      }}
    />
  );
  const dp = draft ? worldToScreen(draft, input.viewport) : null;
  const openCount = threads.filter((thread) => !thread.resolved).length;
  return (
    <div className="app-shell">
      <header className="app-header">
        <a
          className="brand"
          href="#"
          aria-label="Mini 3 propeller guard concept review home"
        >
          <svg aria-hidden="true" viewBox="0 0 48 48">
            <g fill="none" stroke="#b6542d" strokeWidth="2">
              <circle cx="9" cy="9" r="6.5" />
              <circle cx="39" cy="9" r="6.5" />
              <circle cx="9" cy="39" r="6.5" />
              <circle cx="39" cy="39" r="6.5" />
            </g>
            <g
              fill="none"
              stroke="#304c35"
              strokeLinecap="round"
              strokeWidth="2.5"
            >
              <path d="m19 19-5-5m15 5 5-5M19 29l-5 5m15-5 5 5" />
              <path d="M6 9h6m-3-3v6m27-3h6m-3-3v6M6 39h6m-3-3v6m27-3h6m-3-3v6" />
            </g>
            <rect x="19" y="16" width="10" height="16" rx="4" fill="#304c35" />
            <circle cx="24" cy="18.5" r="1.5" fill="#b6542d" />
          </svg>
        </a>
        <div className="project">
          <span className="eyebrow">PERSONAL DESIGN EXPLORATION</span>
          <h1>
            Mini 3 <span>/</span> Propeller guard
          </h1>
        </div>
        <span className="concept-badge">CONCEPT REVIEW</span>
        <button
          className="mobile-comments"
          onClick={(event) => {
            origin.current = event.currentTarget;
            setDrawer(true);
          }}
        >
          Notes ({threads.length})
        </button>
        <div className="reviewer">
          <span className="avatar">M</span>
          <span>
            Mehmood <small>Personal workspace</small>
          </span>
        </div>
      </header>
      <main>
        <section className="workspace" aria-label="Design review workspace">
          <div className="toolbar">
            <div className="tool-group" aria-label="Board tool">
              <button
                aria-pressed={tool === "hand"}
                onClick={() => selectTool("hand")}
              >
                ✋ Hand <kbd>H</kbd>
              </button>
              <button
                className={
                  tool === "comment" ? "comment-active" : "comment-tool"
                }
                aria-pressed={tool === "comment"}
                onClick={() => selectTool("comment")}
              >
                ⊕ Comment <kbd>C</kbd>
              </button>
            </div>
          </div>
          <p
            className={`navigation-hint ${tool === "comment" ? "placing" : ""}`}
            id="board-instructions"
          >
            {tool === "comment"
              ? "Click to place a comment · Drag to pan · Enter on board to place at center"
              : rotationEnabled
                ? "Rotate 3D · Drag preview or focus it and use arrow keys · Scroll/pinch navigates · Escape exits"
                : "Drag to explore · Scroll to pan · Pinch or Ctrl/⌘ + scroll to zoom"}
          </p>
          <div
            className={`board-surface ${tool} ${rotationEnabled ? "rotate-mode" : ""}`}
            ref={input.surface}
            tabIndex={0}
            role="region"
            aria-label="Infinite concept board"
            aria-describedby="board-instructions"
            {...input.handlers}
            onKeyDown={(e) => {
              if (
                rotationEnabled &&
                e.target instanceof Element &&
                e.target.closest("[data-rotate-preview]")
              ) {
                const steps = new Map<string, [number, number]>([
                  ["ArrowLeft", [-18, 0]],
                  ["ArrowRight", [18, 0]],
                  ["ArrowUp", [0, -18]],
                  ["ArrowDown", [0, 18]],
                ]);
                const step = steps.get(e.key);
                if (step) {
                  e.preventDefault();
                  setOrientation((current) => rotateModel(current, ...step));
                  return;
                }
              }
              if (
                e.key === "Enter" &&
                e.target === e.currentTarget &&
                tool === "comment"
              ) {
                e.preventDefault();
                input.placeAtCenter();
              }
            }}
          >
            <Board
              viewport={input.viewport}
              rotationEnabled={rotationEnabled}
              yaw={orientation.yaw}
              pitch={orientation.pitch}
              onToggleRotation={toggleRotation}
            >
              {threads.map(
                (t, i) =>
                  (filter === "all" ||
                    (filter === "resolved") === t.resolved ||
                    t.id === selectedId) && (
                    <Pin
                      key={t.id}
                      thread={t}
                      index={i}
                      selected={t.id === selectedId}
                      viewport={input.viewport}
                      onSelect={() => select(t, false)}
                    />
                  ),
              )}
              {dp && (
                <span
                  className="draft-pin"
                  style={{ left: dp.x, top: dp.y }}
                  role="img"
                  aria-label="Draft comment position"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              )}
            </Board>
          </div>
          <div className="canvas-footer">
            <span className="board-caption">
              <span className="status-dot" /> FOUR STUDIES · {openCount} OPEN{" "}
              {openCount === 1 ? "THREAD" : "THREADS"}
            </span>
            <div className="zoom-controls">
              <button aria-label="Zoom out" onClick={() => input.zoom(1 / 1.2)}>
                −
              </button>
              <output aria-label="Zoom level">
                {Math.round(input.viewport.scale * 100)}%
              </output>
              <button aria-label="Zoom in" onClick={() => input.zoom(1.2)}>
                +
              </button>
              <button
                onClick={() => {
                  setDrawer(false);
                  requestAnimationFrame(input.fit);
                }}
              >
                ⛶ Fit board
              </button>
            </div>
          </div>
          <label className="shortcut-setting">
            <input
              type="checkbox"
              checked={shortcuts}
              onChange={(e) => setShortcuts(e.target.checked)}
            />{" "}
            Letter shortcuts
          </label>
        </section>
        {!narrow && (
          <aside className="comments-panel" aria-labelledby="comments-title">
            {panel}
          </aside>
        )}
      </main>
      {narrow && (
        <dialog
          className="comments-panel mobile-sheet"
          ref={dialog}
          aria-labelledby="comments-title"
          onCancel={(e) => {
            e.preventDefault();
            if (!editable(document.activeElement)) escape();
          }}
        >
          {panel}
        </dialog>
      )}
      <div className="sr-only" role="status" aria-live="polite">
        {status}
      </div>
    </div>
  );
}
