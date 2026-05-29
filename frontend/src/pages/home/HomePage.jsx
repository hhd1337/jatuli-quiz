import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHomeData } from "../../shared/api/homeApi";

const pageStyle = {
    maxWidth: 800,
    margin: "0 auto",
    color: "var(--color-text)",
};

const cardStyle = {
    border: "1px solid var(--color-border)",
    background: "var(--color-surface)",
    color: "var(--color-text)",
    borderRadius: 12,
    padding: 16,
};

const mutedTextStyle = {
    color: "var(--color-text-muted)",
};

const buttonBaseStyle = {
    border: "1px solid var(--color-border)",
    background: "var(--color-button-bg)",
    color: "var(--color-button-text)",
    padding: "6px 12px",
    borderRadius: 6,
};

function getButtonStyle(disabled = false) {
    return {
        ...buttonBaseStyle,
        background: disabled
            ? "var(--color-button-disabled-bg)"
            : "var(--color-button-bg)",
        color: disabled
            ? "var(--color-button-disabled-text)"
            : "var(--color-button-text)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.65 : 1,
    };
}

export default function HomePage() {
    const navigate = useNavigate();

    const [homeData, setHomeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchHomeData() {
            try {
                setLoading(true);
                setError("");

                const data = await getHomeData();
                setHomeData(data);
            } catch (err) {
                console.error("홈 화면 조회 실패:", err);
                setError("홈 화면 정보를 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        }

        fetchHomeData();
    }, []);

    if (loading) {
        return (
            <div style={pageStyle}>
                <h1>자투리 퀴즈 홈</h1>
                <p style={mutedTextStyle}>불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={pageStyle}>
                <h1>자투리 퀴즈 홈</h1>
                <p style={{ color: "var(--color-primary)" }}>{error}</p>
            </div>
        );
    }

    if (!homeData) {
        return (
            <div style={pageStyle}>
                <h1>자투리 퀴즈 홈</h1>
                <p style={mutedTextStyle}>홈 데이터가 없습니다.</p>
            </div>
        );
    }

    const { summary, rootFolders, quickActions } = homeData;

    // const randomAction = quickActions.find((action) => action.key === "RANDOM");
    const bookmarkAction = quickActions.find((action) => action.key === "BOOKMARK");

    const bookmarkCycle = summary.bookmarkCycle;
    const bookmarkSolvedCount = bookmarkCycle.currentCycleSolvedProblemCount;
    const bookmarkTotalCount = bookmarkCycle.totalBookmarkedProblemCount;
    const bookmarkProgressPercent = bookmarkCycle.progressPercent;
    const currentBookmarkedRoundNo = bookmarkCycle.currentBookmarkedRoundNo;
    const hasBookmarkProblems = bookmarkTotalCount > 0;

    return (
        <div style={pageStyle}>
            <h1>자투리 퀴즈 홈</h1>

            {/* ================== 성취 카드 ================== */}
            <div
                style={{
                    ...cardStyle,
                    marginBottom: 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                }}
            >
                <div>⏳ 누적 자투리시간 저축: {summary.accumulatedFocusTimeText}</div>
                <div>📚 누적 푼 문제 수: {summary.solvedCountTotal}문제</div>
                <div>🕒 오늘 자투리 시간 저축: {summary.todayFocusTimeText}</div>
                <div>✅ 오늘 푼 문제 수: {summary.todaySolvedCount}문제</div>
                <div>🔥 {summary.streakDays}일 연속 도전 중</div>
                <div>
                    🎯 오늘 목표 {summary.todayGoal.solvedCount}/{summary.todayGoal.goalCount}
                </div>
            </div>

            {/* ================== 빠른 실행 ================== */}
            <div style={{ marginBottom: 32 }}>
                <h2>빠른 실행</h2>

                {/*{randomAction && (*/}
                {/*    <button*/}
                {/*        type="button"*/}
                {/*        onClick={() => navigate("/quiz/play?mode=random")}*/}
                {/*        style={{*/}
                {/*            ...getButtonStyle(false),*/}
                {/*            marginBottom: 16,*/}
                {/*        }}*/}
                {/*    >*/}
                {/*        🎲 {randomAction.label}*/}
                {/*    </button>*/}
                {/*)}*/}

                <div
                    style={{
                        ...cardStyle,
                        marginTop: 8,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                            marginBottom: 8,
                        }}
                    >
                        <h3 style={{ margin: 0 }}>📦 북마크 문제 전체 순회</h3>
                        <strong style={{ color: "var(--color-primary)" }}>
                            Level {summary.level}
                        </strong>
                    </div>

                    <p
                        style={{
                            marginTop: 0,
                            marginBottom: 8,
                            color: "var(--color-text-muted)",
                        }}
                    >
                        북마크된 모든 문제를 한 바퀴 다 풀면 레벨이 1 증가합니다.
                    </p>

                    <p
                        style={{
                            marginTop: 0,
                            marginBottom: 12,
                            color: "var(--color-text-muted)",
                            fontSize: 14,
                        }}
                    >
                        현재 북마크 순회 라운드: {currentBookmarkedRoundNo}회차
                    </p>

                    <div
                        style={{
                            width: "100%",
                            height: 14,
                            backgroundColor: "var(--color-surface-soft)",
                            borderRadius: 999,
                            overflow: "hidden",
                            marginBottom: 8,
                        }}
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={bookmarkProgressPercent}
                        aria-label="북마크 문제 전체 순회 진행률"
                    >
                        <div
                            style={{
                                width: `${bookmarkProgressPercent}%`,
                                height: "100%",
                                backgroundColor: "var(--color-primary)",
                                transition: "width 0.2s ease",
                            }}
                        />
                    </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 12,
                            fontSize: 14,
                            color: "var(--color-text)",
                        }}
                    >
                        <span>
                            진행률 {bookmarkSolvedCount}/{bookmarkTotalCount}
                        </span>
                        <span>{bookmarkProgressPercent}%</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/quiz/play?mode=bookmark")}
                        disabled={!hasBookmarkProblems}
                        style={getButtonStyle(!hasBookmarkProblems)}
                    >
                        📦 {bookmarkAction?.label ?? "북마크 문제 전체순회"}
                    </button>

                    {!hasBookmarkProblems && (
                        <p
                            style={{
                                marginBottom: 0,
                                color: "var(--color-text-muted)",
                                fontSize: 14,
                            }}
                        >
                            현재 북마크된 문제가 없습니다.
                        </p>
                    )}
                </div>
            </div>

            {/* ================== 폴더 리스트 ================== */}
            <h2>카테고리</h2>

            {rootFolders.length === 0 ? (
                <p style={mutedTextStyle}>표시할 카테고리가 없습니다.</p>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {rootFolders.map((folder) => (
                        <li
                            key={folder.folderId}
                            onClick={() => navigate(`/folders/${folder.folderId}`)}
                            style={{
                                padding: 12,
                                borderBottom: "1px solid var(--color-border)",
                                color: "var(--color-text)",
                                cursor: "pointer",
                            }}
                        >
                            📁 {folder.name} ({folder.solvedCount}/{folder.totalCount})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}