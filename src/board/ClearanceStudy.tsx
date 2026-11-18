/** Conceptual plan view of the guard in PropellerGuardModel, not aircraft dimensions. */
export function ClearanceStudy() {
  return (
    <figure className="technical-sketch clearance-study">
      <svg
        viewBox="0 0 480 262"
        role="img"
        aria-label="guard top view: outer and inner rail edges, four rail support positions and proposed clip matching the 3D guard. Dashed rotor sweep and tip clearance are unverified references; not to scale, dimensions TBD."
      >
        <defs>
          <pattern
            id="clearance-grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M20 0H0V20"
              fill="none"
              stroke="#e7e9e2"
              strokeWidth=".7"
            />
          </pattern>
        </defs>
        <rect width="480" height="262" fill="url(#clearance-grid)" />
        <text className="drawing-heading" x="18" y="22">
          TOP VIEW
        </text>
        <text className="drawing-note" x="390" y="22">
          NOT TO SCALE
        </text>
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M132 42v192M40 132h184"
            stroke="#bdc8b7"
            strokeDasharray="3 5"
          />
          {/* The two raised rails share a plan footprint; these are its outside/inside edges. */}
          <circle
            cx="132"
            cy="132"
            r="78"
            fill="#e8edeb"
            stroke="#71878b"
            strokeWidth="2.5"
          />
          <circle
            cx="132"
            cy="132"
            r="73"
            fill="#fafbf7"
            stroke="#41594a"
            strokeWidth="2"
          />
          <circle
            cx="132"
            cy="132"
            r="61"
            stroke="#bd7949"
            strokeDasharray="5 5"
            strokeWidth="2"
          />
          {/* The 3D model has perimeter supports, not a hub or internal Y-shaped spokes. */}
          {[
            [132, 56.5],
            [207.5, 132],
            [132, 207.5],
            [56.5, 132],
          ].map(([x, y]) => (
            <circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r="2.5"
              fill="#9aa9a8"
              stroke="#52696e"
              strokeWidth="1"
            />
          ))}
          <path
            d="m108 203 24 11 24-11M132 214v9"
            stroke="#8b9b9d"
            strokeWidth="4"
          />
          <rect
            x="121"
            y="219"
            width="22"
            height="10"
            rx="2"
            fill="#bd8a5d"
            stroke="#657b7f"
            strokeWidth="1.5"
          />
          <path
            d="M193 132v18m12-18v18m-12-4h12"
            stroke="#bd7949"
            strokeWidth="1.3"
          />
          <path d="m187 77 51-29h24" stroke="#68725f" strokeWidth="1.2" />
          <path d="m184 81 54-3h24" stroke="#68725f" strokeWidth="1.2" />
          <path d="m185 102 53 6h24" stroke="#68725f" strokeWidth="1.2" />
          <path d="m199 146 39-2h24" stroke="#68725f" strokeWidth="1.2" />
          <path d="m132 207.5 106-29.5h24" stroke="#68725f" strokeWidth="1.2" />
          <path d="m143 225 95-14h24" stroke="#68725f" strokeWidth="1.2" />
        </g>
        <text className="drawing-label" x="272" y="51">
          OUTER GUARD EDGE
        </text>
        <text className="drawing-label" x="272" y="81">
          INNER GUARD EDGE
        </text>
        <text className="drawing-label" x="272" y="111">
          ROTOR SWEEP / TBD
        </text>
        <text className="drawing-label" x="272" y="147">
          TIP CLEARANCE / TBD
        </text>
        <text className="drawing-label" x="272" y="181">
          RAIL SUPPORT
        </text>
        <text className="drawing-label" x="272" y="214">
          PROPOSED CLIP
        </text>
        <path
          d="M18 247h18"
          fill="none"
          stroke="#bd7949"
          strokeDasharray="4 3"
          strokeWidth="1.5"
        />
        <text className="drawing-note" x="42" y="250">
          ROTOR REFERENCE
        </text>
        <text className="drawing-note" x="338" y="250">
          DIMENSIONS TBD
        </text>
      </svg>
      <figcaption>CONCEPT TOP VIEW · FIT &amp; CLEARANCE UNVERIFIED</figcaption>
    </figure>
  );
}
