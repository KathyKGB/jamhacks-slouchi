import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import slouchiImg from "../../imports/slouchi.png";
import plantImg from "../../imports/plant.png";

// TensorFlow & pose detection
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as poseDetection from "@tensorflow-models/pose-detection";

const FONT = "'ComputerSaysNo', 'Space Grotesk', sans-serif";

interface PostureScore {
  score: number;
  label: string;
}

// Keypoint indices for MoveNet
const KEYPOINT = {
  NOSE: 0,
  LEFT_EYE: 1,
  RIGHT_EYE: 2,
  LEFT_EAR: 3,
  RIGHT_EAR: 4,
  LEFT_SHOULDER: 5,
  RIGHT_SHOULDER: 6,
  LEFT_HIP: 11,
  RIGHT_HIP: 12,
};

const SKELETON_CONNECTIONS = [
  [KEYPOINT.LEFT_EAR, KEYPOINT.LEFT_EYE],
  [KEYPOINT.RIGHT_EAR, KEYPOINT.RIGHT_EYE],
  [KEYPOINT.LEFT_EYE, KEYPOINT.NOSE],
  [KEYPOINT.RIGHT_EYE, KEYPOINT.NOSE],
  [KEYPOINT.LEFT_SHOULDER, KEYPOINT.RIGHT_SHOULDER],
  [KEYPOINT.LEFT_SHOULDER, KEYPOINT.LEFT_HIP],
  [KEYPOINT.RIGHT_SHOULDER, KEYPOINT.RIGHT_HIP],
  [KEYPOINT.LEFT_HIP, KEYPOINT.RIGHT_HIP],
  [KEYPOINT.LEFT_EAR, KEYPOINT.LEFT_SHOULDER],
  [KEYPOINT.RIGHT_EAR, KEYPOINT.RIGHT_SHOULDER],
];

function analyzePosture(
  keypoints: poseDetection.Keypoint[],
  reference: ReferencePosture | null
): PostureScore {
  const get = (idx: number) => keypoints[idx];
  const ls = get(KEYPOINT.LEFT_SHOULDER);
  const rs = get(KEYPOINT.RIGHT_SHOULDER);
  const lh = get(KEYPOINT.LEFT_HIP);
  const rh = get(KEYPOINT.RIGHT_HIP);
  const le = get(KEYPOINT.LEFT_EAR);
  const re = get(KEYPOINT.RIGHT_EAR);

  const minConf = 0.3;

  let totalPenalty = 0;
  let checks = 0;

  // Shoulder tilt
  if (ls.score! > minConf && rs.score! > minConf) {
    const tilt = Math.abs(ls.y - rs.y);
    const shoulderWidth = Math.abs(ls.x - rs.x) || 1;
    const tiltRatio = tilt / shoulderWidth;
    const refTilt = reference?.shoulderTilt ?? 0.05;
    const excess = Math.max(0, tiltRatio - refTilt - 0.03);
    totalPenalty += Math.min(excess * 300, 40);
    checks++;
  }

  // Head forward (ear vs shoulder horizontal offset)
  if (le.score! > minConf && ls.score! > minConf) {
    const shoulderWidth = Math.abs(ls.x - (rs.score! > minConf ? rs.x : ls.x)) || 100;
    const earForward = ls.x - le.x;
    const earRatio = earForward / shoulderWidth;
    const refEar = reference?.earForwardRatio ?? 0.1;
    const excess = Math.max(0, earRatio - refEar - 0.05);
    totalPenalty += Math.min(excess * 250, 35);
    checks++;
  } else if (re.score! > minConf && rs.score! > minConf) {
    const shoulderWidth = Math.abs(rs.x - (ls.score! > minConf ? ls.x : rs.x)) || 100;
    const earForward = re.x - rs.x;
    const earRatio = earForward / shoulderWidth;
    const refEar = reference?.earForwardRatio ?? 0.1;
    const excess = Math.max(0, earRatio - refEar - 0.05);
    totalPenalty += Math.min(excess * 250, 35);
    checks++;
  }

  // Spine alignment: shoulder midpoint vs hip midpoint horizontal
  if (ls.score! > minConf && rs.score! > minConf && lh.score! > minConf && rh.score! > minConf) {
    const shoulderMidX = (ls.x + rs.x) / 2;
    const hipMidX = (lh.x + rh.x) / 2;
    const shoulderWidth = Math.abs(ls.x - rs.x) || 100;
    const spineOffset = Math.abs(shoulderMidX - hipMidX) / shoulderWidth;
    const refSpine = reference?.spineOffset ?? 0.05;
    const excess = Math.max(0, spineOffset - refSpine - 0.04);
    totalPenalty += Math.min(excess * 300, 25);
    checks++;
  }

  if (checks === 0) return { score: 50, label: "detecting..." };

  const score = Math.max(0, Math.min(100, 100 - totalPenalty));
  return {
    score,
    label: score >= 70 ? "upright" : score >= 40 ? "slouching" : "slouched",
  };
}

