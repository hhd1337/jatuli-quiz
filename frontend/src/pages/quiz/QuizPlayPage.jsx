import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
//import { getPracticeMock } from "../../mocks/practice.mock";
import { getProblemsByFolderId } from "../../mocks/mockDb";
import FabGroup from "../../features/fab/FabGroup";

export default function QuizPlayPage() {
  const navigate = useNavigate(); 
  const [searchParams] = useSearchParams();

  const folderId = searchParams.get("folderId");
  const mode = searchParams.get("mode"); // random/bookmark

  const [isMusicOn, setIsMusicOn] = useState(false);

  // 북마크 토글을 위해 "problems"를 state로 들고 있어야 함
  const [localProblems, setLocalProblems] = useState(() =>
    folderId ? getProblemsByFolderId(folderId) : []
  );

  const problems = localProblems;
  

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // folderId가 바뀌면 상태 초기화
  useEffect(() => {
    if (!folderId) return;
    setLocalProblems(getProblemsByFolderId(folderId));
    setCurrentIndex(0);
    setShowAnswer(false);
  }, [folderId]);

  // 문제 없을 때 처리
  if (!folderId) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1>QuizPlayPage</h1>
        <p>
          folderId가 없습니다. 폴더에서 들어오거나 URL에 folderId를 붙여주세요.
        </p>
        <p style={{ opacity: 0.7 }}>
          예: <code>/quiz/play?folderId=101</code>
        </p>

        {mode && (
          <p style={{ opacity: 0.7 }}>
            mode=<code>{mode}</code> 는 Commit 8~에서 붙일 예정
          </p>
        )}

        <button onClick={() => navigate("/")}>홈으로</button>
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ margin: 0 }}>폴더 {folderId}</h1>
        <p>이 폴더에는 문제가 없습니다.</p>
        <button onClick={() => navigate(-1)}>뒤로</button>
      </div>
    );
  }

  const problem = problems[currentIndex];

  const goNext = () => {
    const next = currentIndex + 1;
    if (next >= problems.length) {
      // MVP 선택 1: 끝이면 처음으로 돌아가기
      setCurrentIndex(0);
      setShowAnswer(false);
      return;
      // (선택 2) 끝이면 종료 화면/모달을 띄우고 싶으면 여기에서 처리
    }
    setCurrentIndex(next);
    setShowAnswer(false);
  };

  const toggleBookmark = () => {
    const cur = problems[currentIndex];
    if (!cur) return;

    setLocalProblems((prev) =>
      prev.map((p, idx) => {
        if (idx !== currentIndex) return p;
        return {
          ...p,
          meta: {
            ...p.meta,
            isBookmarked: !p.meta?.isBookmarked,
          },
        };
      })
    );
  };

  const goEdit = () => {
    const cur = problems[currentIndex];
    if (!cur) return;
    navigate(`/quiz/${cur.problemId}/edit`);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      {/* 상단 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ margin: 0 }}>폴더 {folderId}</h1>
        <div style={{ opacity: 0.7 }}>
          {currentIndex + 1} / {problems.length}
        </div>
      </div>

      <hr style={{ margin: "16px 0" }} />

      {/* 문제 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ opacity: 0.7, marginBottom: 6 }}>Q{problem.questionNo}</div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>{problem.questionText}</div>
      </div>

      {/* 문제 이미지 */}
      {problem.questionImages?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {problem.questionImages.map((img, idx) => (
            <img
              key={img.imageId ?? idx}
              src={img.url}
              alt={img.alt ?? "question"}
              style={{ maxWidth: "100%", borderRadius: 8, marginBottom: 8 }}
            />
          ))}
        </div>
      )}

      {/* 버튼 영역 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => setShowAnswer((v) => !v)}>
          {showAnswer ? "정답/해설 숨기기" : "정답/해설 보기"}
        </button>
        <button onClick={goNext}>다음 문제</button>
        <button onClick={() => navigate(-1)}>뒤로</button>
      </div>

      {/* 정답/해설 */}
      {showAnswer && (
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ opacity: 0.7, marginBottom: 6 }}>정답</div>
            <div style={{ fontWeight: 600 }}>{problem.answerText}</div>
          </div>

          <div>
            <div style={{ opacity: 0.7, marginBottom: 6 }}>해설</div>
            <ExplanationBlocks blocks={problem.explanationBlocks ?? []} />
          </div>
        </div>
      )}

      <FabGroup
        onEdit={goEdit}
        onToggleBookmark={toggleBookmark}
        isBookmarked={!!problem?.meta?.isBookmarked}
        onHome={() => navigate("/")}
        onToggleMusic={() => setIsMusicOn((v) => !v)}
        isMusicOn={isMusicOn}
      />
    </div>
  );
}

function ExplanationBlocks({ blocks }) {
  if (!blocks.length) return <div style={{ opacity: 0.6 }}>해설이 없습니다.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {blocks.map((b, idx) => {
        if (b.type === "TEXT") {
          return <div key={idx}>{b.text}</div>;
        }
        if (b.type === "IMAGE") {
          const img = b.image;
          return (
            <img
              key={img.imageId ?? idx}
              src={img.url}
              alt={img.alt ?? "explanation"}
              style={{ maxWidth: "100%", borderRadius: 8 }}
            />
          );
        }
        return (
          <div key={idx} style={{ opacity: 0.6 }}>
            (지원하지 않는 블록 타입: {String(b.type)})
          </div>
        );
      })}
    </div>
  );
}