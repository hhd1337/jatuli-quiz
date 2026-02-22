import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProblem } from "../../mocks/mockDb";
import { foldersChildrenMockById } from "../../mocks/folders.mock"; // 너가 쓰던 mock 기준

export default function QuizUploadPage() {
  const navigate = useNavigate();

  // MVP: leaf folderId를 직접 입력하게 두기보다, select로 선택
  const leafOptions = collectLeafFolders();

  const [folderId, setFolderId] = useState(leafOptions[0]?.folderId ?? "");
  const [titlePath, setTitlePath] = useState(leafOptions[0]?.titlePath ?? "");
  const [questionText, setQuestionText] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [explanationText, setExplanationText] = useState("");

  const handleSave = () => {
    if (!folderId) return alert("폴더를 선택하세요");
    if (!questionText.trim()) return alert("문제를 입력하세요");
    if (!answerText.trim()) return alert("정답을 입력하세요");

    const created = createProblem({
      folderId,
      titlePath,
      questionText,
      answerText,
      explanationText,
    });

    alert(`업로드 완료 (problemId=${created.problemId})`);
    navigate("/");
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h1>문제 업로드</h1>

      <div style={{ marginBottom: 16 }}>
        <label>1. 폴더 선택</label>
        <select
          value={folderId}
          onChange={(e) => {
            const id = e.target.value;
            setFolderId(id);
            const opt = leafOptions.find((x) => String(x.folderId) === String(id));
            setTitlePath(opt?.titlePath ?? "");
          }}
          style={{ width: "100%", padding: 8 }}
        >
          {leafOptions.map((opt) => (
            <option key={opt.folderId} value={opt.folderId}>
              {opt.titlePath}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>2. 문제 내용</label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          rows={4}
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>3. 정답</label>
        <textarea
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          rows={3}
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>4. 해설(텍스트만)</label>
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
      </div>
    </div>
  );
}

/**
 * foldersChildrenMockById(너가 쓰던 구조)에서 leaf 폴더를 뽑아 옵션 생성
 * titlePath는 "/자바/기본/클래스와 데이터" 이런 형태로 만들어둠
 */
function collectLeafFolders() {
  const out = [];

  for (const rootId of Object.keys(foldersChildrenMockById)) {
    const root = foldersChildrenMockById[rootId];
    const rootPath = root.titlePath; // "/자바" 같은 것

    for (const section of root.sections ?? []) {
      const sectionPath = `${rootPath}${section.title}`; // "/자바/기본"

      for (const child of section.children ?? []) {
        if (!child.isLeaf) continue;

        out.push({
          folderId: child.folderId,
          titlePath: `${sectionPath}/${child.name}`, // "/자바/기본/클래스와 데이터"
        });
      }
    }
  }

  return out;
}