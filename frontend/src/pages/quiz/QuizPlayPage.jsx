import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getFolderPractice } from "../../shared/api/folderApi";
import FabGroup from "../../features/fab/FabGroup";

export default function QuizPlayPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const folderId = searchParams.get("folderId");
    const mode = searchParams.get("mode"); // random/bookmark

    const [isMusicOn, setIsMusicOn] = useState(false);
    const [localProblems, setLocalProblems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [titlePath, setTitlePath] = useState("");

    const problems = localProblems;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    useEffect(() => {
        async function fetchPracticeProblems() {
            if (!folderId) return;

            try {
                setLoading(true);
                setError("");

                const data = await getFolderPractice(folderId);
                setLocalProblems(data.problems ?? []);
                setTitlePath(data.titlePath ?? "");
                setCurrentIndex(0);
                setShowAnswer(false);
            } catch (err) {
                console.error("연습 문제 조회 실패:", err);
                setError("문제 목록을 불러오지 못했습니다.");
                setLocalProblems([]);
                setTitlePath("");
            } finally {
                setLoading(false);
            }
        }

        fetchPracticeProblems();
    }, [folderId]);

    if (!folderId) {
        return (
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
                <h1>QuizPlayPage</h1>
                <p>folderId가 없습니다. 폴더에서 들어오거나 URL에 folderId를 붙여주세요.</p>
                <p style={{ opacity: 0.7 }}>
                    예: <code>/quiz/play?folderId=101</code>
                </p>

                {mode && (
                    <p style={{ opacity: 0.7 }}>
                        mode=<code>{mode}</code> 는 아직 연결 전입니다.
                    </p>
                )}

                <button onClick={() => navigate("/")}>홈으로</button>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
                <h1 style={{ margin: 0 }}>{titlePath || `폴더 ${folderId}`}</h1>
                <p>문제를 불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
                <h1 style={{ margin: 0 }}>{titlePath || `폴더 ${folderId}`}</h1>
                <p>{error}</p>
                <button onClick={() => navigate(-1)}>뒤로</button>
            </div>
        );
    }

    if (problems.length === 0) {
        return (
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
                <h1 style={{ margin: 0 }}>{titlePath || `폴더 ${folderId}`}</h1>
                <p>이 폴더에는 문제가 없습니다.</p>
                <button onClick={() => navigate(-1)}>뒤로</button>
            </div>
        );
    }

    const problem = problems[currentIndex];

    const goNext = () => {
        const next = currentIndex + 1;
        if (next >= problems.length) {
            setCurrentIndex(0);
            setShowAnswer(false);
            return;
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
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                }}
            >
                <h1 style={{ margin: 0 }}>{titlePath || `폴더 ${folderId}`}</h1>
                <div style={{ opacity: 0.7 }}>
                    {currentIndex + 1} / {problems.length}
                </div>
            </div>

            <hr style={{ margin: "16px 0" }} />

            <div style={{ marginBottom: 16 }}>
                <div style={{ opacity: 0.7, marginBottom: 6 }}>Q{problem.questionNo}</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{problem.questionText}</div>
            </div>

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

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <button onClick={() => setShowAnswer((v) => !v)}>
                    {showAnswer ? "정답/해설 숨기기" : "정답/해설 보기"}
                </button>
                <button onClick={goNext}>다음 문제</button>
                <button onClick={() => navigate(-1)}>뒤로</button>
            </div>

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
                            key={img?.imageId ?? idx}
                            src={img?.url}
                            alt={img?.alt ?? "explanation"}
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