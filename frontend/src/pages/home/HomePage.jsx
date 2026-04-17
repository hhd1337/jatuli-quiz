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
                <div>🌱 Level {summary.level} ({summary.solvedCountTotal}문제 해결)</div>
                <div>🔥 {summary.streakDays}일 연속 도전 중</div>
                <div>🎯 오늘 목표 {summary.todayGoal.solvedCount}/{summary.todayGoal.goalCount}</div>
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

            {/* ================== 빠른 실행 ================== */}
            <div style={{ marginTop: 32 }}>
                <h2>빠른 실행</h2>

                {quickActions.map((action) => {
                    if (action.key === "RANDOM") {
                        return (
                            <button
                                key={action.key}
                                onClick={() => navigate("/quiz/play?mode=random")}
                                style={{ marginRight: 8 }}
                            >
                                🎲 {action.label}
                            </button>
                        );
                    }

                    if (action.key === "BOOKMARK") {
                        return (
                            <button
                                key={action.key}
                                onClick={() => navigate("/quiz/play?mode=bookmark")}
                            >
                                📦 {action.label}
                            </button>
                        );
                    }

                    return null;
                })}
            </div>
        </div>
    );
}