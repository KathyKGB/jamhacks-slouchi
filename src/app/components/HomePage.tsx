import { useNavigate } from "react-router";
import sunflowerImg from "../../imports/sunflower.png";
import shellImg from "../../imports/shell.png";
import snailImg from "../../imports/snail.png";
import pineconeImg from "../../imports/pinecone.png";
import plantImg from "../../imports/plant.png";
import whiteShellImg from "../../imports/white_shell.png";
import slouchiImg from "../../imports/slouchi.png";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#f0ede6",
        backgroundImage:
          "linear-gradient(rgba(180,180,200,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(180,180,200,0.3) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'ComputerSaysNo', 'Space Grotesk', sans-serif",
      }}
    >
      {/* Pinecone - top left */}
      <img
        src={pineconeImg}
        alt="pinecone"
        style={{
          position: "absolute",
          top: "0%",
          left: "0%",
          width: "13%",
          maxWidth: "160px",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      {/* White shell - left middle */}
      <img
        src={whiteShellImg}
        alt="white shell"
        style={{
          position: "absolute",
          top: "36%",
          left: "0%",
          width: "20%",
          maxWidth: "150px",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      {/* Sunflower - bottom left (friends) */}
      <div
        style={{ position: "absolute", top: "40%", left: "17%", cursor: "pointer" }}
        onClick={() => navigate("/friends")}
      >
        <span
          style={{
            display: "block",
            fontFamily: "'ComputerSaysNo', 'Space Grotesk', sans-serif",
            fontSize: "clamp(12px, 1.4vw, 20px)",
            color: "#1a1a1a",
            marginBottom: "4px",
            letterSpacing: "0.01em",
          }}
        >
          friends
        </span>
        <img
          src={sunflowerImg}
          alt="sunflower"
          style={{
            width: "clamp(100px, 18vw, 240px)",
            display: "block",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
      </div>

      {/* Nautilus Shell - center (posture detector) */}
      <div
        style={{ position: "absolute", top: "18%", left: "40%", cursor: "pointer" }}
        onClick={() => navigate("/posture")}
      >
        <span
          style={{
            display: "block",
            fontFamily: "'ComputerSaysNo', 'Space Grotesk', sans-serif",
            fontSize: "clamp(12px, 1.4vw, 20px)",
            color: "#1a1a1a",
            marginBottom: "4px",
            letterSpacing: "0.01em",
          }}
        >
          posture detector
        </span>
        <img
          src={shellImg}
          alt="shell"
          style={{
            width: "clamp(140px, 24vw, 320px)",
            display: "block",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
      </div>

      {/* Green spiral plant - top right */}
      <img
        src={plantImg}
        alt="plant"
        style={{
          position: "absolute",
          top: "0%",
          right: "5%",
          width: "15%",
          maxWidth: "145px",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      {/* Snail - right side (stretches) */}
      <div
        style={{ position: "absolute", top: "32%", right: "7%", cursor: "pointer" }}
        onClick={() => navigate("/stretches")}
      >
        <span
          style={{
            display: "block",
            fontFamily: "'ComputerSaysNo', 'Space Grotesk', sans-serif",
            fontSize: "clamp(12px, 1.4vw, 20px)",
            color: "#1a1a1a",
            marginBottom: "4px",
            letterSpacing: "0.01em",
          }}
        >
          stretches
        </span>
        <img
          src={snailImg}
          alt="snail"
          style={{
            width: "clamp(120px, 20vw, 270px)",
            display: "block",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
      </div>

      {/* Bottom left text */}
      <div
        style={{
          position: "absolute",
          bottom: "4%",
          left: "3%",
          fontFamily: "'ComputerSaysNo', 'Space Grotesk', sans-serif",
          fontSize: "clamp(20px, 1.1vw, 16px)",
          color: "#1a1a1a",
          letterSpacing: "0.01em",
        }}
      >
        unraveling the fibonacci
      </div>

      {/* Slouchi logo - bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: "3%",
          right: "3%",
        }}
      >
        <img
          src={slouchiImg}
          alt="slouchi"
          style={{
            height: "clamp(80px, 4vh, 55px)",
            display: "block",
          }}
        />
      </div>
    </div>
  );
}
