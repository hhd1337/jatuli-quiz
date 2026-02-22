import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
//import { getProblemById } from "../../mocks/practice.mock";
import { getProblemById, updateProblem, deleteProblem } from "../../mocks/mockDb";

export default function QuizEditPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [questionText, setQuestionText] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [explanationText, setExplanationText] = useState("");

  useEffect(() => {
    const problem = getProblemById(quizId);
    if (!problem) return;

    setQuestionText(problem.questionText);
    setAnswerText(problem.answerText);

    // explanationBlocks 중 TEXT만 단순 연결 (MVP)
    const textBlocks = (problem.explanationBlocks ?? [])
      .filter((b) => b.type === "TEXT")
      .map((b) => b.text)
      .join("\n\n");

    setExplanationText(textBlocks);
  }, [quizId]);

  const handleSave = () => {
    updateProblem(quizId, {
        questionText,
        answerText,
        explanationText,
    });

    alert("저장 완료");
    navigate(-1);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h1>문제 수정</h1>

      <div style={{ marginBottom: 16 }}>
        <label>문제</label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          rows={4}
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>정답</label>
        <textarea
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          rows={3}
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>해설 (텍스트만)</label>
        <textarea
          value={explanationText}
          onChange={(e) => setExplanationText(e.target.value)}
          rows={6}
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleSave}>저장</button>
        <button onClick={() => navigate(-1)}>취소</button>
        <button
            onClick={() => {
                if (!confirm("정말 삭제할까요?")) return;
                deleteProblem(quizId);
                alert("삭제 완료");
                navigate("/");
            }}
        >
            삭제
        </button>
        
      </div>
    </div>
  );
}