interface ReferencePosture {
  shoulderTilt: number;
  earForwardRatio: number;
  spineOffset: number;
}

function captureReferencePosture(keypoints: poseDetection.Keypoint[]): ReferencePosture {
  const get = (idx: number) => keypoints[idx];
  const ls = get(KEYPOINT.LEFT_SHOULDER);
  const rs = get(KEYPOINT.RIGHT_SHOULDER);
  const lh = get(KEYPOINT.LEFT_HIP);
  const rh = get(KEYPOINT.RIGHT_HIP);
  const le = get(KEYPOINT.LEFT_EAR);
  const re = get(KEYPOINT.RIGHT_EAR);

  const shoulderWidth = Math.abs(ls.x - rs.x) || 100;
  const shoulderTilt = Math.abs(ls.y - rs.y) / shoulderWidth;

  let earForwardRatio = 0.1;
  if (le.score! > 0.3 && ls.score! > 0.3) {
    earForwardRatio = (ls.x - le.x) / shoulderWidth;
  } else if (re.score! > 0.3 && rs.score! > 0.3) {
    earForwardRatio = (re.x - rs.x) / shoulderWidth;
  }

  let spineOffset = 0.02;
  if (ls.score! > 0.3 && rs.score! > 0.3 && lh.score! > 0.3 && rh.score! > 0.3) {
    const shoulderMidX = (ls.x + rs.x) / 2;
    const hipMidX = (lh.x + rh.x) / 2;
    spineOffset = Math.abs(shoulderMidX - hipMidX) / shoulderWidth;
  }

  return { shoulderTilt, earForwardRatio, spineOffset };
}

function getSkeletonColor(score: number) {
  if (score >= 70) return "#4ade80";
  if (score >= 40) return "#fbbf24";
  return "#f87171";
}

