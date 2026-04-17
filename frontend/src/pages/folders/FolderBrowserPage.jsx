import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFolderChildren } from "../../shared/api/folderApi";

export default function FolderBrowserPage() {
    const { folderId } = useParams();
    const navigate = useNavigate();

    const [folderData, setFolderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchFolderChildren() {
            try {
                setLoading(true);
                setError("");
                const data = await getFolderChildren(folderId);
                setFolderData(data);
            } catch (err) {
                console.error("폴더 하위 목록 조회 실패:", err);
                setError("폴더 목록을 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        }

        fetchFolderChildren();
    }, [folderId]);

    const handleChildClick = (child) => {
        if (child.isLeaf) {
            navigate(`/quiz/play?folderId=${child.folderId}`);
            return;
        }

        navigate(`/folders/${child.folderId}`);
    };

    if (loading) {
        return (
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
                <p>불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
                <p>{error}</p>
            </div>
        );
    }

    if (!folderData) {
        return (
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
                <p>폴더 데이터가 없습니다.</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <h1>{folderData.titlePath}</h1>

            {folderData.sections.length === 0 ? (
                <p>하위 폴더가 없습니다.</p>
            ) : (
                folderData.sections.map((section) => (
                    <div key={section.sectionId}>
                        <h2>{section.title}</h2>

                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {section.children.map((child) => (
                                <li
                                    key={child.folderId}
                                    onClick={() => handleChildClick(child)}
                                    style={{
                                        cursor: "pointer",
                                        padding: 8,
                                        borderBottom: "1px solid #eee",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                  <span>
                    📁 {child.name} ({child.solvedCount}/{child.totalCount})
                  </span>
                                    <span style={{ opacity: 0.6, fontSize: 14 }}>
                    {child.isLeaf ? "문제 풀기" : "폴더 열기"}
                  </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            )}
        </div>
    );
}