import { useState } from "react";

export default function FabGroup({
                                     onEdit,
                                     onHome,
                                     onToggleMusic,
                                     isMusicOn,
                                     onShowScratchpad,
                                     showScratchpadAction = false,
                                 }) {
    const [open, setOpen] = useState(false);

    const Action = ({ label, onClick }) => (
        <button
            type="button"
            onClick={() => {
                onClick?.();
                setOpen(false);
            }}
            style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                border: "1px solid #ddd",
                background: "white",
                cursor: "pointer",
                boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                fontSize: 18,
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
            {open && (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                    }}
                >
                    <Action label="✏️" onClick={onEdit} />
                    <Action label="🏠" onClick={onHome} />
                    <Action
                        label={isMusicOn ? "🎧" : "🔇"}
                        onClick={onToggleMusic}
                    />

                    {showScratchpadAction && (
                        <Action
                            label="📝"
                            onClick={onShowScratchpad}
                        />
                    )}
                </div>
            )}

            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
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