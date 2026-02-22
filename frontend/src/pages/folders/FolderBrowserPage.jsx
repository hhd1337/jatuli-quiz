import { useParams } from "react-router-dom";

export default function FolderBrowserPage() {
  const { folderId } = useParams();

  return (
    <div>
      <h1>FolderBrowserPage</h1>
      <p>folderId: {folderId}</p>
      <p>여기서 해당 folderId의 children을 보여줄 예정</p>
    </div>
  );
}