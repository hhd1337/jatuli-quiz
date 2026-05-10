import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getFolderPractice } from "../../shared/api/folderApi";
import { getBookmarkedPractice } from "../../shared/api/quizApi";
import FabGroup from "../../features/fab/FabGroup";

export default function QuizPlayPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const folderId = searchParams.get("folderId");
    const mode = searchParams.get("mode");

    const isBookmarkMode = mode === "bookmark";
    const isRandomMode = mode === "random";
    const isUnsupportedMode = !!mode && !isBookmarkMode && !isRandomMode;

    const initialTitlePath = location.state?.titlePath ?? "";
    const parentFolderId = location.state?.parentFolderId ?? null;

    const [isMusicOn, setIsMusicOn] = useState(false);
    const [localProblems, setLocalProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [titlePath, setTitlePath] = useState(initialTitlePath);
    const [showCompleteScreen, setShowCompleteScreen] = useState(false);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    const problems = localProblems;

    useEffect(() => {
        let ignore = false;

        async function fetchPracticeProblems() {
            try {
                setLoading(true);
                setError("");
                setLocalProblems([]);
                setShowCompleteScreen(false);
                setCurrentIndex(0);
                setShowAnswer(false);

                if (isBookmarkMode) {
                    const data = await getBookmarkedPractice();

                    if (ignore) return;

                    setLocalProblems(data.problems ?? []);
                    setTitlePath(data.titlePath ?? "북마크 문제 전체 순회");
                    return;
                }

                if (isRandomMode) {
                    setError("랜덤 문제 풀기는 아직 별도 연동 전입니다.");
                    setTitlePath("랜덤 문제 풀기");
                    return;
                }

                if (isUnsupportedMode) {
                    setError(`지원하지 않는 문제 풀이 모드입니다: ${mode}`);
                    setTitlePath("QuizPlayPage");
                    return;
                }

                if (!folderId) {
                    setError("folderId가 없습니다. leaf 폴더에서 진입해주세요.");
                    setTitlePath("QuizPlayPage");
                    return;
                }

                const data = await getFolderPractice(folderId);

                if (ignore) return;

                setLocalProblems(data.problems ?? []);
                setTitlePath(data.titlePath || `폴더 ${folderId}`);
            } catch (err) {
                if (ignore) return;

                console.error("연습 문제 조회 실패:", err);
                setError("문제 목록을 불러오지 못했습니다.");
                setLocalProblems([]);
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        fetchPracticeProblems();

        return () => {
            ignore = true;
        };
    }, [folderId, mode, isBookmarkMode, isRandomMode, isUnsupportedMode]);

    const handleExit = () => {
        if (isBookmarkMode || isRandomMode || isUnsupportedMode) {
            navigate("/");
            return;
        }

        if (parentFolderId) {
            navigate(`/folders/${parentFolderId}`);
            return;
        }

        navigate(-1);
    };

    const getExitButtonText = () => {
        if (isBookmarkMode || isRandomMode || isUnsupportedMode) {
            return "홈으로";
        }

        return "폴더 나가기";
    };

    const getEmptyMessage = () => {
        if (isBookmarkMode) {
            return "이번 북마크 순회에서 풀 문제가 없습니다.";
        }

        if (isRandomMode) {
            return "랜덤 문제를 불러올 수 없습니다.";
        }

        return "이 폴더에는 문제가 없습니다.";
    };

    const getCompleteMessage = () => {
        if (isBookmarkMode) {
            return "이번 북마크 순회에서 불러온 문제를 모두 확인했어요.";
        }

        return "이 폴더의 문제를 끝까지 모두 확인했어요.";
    };

    if (loading) {
        return (
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
                <h1 style={{ margin: 0 }}>{titlePath || "QuizPlayPage"}</h1>
                <p>문제를 불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
                <h1 style={{ margin: 0 }}>{titlePath || "QuizPlayPage"}</h1>
                <p>{error}</p>

                {!isBookmarkMode && !isRandomMode && !isUnsupportedMode && !folderId && (
                    <p style={{ opacity: 0.7 }}>
                        예: <code>/quiz/play?folderId=9</code>
                    </p>
                )}

                <button onClick={handleExit}>{getExitButtonText()}</button>
            </div>
        );
    }

    if (problems.length === 0) {
        return (
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
                <h1 style={{ margin: 0 }}>{titlePath || "QuizPlayPage"}</h1>
                <p>{getEmptyMessage()}</p>
                <button onClick={handleExit}>{getExitButtonText()}</button>
            </div>
        );
    }

    if (showCompleteScreen) {
        return (
            <div
                style={{
                    maxWidth: 800,
                    margin: "0 auto",
                    minHeight: "60vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    gap: 16,
                }}
            >
                <div style={{ fontSize: 64 }}>🎉</div>
                <h1 style={{ margin: 0 }}>모두 풀었습니다!</h1>
                <p style={{ opacity: 0.8 }}>{getCompleteMessage()}</p>
                <button onClick={handleExit}>{getExitButtonText()}</button>
            </div>
        );
    }

    const problem = problems[currentIndex];

    const goNext = () => {
        const next = currentIndex + 1;

        if (next >= problems.length) {
            setShowAnswer(false);
            setShowCompleteScreen(true);
            return;
        }

        setCurrentIndex(next);
        setShowAnswer(false);
    };

    const goPrev = () => {
        const prev = currentIndex - 1;

        if (prev < 0) {
            return;
        }

        setCurrentIndex(prev);
        setShowAnswer(false);
    };

    const toggleBookmark = () => {
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
        if (!problem?.problemId) return;
        navigate(`/quiz/${problem.problemId}/edit`);
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
                <h1 style={{ margin: 0 }}>{titlePath || "QuizPlayPage"}</h1>
                <div style={{ opacity: 0.7 }}>
                    {currentIndex + 1} / {problems.length}
                </div>
            </div>

            <hr style={{ margin: "16px 0" }} />

            <div style={{ marginBottom: 16 }}>
                <div style={{ opacity: 0.7, marginBottom: 6 }}>
                    Q{problem.questionNo}
                </div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>
                    {problem.questionText}
                </div>
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

            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                <button onClick={() => setShowAnswer((v) => !v)}>
                    {showAnswer ? "정답/해설 숨기기" : "정답/해설 보기"}
                </button>
                <button onClick={goPrev} disabled={currentIndex === 0}>
                    이전 문제
                </button>
                <button onClick={goNext}>다음 문제</button>
                <button onClick={handleExit}>{getExitButtonText()}</button>
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
    if (!blocks.length) {
        return <div style={{ opacity: 0.6 }}>해설이 없습니다.</div>;
    }

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