import { useParams, useNavigate } from "react-router-dom";
import { getFolderChildrenMock } from "../../mocks/folders.mock";

export default function FolderBrowserPage() {
  const { folderId } = useParams();
  const navigate = useNavigate();

  const folderData = getFolderChildrenMock(folderId);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h1>{folderData.titlePath}</h1>

      {folderData.sections.map((section) => (
        <div key={section.sectionId}>
          <h2>{section.title}</h2>

          <ul style={{ listStyle: "none", padding: 0 }}>
            {section.children.map((child) => (
              <li
                key={child.folderId}
                onClick={() =>
                  navigate(`/quiz/play?folderId=${child.folderId}`)
                }
                style={{ cursor: "pointer", padding: 8 }}
              >
                📁 {child.name} ({child.solvedCount}/{child.totalCount})
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}