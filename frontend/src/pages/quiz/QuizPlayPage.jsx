import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getFolderPractice } from "../../shared/api/folderApi";
import {
    getBookmarkedPractice,
    submitProblemSubmission,
} from "../../shared/api/quizApi";
import FabGroup from "../../features/fab/FabGroup";

const TEN_MINUTES_IN_SECONDS = 10 * 60;

function getNowSeconds(startedAt) {
    return Math.max(1, Math.floor((Date.now() - startedAt) / 1000));
}

function formatDuration(totalSeconds) {
    const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;

    return `${minutes}분 ${seconds}초`;
}

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

    const [questionStartedAt, setQuestionStartedAt] = useState(Date.now());
    const [submitting, setSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState("");
    const [submittedProblemIds, setSubmittedProblemIds] = useState(() => new Set());

    const [timeAdjustModal, setTimeAdjustModal] = useState({
        open: false,
        elapsedSeconds: 0,
        minutes: "0",
        seconds: "0",
    });
    const [timeAdjustError, setTimeAdjustError] = useState("");

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
                setSubmissionError("");
                setSubmittedProblemIds(new Set());
                setQuestionStartedAt(Date.now());

                if (isBookmarkMode) {
                    const data = await getBookmarkedPractice();

                    if (ignore) return;

                    setLocalProblems(data.problems ?? []);
                    setTitlePath(data.titlePath ?? "북마크 문제 전체 순회");
                    setQuestionStartedAt(Date.now());
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
                setQuestionStartedAt(Date.now());
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

    useEffect(() => {
        if (!loading && problems.length > 0 && !showCompleteScreen) {
            setQuestionStartedAt(Date.now());
            setSubmissionError("");
            setTimeAdjustError("");
        }
    }, [currentIndex, loading, problems.length, showCompleteScreen]);

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
        const problem = problems[currentIndex];

        if (!problem?.problemId) return;

        navigate(`/quiz/${problem.problemId}/edit`);
    };

    const submitCurrentProblemAndGoNext = async (elapsedSeconds) => {
        const problem = problems[currentIndex];

        if (!problem?.problemId) {
            setSubmissionError("문제 ID가 없어 제출 결과를 저장할 수 없습니다.");
            return false;
        }

        if (submittedProblemIds.has(problem.problemId)) {
            goNext();
            return true;
        }

        try {
            setSubmitting(true);
            setSubmissionError("");

            const result = await submitProblemSubmission({
                problemId: problem.problemId,
                isCorrect: true,
                elapsedSeconds,
            });

            setSubmittedProblemIds((prev) => {
                const next = new Set(prev);
                next.add(problem.problemId);
                return next;
            });

            setLocalProblems((prev) =>
                prev.map((p, idx) => {
                    if (idx !== currentIndex) return p;

                    return {
                        ...p,
                        meta: {
                            ...p.meta,
                            attemptCount:
                                result?.attemptCount ??
                                (Number(p.meta?.attemptCount) || 0) + 1,
                        },
                    };
                })
            );

            goNext();
            return true;
        } catch (err) {
            console.error("문제 제출 결과 저장 실패:", err);
            setSubmissionError("제출 결과를 저장하지 못했습니다. 다시 시도해주세요.");
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const openTimeAdjustModal = (elapsedSeconds) => {
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;

        setTimeAdjustModal({
            open: true,
            elapsedSeconds,
            minutes: String(minutes),
            seconds: String(seconds),
        });
        setTimeAdjustError("");
    };

    const closeTimeAdjustModal = () => {
        if (submitting) return;

        setTimeAdjustModal({
            open: false,
            elapsedSeconds: 0,
            minutes: "0",
            seconds: "0",
        });
        setTimeAdjustError("");
    };

    const handleNextClick = async () => {
        if (submitting) return;

        const problem = problems[currentIndex];

        if (submittedProblemIds.has(problem?.problemId)) {
            goNext();
            return;
        }

        const elapsedSeconds = getNowSeconds(questionStartedAt);

        if (elapsedSeconds >= TEN_MINUTES_IN_SECONDS) {
            openTimeAdjustModal(elapsedSeconds);
            return;
        }

        await submitCurrentProblemAndGoNext(elapsedSeconds);
    };

    const handleTimeAdjustSubmit = async () => {
        const minutes = Number(timeAdjustModal.minutes);
        const seconds = Number(timeAdjustModal.seconds);

        if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) {
            setTimeAdjustError("분과 초를 숫자로 입력해주세요.");
            return;
        }

        if (minutes < 0 || seconds < 0) {
            setTimeAdjustError("분과 초는 0 이상으로 입력해주세요.");
            return;
        }

        if (seconds >= 60) {
            setTimeAdjustError("초는 0 이상 59 이하로 입력해주세요.");
            return;
        }

        const elapsedSeconds = Math.max(
            1,
            Math.floor(minutes) * 60 + Math.floor(seconds)
        );

        const success = await submitCurrentProblemAndGoNext(elapsedSeconds);

        if (success) {
            closeTimeAdjustModal();
        }
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

            {showAnswer && (
                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 16,
                    }}
                >
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ opacity: 0.7, marginBottom: 6 }}>해설</div>
                        <ExplanationBlocks blocks={problem.explanationBlocks ?? []} />
                    </div>

                    <div>
                        <div style={{ opacity: 0.7, marginBottom: 6 }}>정답</div>
                        <div style={{ fontWeight: 600 }}>{problem.answerText}</div>
                    </div>
                </div>
            )}

            <div
                style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 16,
                    flexWrap: "wrap",
                }}
            >
                <button onClick={() => setShowAnswer((v) => !v)}>
                    {showAnswer ? "정답/해설 숨기기" : "정답/해설 보기"}
                </button>

                <button onClick={goPrev} disabled={currentIndex === 0 || submitting}>
                    이전 문제
                </button>

                <button onClick={handleNextClick} disabled={submitting}>
                    {submitting ? "제출 중..." : "다음 문제"}
                </button>

                <button onClick={handleExit} disabled={submitting}>
                    {getExitButtonText()}
                </button>
            </div>

            {submissionError && (
                <p style={{ color: "crimson", marginTop: 0 }}>
                    {submissionError}
                </p>
            )}

            {timeAdjustModal.open && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.45)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                        padding: 16,
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            maxWidth: 420,
                            backgroundColor: "#fff",
                            borderRadius: 12,
                            padding: 24,
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                        }}
                    >
                        <h2 style={{ marginTop: 0 }}>실제 풀이 시간 확인</h2>

                        <p style={{ lineHeight: 1.6 }}>
                            해당 문제를 푸는 데{" "}
                            <strong>{formatDuration(timeAdjustModal.elapsedSeconds)}</strong>가
                            소요되었습니다.
                            <br />
                            아래에 실제 경과시간을 적어주세요.
                        </p>

                        <div
                            style={{
                                display: "flex",
                                gap: 8,
                                alignItems: "center",
                                marginBottom: 12,
                            }}
                        >
                            <input
                                type="number"
                                min="0"
                                value={timeAdjustModal.minutes}
                                onChange={(e) =>
                                    setTimeAdjustModal((prev) => ({
                                        ...prev,
                                        minutes: e.target.value,
                                    }))
                                }
                                style={{
                                    width: 80,
                                    padding: 8,
                                    fontSize: 16,
                                }}
                            />
                            <span>분</span>

                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={timeAdjustModal.seconds}
                                onChange={(e) =>
                                    setTimeAdjustModal((prev) => ({
                                        ...prev,
                                        seconds: e.target.value,
                                    }))
                                }
                                style={{
                                    width: 80,
                                    padding: 8,
                                    fontSize: 16,
                                }}
                            />
                            <span>초</span>
                        </div>

                        {timeAdjustError && (
                            <p style={{ color: "crimson" }}>{timeAdjustError}</p>
                        )}

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 8,
                                marginTop: 20,
                            }}
                        >
                            <button onClick={closeTimeAdjustModal} disabled={submitting}>
                                취소
                            </button>
                            <button onClick={handleTimeAdjustSubmit} disabled={submitting}>
                                {submitting ? "제출 중..." : "제출"}
                            </button>
                        </div>
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