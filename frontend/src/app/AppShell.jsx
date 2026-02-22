import { Outlet, Link, useLocation } from "react-router-dom";

export default function AppShell() {
  const location = useLocation();

  return (
    <div style={{ padding: 16 }}>
      {/* 개발 편의를 위한 상단 테스트 네비 (나중에 제거 가능) */}
      <div style={{ marginBottom: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link to="/">홈</Link>
        <Link to="/folders/1">폴더(예: 1)</Link>
        <Link to="/quiz/play?folderId=101">퀴즈 플레이</Link>
        <Link to="/quiz/9001/edit">퀴즈 수정</Link>
        <Link to="/upload">문제 업로드</Link>
      </div>

      <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 16 }}>
        현재 경로: <code>{location.pathname + location.search}</code>
      </div>

      <Outlet />
    </div>
  );
}