export function PostureDetector() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<"idle" | "loading" | "calibrating" | "running" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [postureScore, setPostureScore] = useState(50);
  const [postureLabel, setPostureLabel] = useState("—");
  const [calibCountdown, setCalibCountdown] = useState(3);
  const [sessionTime, setSessionTime] = useState(0);
  const [goodFrames, setGoodFrames] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);

  const referenceRef = useRef<ReferencePosture | null>(null);
  const calibratingRef = useRef(false);
  const calibFramesRef = useRef<ReferencePosture[]>([]);
  const sessionStartRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const drawPose = useCallback(
    (keypoints: poseDetection.Keypoint[], score: number, videoEl: HTMLVideoElement) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const color = getSkeletonColor(score);

      // Draw connections
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      for (const [a, b] of SKELETON_CONNECTIONS) {
        const kpA = keypoints[a];
        const kpB = keypoints[b];
        if (kpA.score! > 0.3 && kpB.score! > 0.3) {
          ctx.beginPath();
          ctx.moveTo(kpA.x, kpA.y);
          ctx.lineTo(kpB.x, kpB.y);
          ctx.stroke();
        }
      }

      // Draw keypoints
      for (const kp of keypoints) {
        if (kp.score! > 0.3) {
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }
      }
    },
    []
  );

  const runDetection = useCallback(async () => {
    const detector = detectorRef.current;
    const video = videoRef.current;
    if (!detector || !video || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(runDetection);
      return;
    }

    try {
      const poses = await detector.estimatePoses(video);
      if (poses.length > 0) {
        const keypoints = poses[0].keypoints;
        const result = analyzePosture(keypoints, referenceRef.current);
        setPostureScore(Math.round(result.score));
        setPostureLabel(result.label);

        setTotalFrames((t) => t + 1);
        if (result.score >= 70) setGoodFrames((g) => g + 1);

        // Calibration: collect frames
        if (calibratingRef.current) {
          const ref = captureReferencePosture(keypoints);
          calibFramesRef.current.push(ref);
        }

        drawPose(keypoints, result.score, video);
      }
    } catch {
      // continue silently
    }

    animFrameRef.current = requestAnimationFrame(runDetection);
  }, [drawPose]);

  const startCamera = useCallback(async () => {
    setStatus("loading");
    try {
      await tf.setBackend("webgl");
      await tf.ready();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
      );
      detectorRef.current = detector;

      // Start calibration
      setStatus("calibrating");
      calibratingRef.current = true;
      calibFramesRef.current = [];
      let count = 3;
      setCalibCountdown(3);

      const countdown = setInterval(() => {
        count--;
        setCalibCountdown(count);
        if (count <= 0) {
          clearInterval(countdown);
          calibratingRef.current = false;

          // Average reference frames
          if (calibFramesRef.current.length > 0) {
            const avg = calibFramesRef.current.reduce(
              (acc, f) => ({
                shoulderTilt: acc.shoulderTilt + f.shoulderTilt,
                earForwardRatio: acc.earForwardRatio + f.earForwardRatio,
                spineOffset: acc.spineOffset + f.spineOffset,
              }),
              { shoulderTilt: 0, earForwardRatio: 0, spineOffset: 0 }
            );
            const n = calibFramesRef.current.length;
            referenceRef.current = {
              shoulderTilt: avg.shoulderTilt / n,
              earForwardRatio: avg.earForwardRatio / n,
              spineOffset: avg.spineOffset / n,
            };
          }

          setStatus("running");
          sessionStartRef.current = Date.now();
          timerRef.current = setInterval(() => {
            setSessionTime(Math.floor((Date.now() - sessionStartRef.current) / 1000));
          }, 1000);
        }
      }, 1000);

      animFrameRef.current = requestAnimationFrame(runDetection);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
      setStatus("error");
    }
  }, [runDetection]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      detectorRef.current?.dispose();
    };
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const goodPct = totalFrames > 0 ? Math.round((goodFrames / totalFrames) * 100) : 0;

  const barColor = postureScore >= 70 ? "#4ade80" : postureScore >= 40 ? "#fbbf24" : "#f87171";

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
          posture detector
        </button>
        <img src={slouchiImg} alt="slouchi" style={{ height: "36px" }} />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", gap: "16px", padding: "0 16px", minHeight: 0 }}>
        {/* Camera panel */}
        <div
          style={{
            flex: "0 0 62%",
            backgroundColor: "#2d3d2e",
            borderRadius: "12px",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <video
            ref={videoRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: status === "running" || status === "calibrating" ? "block" : "none",
              transform: "scaleX(-1)",
            }}
            muted
            playsInline
          />
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: status === "running" ? "block" : "none",
              transform: "scaleX(-1)",
            }}
          />

          {/* Overlay states */}
          {status === "idle" && (
            <button
              onClick={startCamera}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#c8d5c8",
              }}
            >
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <rect x="6" y="18" width="52" height="36" rx="4" stroke="#c8d5c8" strokeWidth="3" />
                <circle cx="32" cy="36" r="10" stroke="#c8d5c8" strokeWidth="3" />
                <path d="M24 18 L28 10 H36 L40 18" stroke="#c8d5c8" strokeWidth="3" strokeLinejoin="round" />
              </svg>
              <span style={{ fontFamily: FONT, fontSize: "18px", color: "#c8d5c8" }}>camera</span>
            </button>
          )}

          {status === "loading" && (
            <div style={{ color: "#c8d5c8", fontFamily: FONT, fontSize: "16px", textAlign: "center" }}>
              loading model...
            </div>
          )}

          {status === "calibrating" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.55)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
              }}
            >
              <div style={{ color: "#fff", fontFamily: FONT, fontSize: "18px" }}>
                hold your best posture!
              </div>
              <div
                style={{
                  color: "#4ade80",
                  fontFamily: FONT,
                  fontSize: "clamp(40px, 6vw, 72px)",
                }}
              >
                {calibCountdown}
              </div>
              <div style={{ color: "#c8d5c8", fontFamily: FONT, fontSize: "14px" }}>
                calibrating reference posture
              </div>
            </div>
          )}

          {status === "error" && (
            <div style={{ color: "#f87171", fontFamily: FONT, fontSize: "14px", padding: "16px", textAlign: "center" }}>
              {errorMsg || "camera error. please allow camera access."}
              <br />
              <button
                onClick={startCamera}
                style={{ marginTop: "12px", fontFamily: FONT, fontSize: "14px", cursor: "pointer", color: "#4ade80", background: "none", border: "1px solid #4ade80", padding: "6px 14px", borderRadius: "6px" }}
              >
                retry
              </button>
            </div>
          )}

          {/* Session stats overlay (running) */}
          {status === "running" && (
            <div
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                background: "rgba(0,0,0,0.45)",
                borderRadius: "8px",
                padding: "6px 12px",
                color: "#fff",
                fontFamily: FONT,
                fontSize: "13px",
                lineHeight: "1.6",
              }}
            >
              <div>⏱ {formatTime(sessionTime)}</div>
              <div>✓ {goodPct}% good posture</div>
            </div>
          )}
        </div>

        {/* Right panel: leaf image + instructions */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            minWidth: 0,
          }}
        >
          {/* Leaf / plant image */}
          <div
            style={{
              flex: "0 0 55%",
              borderRadius: "12px",
              overflow: "hidden",
              backgroundColor: "#4a6741",
            }}
          >
            <img
              src={plantImg}
              alt="plant"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Instructions */}
          <div
            style={{
              flex: 1,
              backgroundColor: "rgba(255,255,255,0.6)",
              borderRadius: "12px",
              padding: "14px 16px",
              border: "1px solid rgba(0,0,0,0.08)",
              overflowY: "auto",
            }}
          >
            <div style={{ fontFamily: FONT, fontSize: "17px", color: "#1a1a1a", lineHeight: 1.7 }}>
              <strong>how to use</strong>
              <ol style={{ paddingLeft: "16px", marginTop: "6px" }}>
                <li>1.  click the camera icon to start</li>
                <li>2.  sit up straight and hold for 3s to calibrate</li>
                <li>3.  green is upright, amber is ok, red is slouching</li>
                <li>4.  the bar shows your live posture score</li>
              </ol>
              {status === "running" && (
                <div style={{ marginTop: "10px", color: barColor }}>
                  <strong>current: {postureLabel}</strong> ({postureScore}/100)
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Posture bar */}
      <div style={{ padding: "12px 16px 16px", flexShrink: 0 }}>
        <div
          style={{
            backgroundColor: "#2d3d2e",
            borderRadius: "8px",
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span style={{ fontFamily: FONT, fontSize: "13px", color: "#9bb89b", minWidth: "65px" }}>
            slouched
          </span>
          <div
            style={{
              flex: 1,
              height: "10px",
              background: "linear-gradient(90deg, #f87171 0%, #fbbf24 50%, #4ade80 100%)",
              borderRadius: "5px",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: `${postureScore}%`,
                transform: "translate(-50%, -50%)",
                width: "16px",
                height: "16px",
                backgroundColor: "#fff",
                border: `3px solid ${barColor}`,
                borderRadius: "50%",
                transition: "left 0.3s ease",
              }}
            />
          </div>
          <span style={{ fontFamily: FONT, fontSize: "13px", color: "#9bb89b", minWidth: "45px", textAlign: "right" }}>
            upright
          </span>
        </div>
      </div>
    </div>
  );
}
