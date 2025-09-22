export default function Landing({ onEnter }: { onEnter: () => void }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <button
        onClick={onEnter}
        style={{
          background: "#000",
          color: "#fff",
          border: "none",
          borderRadius: 9999,
          padding: "16px 28px",
          fontSize: 18,
          cursor: "pointer",
        }}
      >
        Welcome
      </button>
    </div>
  );
}


