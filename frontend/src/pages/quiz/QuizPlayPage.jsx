import { useSearchParams } from "react-router-dom";

export default function QuizPlayPage() {
  const [searchParams] = useSearchParams();
  const folderId = searchParams.get("folderId");

  return (
    <div>
      <h1>QuizPlayPage</h1>
      <p>folderId(query): {folderId ?? "(없음)"}</p>
      <p>여기서 practice API(목데이터)로 problems 배열을 가져와서 플레이할 예정</p>
    </div>
  );
}