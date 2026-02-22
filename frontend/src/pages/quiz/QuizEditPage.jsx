import { useParams } from "react-router-dom";

export default function QuizEditPage() {
  const { quizId } = useParams();

  return (
    <div>
      <h1>QuizEditPage</h1>
      <p>quizId: {quizId}</p>
      <p>여기서 문제 수정 폼을 만들 예정</p>
    </div>
  );
}