import { useState } from "react";
import { useNavigate } from "react-router";
import slouchiImg from "../../imports/slouchi.png";
import snailImg from "../../imports/snail.png";
import shellImg from "../../imports/shell.png";
import plantImg from "../../imports/plant.png";

const FONT = "'ComputerSaysNo', 'Space Grotesk', sans-serif";

interface Stretch {
  id: string;
  name: string;
  duration: string;
  description: string;
  steps: string[];
  target: string;
  emoji: string;
}

const STRETCHES: Stretch[] = [
  {
    id: "chin-tuck",
    name: "chin tuck",
    duration: "30 sec · 3 reps",
    description: "counteracts forward head posture by strengthening deep neck flexors.",
    steps: [
      "sit tall with shoulders relaxed",
      "gently draw your chin straight back",
      "hold for 5 seconds",
      "slowly release and repeat",
    ],
    target: "neck & cervical spine",
  },
  {
    id: "chest-opener",
    name: "chest opener",
    duration: "45 sec · 2 reps",
    description: "opens the chest and counteracts rounded shoulders caused by slouching.",
    steps: [
      "stand or sit upright",
      "clasp hands behind your back",
      "squeeze shoulder blades together",
      "lift hands slightly and hold",
    ],
    target: "chest & shoulders",
  },
  {
    id: "thoracic-extension",
    name: "thoracic extension",
    duration: "60 sec · 2 reps",
    description: "mobilises the mid-back to restore natural spinal curvature.",
    steps: [
      "sit in a chair with a backrest",
      "clasp hands behind your head",
      "gently arch backwards over the chair top",
      "breathe deeply and hold",
    ],
    target: "thoracic spine",
  },
  {
    id: "shoulder-rolls",
    name: "shoulder rolls",
    duration: "30 sec",
    description: "releases tension built up in the upper trapezius from hunching.",
    steps: [
      "sit or stand with arms relaxed",
      "roll both shoulders forward 5 times",
      "roll backwards 5 times",
      "let your arms hang loose after",
    ],
    target: "upper traps & neck",
  },
  {
    id: "cat-cow",
    name: "cat–cow",
    duration: "60 sec",
    description: "the fibonacci of spinal health, gently articulates every vertebra.",
    steps: [
      "come onto hands and knees",
      "inhale: drop belly, lift head",
      "exhale: round spine, tuck chin",
      "flow slowly with your breath",
    ],
    target: "full spine",
  },
];

export function StretchesPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const toggleStretch = (id: string) => {
    setActive((prev) => (prev === id ? null : id));
  };

  const markDone = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const doneCount = completed.size;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#f0ede6",
        backgroundImage:
          "linear-gradient(rgba(180,180,200,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(180,180,200,0.3) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        display: "flex",
        flexDirection: "column",
        fontFamily: FONT,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px 8px",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            fontFamily: FONT,
            fontSize: "clamp(13px, 1.4vw, 18px)",
            color: "#1a1a1a",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          stretches
        </button>
        <img src={slouchiImg} alt="slouchi" style={{ height: "36px" }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", gap: "16px", padding: "8px 16px 16px", minHeight: 0 }}>
        {/* Left: stretch list */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0", minHeight: 0 }}>
          {/* Progress */}
          <div
            style={{
              backgroundColor: "#2d3d2e",
              borderRadius: "10px 10px 0 0",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <span style={{ fontFamily: FONT, fontSize: "13px", color: "#9bb89b" }}>
              posture stretch routine
            </span>
            <span style={{ fontFamily: FONT, fontSize: "13px", color: "#c5d94e" }}>
              {doneCount}/{STRETCHES.length} done
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ backgroundColor: "#1a2e1b", height: "6px", flexShrink: 0 }}>
            <div
              style={{
                height: "100%",
                width: `${(doneCount / STRETCHES.length) * 100}%`,
                backgroundColor: "#c5d94e",
                transition: "width 0.4s ease",
              }}
            />
          </div>

          {/* Stretches */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {STRETCHES.map((s, i) => {
              const isActive = active === s.id;
              const isDone = completed.has(s.id);
              const isLast = i === STRETCHES.length - 1;

              return (
                <div
                  key={s.id}
                  style={{
                    backgroundColor: isDone ? "#1a2e1b" : "#2d3d2e",
                    borderRadius: isLast ? "0 0 10px 10px" : "0",
                    borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.06)",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onClick={() => toggleStretch(s.id)}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>{s.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontFamily: FONT,
                          fontSize: "clamp(13px, 1.4vw, 16px)",
                          color: isDone ? "#9bb89b" : "#e8f0e8",
                          textDecoration: isDone ? "line-through" : "none",
                        }}
                      >
                        {s.name}
                      </div>
                      <div style={{ fontFamily: FONT, fontSize: "11px", color: "#6a8a6b" }}>
                        {s.duration} · {s.target}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        onClick={(e) => markDone(s.id, e)}
                        style={{
                          fontFamily: FONT,
                          fontSize: "11px",
                          backgroundColor: isDone ? "#c5d94e" : "transparent",
                          color: isDone ? "#1a1a1a" : "#9bb89b",
                          border: `1px solid ${isDone ? "#c5d94e" : "#4a6741"}`,
                          borderRadius: "6px",
                          padding: "4px 10px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {isDone ? "done ✓" : "done?"}
                      </button>
                      <span style={{ color: "#4a6741", fontSize: "12px" }}>
                        {isActive ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>

                  {/* Expanded steps */}
                  {isActive && (
                    <div
                      style={{
                        padding: "0 16px 14px 52px",
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: FONT,
                          fontSize: "12px",
                          color: "#9bb89b",
                          margin: "10px 0 8px",
                          lineHeight: 1.6,
                        }}
                      >
                        {s.description}
                      </p>
                      <ol style={{ paddingLeft: "16px", margin: 0 }}>
                        {s.steps.map((step, si) => (
                          <li
                            key={si}
                            style={{
                              fontFamily: FONT,
                              fontSize: "12px",
                              color: "#c8d5c8",
                              lineHeight: 1.7,
                            }}
                          >
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: decorative nature column */}
        <div
          style={{
            width: "clamp(120px, 18%, 200px)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "8px",
          }}
        >
          <img
            src={snailImg}
            alt="snail"
            style={{
              width: "100%",
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
            }}
          />
          <img
            src={plantImg}
            alt="plant"
            style={{
              width: "70%",
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
            }}
          />
          <img
            src={shellImg}
            alt="shell"
            style={{
              width: "85%",
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
            }}
          />

          <div
            style={{
              fontFamily: FONT,
              fontSize: "10px",
              color: "#888",
              textAlign: "center",
              lineHeight: 1.5,
              padding: "0 4px",
            }}
          >
            unraveling the fibonacci
          </div>
        </div>
      </div>
    </div>
  );
}
