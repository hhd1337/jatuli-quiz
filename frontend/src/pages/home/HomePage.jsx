import { useNavigate } from "react-router-dom";
import { homeMock } from "../../mocks/home.mock";

export default function HomePage() {
  const navigate = useNavigate();
  const { summary, rootFolders, quickActions } = homeMock;

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
        }}
      >
        <div>⏳ 자투리 시간 저축 {summary.savedTimeMinutes}분</div>
        <div>🌱 Level {summary.level} ({summary.solvedCountTotal}문제 해결)</div>
        <div>🔥 {summary.streakDays}일 연속 도전 중</div>
        <div style={{ marginTop: 8 }}>
          🎯 오늘 목표 {summary.todayGoal.solvedCount}/{summary.todayGoal.goalCount}
        </div>
      </div>

      {/* ================== 폴더 리스트 ================== */}
      <h2>카테고리</h2>
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

      {/* ================== 빠른 실행 ================== */}
      <div style={{ marginTop: 32 }}>
        <h2>빠른 실행</h2>

        <button
          onClick={() => navigate("/quiz/play?mode=random")}
          style={{ marginRight: 8 }}
        >
          🎲 랜덤 문제 풀기
        </button>

        <button
          onClick={() => navigate("/quiz/play?mode=bookmark")}
        >
          📦 북마크 문제 풀기
        </button>
      </div>
    </div>
  );
}