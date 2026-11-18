import { useEffect, useRef, useState } from "react";
import type { Dispatch } from "react";
import type { Filter, Message, Thread, WorldPoint } from "../shared/types";
import { CURRENT_AUTHOR } from "./threads";
import type { ThreadAction } from "./threads";
export const newMessage = (text: string): Message => ({
  id: crypto.randomUUID(),
  author: CURRENT_AUTHOR,
  text: text.trim(),
  createdAt: new Date().toISOString(),
});
function MessageView({
  message,
  editing,
  onEdit,
  onEnd,
  onSave,
}: {
  message: Message;
  editing: boolean;
  onEdit: () => void;
  onEnd: () => void;
  onSave: (text: string) => void;
}) {
  const [text, setText] = useState(message.text);
  const ref = useRef<HTMLTextAreaElement>(null);
  const editButton = useRef<HTMLButtonElement>(null);
  const wasEditing = useRef(false);
  useEffect(() => {
    if (editing) {
      setText(message.text);
      ref.current?.focus();
    }
    if (wasEditing.current && !editing) editButton.current?.focus();
    wasEditing.current = editing;
  }, [editing, message.text]);
  return (
    <article className="message">
      <div className="message-meta">
        <span className="avatar">{message.author.name.slice(0, 1)}</span>
        <strong>{message.author.name}</strong>
        <time
          dateTime={message.createdAt}
          title={new Date(message.createdAt).toLocaleString()}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </div>
      {editing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim()) onSave(text);
          }}
        >
          <label className="sr-only" htmlFor={`edit-${message.id}`}>
            Edit message
          </label>
          <textarea
            ref={ref}
            id={`edit-${message.id}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="form-actions">
            <button type="button" onClick={onEnd}>
              Cancel edit
            </button>
            <button className="primary" disabled={!text.trim()}>
              Save
            </button>
          </div>
        </form>
      ) : (
        <>
          <p>{message.text}</p>
          <div className="message-actions">
            {message.editedAt && <span>edited</span>}
            {message.author.id === CURRENT_AUTHOR.id && (
              <button
                ref={editButton}
                onClick={onEdit}
                aria-label={`Edit message: ${message.text}`}
              >
                Edit
              </button>
            )}
          </div>
        </>
      )}
    </article>
  );
}
interface Props {
  threads: Thread[];
  selected: Thread | undefined;
  draft: WorldPoint | null;
  draftText: string;
  setDraftText: (s: string) => void;
  filter: Filter;
  setFilter: (f: Filter) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  dispatch: Dispatch<ThreadAction>;
  onSelect: (t: Thread) => void;
  onBackToAllNotes: () => void;
  onClose: () => void;
  showCloseButton: boolean;
  onSubmit: () => void;
  onMoveDraft: () => void;
  onStatus: (s: string) => void;
}
export function CommentsPanel(p: Props) {
  const selected = p.selected;
  const [reply, setReply] = useState("");
  const composer = useRef<HTMLTextAreaElement>(null),
    heading = useRef<HTMLHeadingElement>(null);
  const isDraft = Boolean(p.draft),
    id = selected?.id;
  useEffect(() => {
    setReply("");
    if (isDraft) composer.current?.focus();
    else if (id) heading.current?.focus();
  }, [isDraft, id]);
  const counts = {
    all: p.threads.length,
    open: p.threads.filter((t) => !t.resolved).length,
    resolved: p.threads.filter((t) => t.resolved).length,
  };
  return (
    <>
      <div className="panel-title">
        <div>
          <span className="eyebrow">THE CONVERSATION</span>
          <h2 id="comments-title">
            Review notes <span>{p.threads.length}</span>
          </h2>
        </div>
        {p.showCloseButton && (
          <button onClick={p.onClose} aria-label="Close comments">
            ×
          </button>
        )}
      </div>
      <div className="filters" aria-label="Filter threads">
        {(["all", "open", "resolved"] as const).map((f) => (
          <button
            key={f}
            aria-pressed={p.filter === f}
            onClick={() => p.setFilter(f)}
          >
            {f[0].toUpperCase() + f.slice(1)} <span>{counts[f]}</span>
          </button>
        ))}
      </div>
      <div className="panel-scroll">
        {p.draft ? (
          <section className="draft-composer">
            <span className="eyebrow">NEW THREAD</span>
            <h3>Leave a little context.</h3>
            <p className="muted">
              Your pin marks a spot on the board. Click another spot to move it
              without losing your note.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                p.onSubmit();
              }}
            >
              <label htmlFor="draft">Comment as Mehmood</label>
              <textarea
                id="draft"
                ref={composer}
                placeholder="What should we look at here?"
                value={p.draftText}
                onChange={(e) => p.setDraftText(e.target.value)}
              />
              <div className="form-actions">
                <button type="button" onClick={p.onMoveDraft}>
                  Move pin
                </button>
                <button type="button" onClick={p.onClose}>
                  Cancel
                </button>
                <button className="primary" disabled={!p.draftText.trim()}>
                  Post comment ↗
                </button>
              </div>
            </form>
          </section>
        ) : selected ? (
          <section className="thread-detail">
            <button className="back" onClick={p.onBackToAllNotes}>
              ← All notes
            </button>
            <div className="thread-title">
              <h3 ref={heading} tabIndex={-1}>
                Thread {p.threads.findIndex((t) => t.id === id) + 1}
              </h3>
              <span className={`state ${selected.resolved ? "done" : ""}`}>
                {selected.resolved ? "✓ Resolved" : "● Open"}
              </span>
            </div>
            <button
              className="resolve-button"
              onClick={() => {
                p.dispatch({
                  type: "resolve",
                  threadId: selected.id,
                  resolved: !selected.resolved,
                });
                p.onStatus(
                  selected.resolved ? "Thread reopened." : "Thread resolved.",
                );
              }}
            >
              {selected.resolved ? "↺ Reopen thread" : "✓ Resolve thread"}
            </button>
            {[selected.root, ...selected.replies].map((message) => (
              <MessageView
                key={message.id}
                message={message}
                editing={p.editingId === message.id}
                onEdit={() => p.setEditingId(message.id)}
                onEnd={() => p.setEditingId(null)}
                onSave={(text) => {
                  p.dispatch({
                    type: "edit",
                    threadId: selected.id,
                    messageId: message.id,
                    text,
                    at: new Date().toISOString(),
                  });
                  p.setEditingId(null);
                  p.onStatus("Message saved.");
                }}
              />
            ))}
            <form
              className="reply-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!reply.trim()) return;
                p.dispatch({
                  type: "reply",
                  threadId: selected.id,
                  message: newMessage(reply),
                });
                setReply("");
                p.onStatus("Reply posted.");
              }}
            >
              <label htmlFor="reply">Reply as Mehmood</label>
              <textarea
                id="reply"
                placeholder="Add to the conversation…"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <button className="primary" disabled={!reply.trim()}>
                Post reply ↗
              </button>
            </form>
          </section>
        ) : (
          <>
            <p className="list-intro">
              A shared space for the details
              <br />
              that make a better concept.
            </p>
            <div className="thread-list">
              {p.threads
                .filter(
                  (t) =>
                    p.filter === "all" ||
                    (p.filter === "resolved") === t.resolved,
                )
                .map((t) => (
                  <button
                    className="thread-entry"
                    key={t.id}
                    onClick={() => p.onSelect(t)}
                  >
                    <div className="entry-top">
                      <span className={`number ${t.resolved ? "done" : ""}`}>
                        {t.resolved ? "✓" : p.threads.indexOf(t) + 1}
                      </span>
                      <strong>{t.root.author.name}</strong>
                      <span className="entry-state">
                        {t.resolved ? "Resolved" : "Open"}
                      </span>
                    </div>
                    <p>{t.root.text}</p>
                    <span className="entry-footer">
                      {t.replies.length}{" "}
                      {t.replies.length === 1 ? "reply" : "replies"}{" "}
                      <span>View thread ↗</span>
                    </span>
                  </button>
                ))}
              {counts[p.filter] === 0 && (
                <p className="muted">No {p.filter} threads yet.</p>
              )}
            </div>
            <div className="review-tip">
              <span>↖</span>
              <p>
                Have a thought?
                <br />
                <strong>Choose Comment, then click the board.</strong>
              </p>
            </div>
          </>
        )}
      </div>
      <footer className="panel-footer">
        <span className="avatar">M</span>
        <span>
          Reviewing as <strong>Mehmood</strong>
        </span>
        <span className="local-badge">LOCAL REVIEW</span>
      </footer>
    </>
  );
}
