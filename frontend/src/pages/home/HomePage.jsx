import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHomeData } from "../../shared/api/homeApi";

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
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
                <h1>자투리 퀴즈 홈</h1>
                <p>불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
                <h1>자투리 퀴즈 홈</h1>
                <p>{error}</p>
            </div>
        );
    }

    if (!homeData) {
        return (
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
                <h1>자투리 퀴즈 홈</h1>
                <p>홈 데이터가 없습니다.</p>
            </div>
        );
    }

    const { summary, rootFolders, quickActions } = homeData;

    const randomAction = quickActions.find((action) => action.key === "RANDOM");
    const bookmarkAction = quickActions.find((action) => action.key === "BOOKMARK");

    const bookmarkCycle = summary.bookmarkCycle;
    const bookmarkSolvedCount = bookmarkCycle.currentCycleSolvedProblemCount;
    const bookmarkTotalCount = bookmarkCycle.totalBookmarkedProblemCount;
    const bookmarkProgressPercent = bookmarkCycle.progressPercent;
    const currentBookmarkedRoundNo = bookmarkCycle.currentBookmarkedRoundNo;
    const hasBookmarkProblems = bookmarkTotalCount > 0;

    return (
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <h1>자투리 퀴즈 홈</h1>

            {/* ================== 성취 카드 ================== */}
            <div
                style={{
                    border: "1px solid #ddd",
                    borderRadius: 12,
                    padding: 16,
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

                {randomAction && (
                    <button
                        type="button"
                        onClick={() => navigate("/quiz/play?mode=random")}
                        style={{
                            marginBottom: 16,
                            padding: "6px 12px",
                            cursor: "pointer",
                        }}
                    >
                        🎲 {randomAction.label}
                    </button>
                )}

                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: 12,
                        padding: 16,
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
                        <strong>Level {summary.level}</strong>
                    </div>

                    <p style={{ marginTop: 0, marginBottom: 8, color: "#555" }}>
                        북마크된 모든 문제를 한 바퀴 다 풀면 레벨이 1 증가합니다.
                    </p>

                    <p style={{ marginTop: 0, marginBottom: 12, color: "#777", fontSize: 14 }}>
                        현재 북마크 순회 라운드: {currentBookmarkedRoundNo}회차
                    </p>

                    <div
                        style={{
                            width: "100%",
                            height: 14,
                            backgroundColor: "#eee",
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
                                backgroundColor: "#22c55e",
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
                        style={{
                            padding: "6px 12px",
                            cursor: hasBookmarkProblems ? "pointer" : "not-allowed",
                            opacity: hasBookmarkProblems ? 1 : 0.5,
                        }}
                    >
                        📦 {bookmarkAction?.label ?? "북마크 문제 전체순회"}
                    </button>

                    {!hasBookmarkProblems && (
                        <p style={{ marginBottom: 0, color: "#777", fontSize: 14 }}>
                            현재 북마크된 문제가 없습니다.
                        </p>
                    )}
                </div>
            </div>

            {/* ================== 폴더 리스트 ================== */}
            <h2>카테고리</h2>

            {rootFolders.length === 0 ? (
                <p>표시할 카테고리가 없습니다.</p>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {rootFolders.map((folder) => (
                        <li
                            key={folder.folderId}
                            onClick={() => navigate(`/folders/${folder.folderId}`)}
                            style={{
                                padding: 12,
                                borderBottom: "1px solid #eee",
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