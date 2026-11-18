import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import type { Thread, Viewport } from "../shared/types";
import { worldToScreen } from "../viewport/math";
const PropellerGuardPreview = lazy(() =>
  import("../preview/PropellerGuardPreview").then((m) => ({
    default: m.PropellerGuardPreview,
  })),
);
import { items } from "./items";
import { ClearanceStudy } from "./ClearanceStudy";
const materialOptions = [
  {
    name: "PA12",
    process: "SLS",
    note: "Candidate · review stiffness and durability",
    tone: "pa12",
  },
  {
    name: "PETG",
    process: "FDM",
    note: "Candidate · preliminary static fit testing",
    tone: "petg",
  },
  {
    name: "TPU",
    process: "FDM",
    note: "Candidate · investigate flexibility and deflection",
    tone: "tpu",
  },
  {
    name: "PLA",
    process: "FDM",
    note: "Visual mock-up only",
    tone: "pla",
  },
] as const;
function MaterialStudy() {
  return (
    <div className="materials-study">
      {materialOptions.map((option) => (
        <div className={`material-tile ${option.tone}`} key={option.name}>
          <div className="material-name">
            <strong>{option.name}</strong>
            <span>{option.process}</span>
          </div>
          <p>{option.note}</p>
        </div>
      ))}
      <p className="materials-caveat">
        Exploratory only · No option is verified for safety or compatibility.
      </p>
    </div>
  );
}
const reviewQuestions = [
  "Verify rotor sweep and guard deflection.",
  "Confirm clip attachment and folded-arm clearance.",
  "Measure the complete guard assembly and review added weight.",
];
function DesignChecklist() {
  return (
    <div className="review-checklist">
      <h3>Before we print.</h3>
      <ol>
        {reviewQuestions.map((question, index) => (
          <li key={question}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            {question}
          </li>
        ))}
      </ol>
      <p>Next: physical measurements and static bench review.</p>
    </div>
  );
}
export function Board({
  viewport,
  rotationEnabled,
  yaw,
  pitch,
  onToggleRotation,
  children,
}: {
  viewport: Viewport;
  rotationEnabled: boolean;
  yaw: number;
  pitch: number;
  onToggleRotation: () => void;
  children: ReactNode;
}) {
  return (
    <>
      <div
        className="world"
        style={{
          transform: `translate(${viewport.translation.x}px,${viewport.translation.y}px) scale(${viewport.scale})`,
        }}
      >
        {items.map((item) => (
          <article
            className="board-card"
            key={item.id}
            style={{ left: item.x, top: item.y }}
          >
            <header>
              <h2>{item.title}</h2>
              {item.id === "guard" ? (
                <div className="assembly-header-meta">
                  <span>{item.label}</span>
                  <button
                    className="rotate-trigger"
                    data-board-controls
                    aria-pressed={rotationEnabled}
                    onClick={onToggleRotation}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      width="14"
                      height="14"
                    >
                      <path
                        d="M3 7a5.5 5.5 0 0 1 9.4-3.9L14 4.7M14 2v3h-3M13 9a5.5 5.5 0 0 1-9.4 3.9L2 11.3M2 14v-3h3"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />
                    </svg>
                    Rotate 3D
                  </button>
                </div>
              ) : (
                <span>{item.label}</span>
              )}
            </header>
            {item.id === "guard" ? (
              <Suspense
                fallback={
                  <div className="webgl-fallback">Loading concept preview…</div>
                }
              >
                <PropellerGuardPreview
                  yaw={yaw}
                  pitch={pitch}
                  rotationEnabled={rotationEnabled}
                />
              </Suspense>
            ) : item.id === "clearance" ? (
              <ClearanceStudy />
            ) : item.id === "materials" ? (
              <MaterialStudy />
            ) : (
              <DesignChecklist />
            )}
          </article>
        ))}
      </div>
      <div className="pins">{children}</div>
    </>
  );
}
export function Pin({
  thread,
  index,
  selected,
  viewport,
  onSelect,
}: {
  thread: Thread;
  index: number;
  selected: boolean;
  viewport: Viewport;
  onSelect: () => void;
}) {
  const p = worldToScreen(thread.position, viewport);
  return (
    <button
      className={`pin ${selected ? "selected" : ""} ${thread.resolved ? "resolved" : ""}`}
      style={{ left: p.x, top: p.y }}
      onClick={onSelect}
      aria-label={`Thread ${index + 1}, ${thread.resolved ? "resolved" : "open"}, ${thread.root.author.name}: ${thread.root.text}`}
      aria-pressed={selected}
    >
      <span>{thread.resolved ? "✓" : index + 1}</span>
    </button>
  );
}
