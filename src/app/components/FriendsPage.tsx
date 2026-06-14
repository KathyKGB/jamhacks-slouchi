import { useState } from "react";
import { useNavigate } from "react-router";
import slouchiImg from "../../imports/slouchi.png";

const FONT = "'ComputerSaysNo', 'Space Grotesk', sans-serif";

interface Friend {
  id: string;
  name: string;
  score: number;
}

const INITIAL_FRIENDS: Friend[] = [
  { id: "kathleen", name: "Kathleen", score: 88 },
  { id: "lillian", name: "Lillian", score: 46 },
  { id: "tae_eun", name: "Tae Eun", score: 99 },
];

interface BetModalProps {
  friend: Friend;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}

function BetModal({ friend, onClose, onConfirm }: BetModalProps) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    const val = parseFloat(amount);
    if (!amount || isNaN(val) || val <= 0) {
      setError("please enter a valid amount");
      return;
    }
    onConfirm(val);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        fontFamily: FONT,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#f0ede6",
          borderRadius: "16px",
          padding: "32px",
          width: "360px",
          border: "2px solid #2d3d2e",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: "18px", color: "#1a1a1a", marginBottom: "8px" }}>
          bet against {friend.name}
        </div>
        <div style={{ fontSize: "13px", color: "#555", marginBottom: "24px" }}>
          {friend.name} has a posture score of {friend.score}. bet they'll have the worst posture!
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "13px", color: "#555", marginBottom: "6px", fontFamily: FONT }}>
            bet amount ($)
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "24px", color: "#1a1a1a" }}>$</span>
            <input
              type="number"
              min="0"
              step="1"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(""); }}
              placeholder="0"
              style={{
                fontFamily: FONT,
                fontSize: "24px",
                color: "#1a1a1a",
                border: "none",
                borderBottom: "2px solid #2d3d2e",
                background: "transparent",
                outline: "none",
                width: "100%",
                padding: "4px 0",
              }}
              autoFocus
            />
          </div>
          {error && <div style={{ color: "#f87171", fontSize: "12px", marginTop: "6px" }}>{error}</div>}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              fontFamily: FONT,
              fontSize: "15px",
              padding: "10px",
              border: "2px solid #2d3d2e",
              borderRadius: "8px",
              background: "transparent",
              cursor: "pointer",
              color: "#1a1a1a",
            }}
          >
            cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              flex: 1,
              fontFamily: FONT,
              fontSize: "15px",
              padding: "10px",
              border: "none",
              borderRadius: "8px",
              background: "#c5d94e",
              cursor: "pointer",
              color: "#1a1a1a",
            }}
          >
            bet!
          </button>
        </div>
      </div>
    </div>
  );
}

export function FriendsPage() {
  const navigate = useNavigate();
  const [friends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [bettingOn, setBettingOn] = useState<Friend | null>(null);
  const [bets, setBets] = useState<Record<string, number>>({});
  const [moneyPool, setMoneyPool] = useState(50);

  const handleBet = (friend: Friend) => {
    setBettingOn(friend);
  };

  const handleConfirmBet = (amount: number) => {
    if (!bettingOn) return;
    setBets((prev) => ({ ...prev, [bettingOn.id]: (prev[bettingOn.id] || 0) + amount }));
    setMoneyPool((prev) => prev + amount);
    setBettingOn(null);
  };

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
          friends
        </button>
        <img src={slouchiImg} alt="slouchi" style={{ height: "40px" }} />
      </div>

      {/* Money Pool */}
      <div style={{ textAlign: "center", padding: "24px 0 20px" }}>
        <div style={{ fontFamily: FONT, fontSize: "clamp(16px, 2vw, 24px)", color: "#1a1a1a", marginBottom: "4px" }}>
          Money Pool
        </div>
        <div style={{ fontFamily: FONT, fontSize: "clamp(32px, 5vw, 60px)", color: "#1a1a1a" }}>
          ${moneyPool.toFixed(0)}
        </div>
      </div>

      {/* Friends list */}
      <div style={{ flex: 1, padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto" }}>
        {friends.map((friend) => {
          const betAmt = bets[friend.id];
          return (
            <div
              key={friend.id}
              style={{
                backgroundColor: "#2d3d2e",
                borderRadius: "10px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              {/* Name */}
              <span
                style={{
                  fontFamily: FONT,
                  fontSize: "clamp(13px, 1.5vw, 18px)",
                  color: "#e8f0e8",
                  minWidth: "100px",
                }}
              >
                {friend.name}
              </span>

              {/* Bar */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontFamily: FONT, fontSize: "11px", color: "#9bb89b", minWidth: "55px" }}>
                  slouched
                </span>
                <div
                  style={{
                    flex: 1,
                    height: "14px",
                    backgroundColor: "#1a2e1b",
                    borderRadius: "7px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Pink/red fill from left */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      height: "100%",
                      width: `${friend.score}%`,
                      background: `linear-gradient(90deg, #f472b6 0%, #4ade80 100%)`,
                      borderRadius: "7px",
                    }}
                  />
                </div>
                <span style={{ fontFamily: FONT, fontSize: "11px", color: "#9bb89b", minWidth: "40px", textAlign: "right" }}>
                  upright
                </span>
              </div>

              {/* Score */}
              <span
                style={{
                  fontFamily: FONT,
                  fontSize: "clamp(14px, 1.8vw, 22px)",
                  color: "#e8f0e8",
                  minWidth: "36px",
                  textAlign: "right",
                }}
              >
                {friend.score}
              </span>

              {/* Bet button */}
              <button
                onClick={() => handleBet(friend)}
                style={{
                  fontFamily: FONT,
                  fontSize: "clamp(13px, 1.4vw, 17px)",
                  backgroundColor: "#c5d94e",
                  color: "#1a1a1a",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 18px",
                  cursor: "pointer",
                  minWidth: "70px",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {betAmt ? `$${betAmt} ✓` : "bet!"}
              </button>
            </div>
          );
        })}
      </div>

      {bettingOn && (
        <BetModal
          friend={bettingOn}
          onClose={() => setBettingOn(null)}
          onConfirm={handleConfirmBet}
        />
      )}
    </div>
  );
}
