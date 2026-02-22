import { useState } from "react";

export default function FabGroup({
  onEdit,
  onToggleBookmark,
  isBookmarked,
  onHome,
  onToggleMusic,
  isMusicOn,
}) {
  const [open, setOpen] = useState(false);

  const Action = ({ label, onClick }) => (
    <button
      onClick={() => {
        onClick();
        setOpen(false); // 누르면 닫히게
      }}
      style={{
        width: 44,
        height: 44,
        borderRadius: 999,
        border: "1px solid #ddd",
        background: "white",
        cursor: "pointer",
        boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
      }}
      aria-label={label}
      title={label}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 10,
        zIndex: 9999,
      }}
    >
      {/* 펼친 상태일 때 서브 액션들 */}
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Action label="✏️" onClick={onEdit} />
          <Action label={isBookmarked ? "🔖" : "📑"} onClick={onToggleBookmark} />
          <Action label="🏠" onClick={onHome} />
          <Action label={isMusicOn ? "🎧" : "🔇"} onClick={onToggleMusic} />
        </div>
      )}

      {/* 메인 FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 56,
          height: 56,
          borderRadius: 999,
          border: "none",
          background: "#111",
          color: "white",
          cursor: "pointer",
          boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
          fontSize: 18,
        }}
        aria-label="퀴즈 메뉴"
        title="퀴즈 메뉴"
      >
        {open ? "×" : "≡"}
      </button>
    </div>
  );
}