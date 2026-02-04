import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      gap: "24px",
      backgroundColor: "#ffffff",
      color: "#000000"
    }}>
      <h1 style={{ fontSize: "48px", margin: 0 }}>Boring Golf</h1>

      <div style={{ display: "flex", gap: "16px" }}>
        <button
          onClick={() => navigate("/create-trip")}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "600",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Create Trip
        </button>

        <button
          onClick={() => navigate("/join")}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "600",
            backgroundColor: "#16a34a",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Join Trip
        </button>
      </div>
    </div>
  );
}
