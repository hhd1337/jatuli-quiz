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

    const Action = ({
                        icon,
                        label,
                        onClick,
                        active = false,
                    }) => (
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
                border: active
                    ? "2px solid #111"
                    : "1px solid #ddd",
                background: active
                    ? "#f1f1f1"
                    : "white",
                cursor: "pointer",
                boxShadow: active
                    ? "0 6px 18px rgba(0,0,0,0.22)"
                    : "0 6px 16px rgba(0,0,0,0.12)",
                fontSize: 18,
                transition: "all 0.15s ease",
            }}
            aria-label={label}
            aria-pressed={active}
            title={label}
        >
            {icon}
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
                    <Action
                        icon="✏️"
                        label="문제 수정"
                        onClick={onEdit}
                    />

                    <Action
                        icon="🏠"
                        label="홈으로 이동"
                        onClick={onHome}
                    />

                    <Action
                        icon={isMusicOn ? "🎧" : "🔇"}
                        label={
                            isMusicOn
                                ? "백색소음 정지"
                                : "백색소음 재생"
                        }
                        onClick={onToggleMusic}
                        active={isMusicOn}
                    />

                    {showScratchpadAction && (
                        <Action
                            icon="📝"
                            label="임시 답안 연습장 열기"
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
                aria-label={open ? "퀴즈 메뉴 닫기" : "퀴즈 메뉴 열기"}
                aria-expanded={open}
                title={open ? "퀴즈 메뉴 닫기" : "퀴즈 메뉴 열기"}
            >
                {open ? "×" : "≡"}
            </button>
        </div>
    );
}