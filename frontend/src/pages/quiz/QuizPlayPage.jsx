import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getFolderPractice } from "../../shared/api/folderApi";
import {
    getBookmarkedPractice,
    submitProblemSubmission,
} from "../../shared/api/quizApi";
import FabGroup from "../../features/fab/FabGroup";
import MarkdownContent from "../../shared/components/MarkdownContent";

const TEN_MINUTES_IN_SECONDS = 10 * 60;

const pageStyle = {
    width: "100%",
    maxWidth: 800,
    minHeight: "100dvh",
    margin: "0 auto",
    padding: "24px clamp(8px, 3vw, 20px) 72px",
    color: "var(--color-text, #f9fafb)",
    boxSizing: "border-box",
};

const mutedTextStyle = {
    color: "var(--color-text-muted, #9ca3af)",
};

const hrStyle = {
    margin: "3px 0 15px",
    border: "none",
    borderTop: "1px solid var(--color-border, #374151)",
};

const answerCardStyle = {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid var(--color-border, #374151)",
    background: "var(--color-surface, #1f2937)",
    color: "var(--color-text, #f9fafb)",
    borderRadius: 12,
    padding: "clamp(14px, 3.5vw, 16px)",
    marginBottom: 16,
};

const titleParentPathStyle = {
    margin: 0,
    color: "var(--color-text-muted, #9ca3af)",
    fontSize: "clamp(11px, 3.2vw, 13px)",
    lineHeight: 1.35,
    wordBreak: "break-all",
    overflowWrap: "anywhere",
};

const titleMainStyle = {
    margin: 0,
    color: "var(--color-text-muted, #9ca3af)",
    fontSize: "clamp(18px, 5vw, 22px)",
    lineHeight: 1.35,
    fontWeight: 700,
    wordBreak: "break-all",
    overflowWrap: "anywhere",
};

const progressCountStyle = {
    ...mutedTextStyle,
    fontSize: "clamp(15px, 5vw, 15px)",
    lineHeight: 1,
    paddingTop: 6,
    marginBottom: 5,
    flexShrink: 0,
};

const questionTextStyle = {
    fontSize: "clamp(13px, 4.5vw, 16px)",
    lineHeight: 1.35,
    fontWeight: 600,
    wordBreak: "break-all",
    overflowWrap: "anywhere",
};

const explanationTextStyle = {
    fontSize: "clamp(12px, 4vw, 14px)",
    lineHeight: 1.45,
    wordBreak: "break-all",
    overflowWrap: "anywhere",
};

const answerTextStyle = {
    fontSize: "clamp(12px, 4vw, 14px)",
    lineHeight: 1.35,
    fontWeight: 300,
    wordBreak: "break-all",
    overflowWrap: "anywhere",
};

const modalCardStyle = {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "var(--color-surface, #1f2937)",
    color: "var(--color-text, #f9fafb)",
    border: "1px solid var(--color-border, #374151)",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
};

const inputStyle = {
    width: 80,
    padding: 8,
    fontSize: 16,
    background: "var(--color-bg, #111827)",
    color: "var(--color-text, #f9fafb)",
    border: "1px solid var(--color-border, #374151)",
    borderRadius: 6,
};

const bottomActionBottom = "calc(20px + env(safe-area-inset-bottom))";

const bottomLeftControlsStyle = {
    position: "fixed",
    left: "max(16px, calc((100vw - 800px) / 2 + 16px))",
    bottom: bottomActionBottom,
    display: "flex",
    gap: 8,
    zIndex: 900,
};

const bottomBookmarkStyle = {
    position: "fixed",
    right: "max(88px, calc((100vw - 800px) / 2 + 88px))",
    bottom: bottomActionBottom,
    width: 44,
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 901,
};

function getButtonStyle(disabled = false) {
    return {
        border: "1px solid var(--color-border, #374151)",
        background: disabled
            ? "var(--color-button-disabled-bg, #1f2937)"
            : "var(--color-button-bg, #374151)",
        color: disabled
            ? "var(--color-button-disabled-text, #6b7280)"
            : "var(--color-button-text, #f9fafb)",
        padding: "6px 10px",
        borderRadius: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.65 : 1,
        width: 80,
        height: 35,
    };
}

function getNowSeconds(startedAt) {
    return Math.max(1, Math.floor((Date.now() - startedAt) / 1000));
}

function formatDuration(totalSeconds) {
    const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;

    return `${minutes}분 ${seconds}초`;
}

function getPathItemName(item) {
    if (typeof item === "string") {
        return item.trim();
    }

    if (!item || typeof item !== "object") {
        return "";
    }

    return String(
        item.name ??
        item.folderName ??
        item.title ??
        item.folderTitle ??
        item.pathName ??
        ""
    ).trim();
}

function buildPathTextFromItems(items) {
    if (!Array.isArray(items)) {
        return "";
    }

    return items
        .map(getPathItemName)
        .filter(Boolean)
        .join(" / ");
}

function normalizePathText(value) {
    if (typeof value === "string") {
        return value
            .trim()
            .replace(/^\/+/, "")
            .replace(/\/+$/, "");
    }

    if (Array.isArray(value)) {
        return buildPathTextFromItems(value);
    }

    return "";
}

function getPracticeTitlePath(data, fallbackTitlePath = "문제 풀이") {
    const directPathCandidates = [
        data?.titlePath,
        data?.folderPath,
        data?.fullPath,
        data?.path,
        data?.folder?.titlePath,
        data?.folder?.folderPath,
        data?.folder?.fullPath,
        data?.folder?.path,
    ];

    for (const candidate of directPathCandidates) {
        const pathText = normalizePathText(candidate);

        if (pathText) {
            return pathText;
        }
    }

    const breadcrumbCandidates = [
        data?.breadcrumbs,
        data?.breadcrumb,
        data?.folderBreadcrumbs,
        data?.folderBreadcrumb,
        data?.folderPathItems,
    ];

    for (const candidate of breadcrumbCandidates) {
        const pathText = buildPathTextFromItems(candidate);

        if (pathText) {
            return pathText;
        }
    }

    return normalizePathText(fallbackTitlePath) || "문제 풀이";
}

function getProblemTitlePath(problem, fallbackTitlePath = "문제 풀이") {
    const directPathCandidates = [
        problem?.titlePath,
        problem?.folderPath,
        problem?.fullPath,
        problem?.path,
        problem?.folderTitlePath,
        problem?.folderFullPath,
        problem?.meta?.titlePath,
        problem?.meta?.folderPath,
        problem?.meta?.fullPath,
        problem?.meta?.path,
        problem?.folder?.titlePath,
        problem?.folder?.folderPath,
        problem?.folder?.fullPath,
        problem?.folder?.path,
    ];

    for (const candidate of directPathCandidates) {
        const pathText = normalizePathText(candidate);

        if (pathText) {
            return pathText;
        }
    }

    const breadcrumbCandidates = [
        problem?.breadcrumbs,
        problem?.breadcrumb,
        problem?.folderBreadcrumbs,
        problem?.folderBreadcrumb,
        problem?.folderPathItems,
        problem?.meta?.breadcrumbs,
        problem?.meta?.breadcrumb,
        problem?.meta?.folderBreadcrumbs,
        problem?.meta?.folderBreadcrumb,
        problem?.meta?.folderPathItems,
        problem?.folder?.breadcrumbs,
        problem?.folder?.breadcrumb,
    ];

    for (const candidate of breadcrumbCandidates) {
        const pathText = buildPathTextFromItems(candidate);

        if (pathText) {
            return pathText;
        }
    }

    return normalizePathText(fallbackTitlePath) || "문제 풀이";
}

function splitTitlePath(titlePathValue) {
    const normalizedPath = normalizePathText(titlePathValue);

    if (!normalizedPath) {
        return {
            parentPath: "",
            currentTitle: "문제 풀이",
        };
    }

    const parts = normalizedPath
        .split("/")
        .map((part) => part.trim())
        .filter(Boolean);

    if (parts.length === 0) {
        return {
            parentPath: "",
            currentTitle: "문제 풀이",
        };
    }

    if (parts.length === 1) {
        return {
            parentPath: "",
            currentTitle: parts[0],
        };
    }

    return {
        parentPath: `${parts.slice(0, -1).join(" / ")} /`,
        currentTitle: parts[parts.length - 1],
    };
}

export default function QuizPlayPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const folderId = searchParams.get("folderId");
    const mode = searchParams.get("mode");

    const isBookmarkMode = mode === "bookmark";
    const isRandomMode = mode === "random";
    const isFolderMode = mode === "folder";

    /**
     * 중요:
     * 기존에는 bookmark, random만 지원해서 mode=folder가 unsupported로 처리되었다.
     * 이제 folder도 정식 지원 모드로 인정한다.
     *
     * 또한 과거 URL 호환을 위해 /quiz/play?folderId=9 처럼 mode 없이 folderId만 있는 경우도
     * 폴더 문제 풀이로 처리한다.
     */
    const isLegacyFolderMode = !mode && !!folderId;
    const isFolderPracticeMode = isFolderMode || isLegacyFolderMode;

    const isUnsupportedMode =
        !!mode && !isBookmarkMode && !isRandomMode && !isFolderMode;

    const initialTitlePath = location.state?.titlePath ?? "";

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
                    const fetchedProblems = data.problems ?? [];

                    if (ignore) return;

                    setLocalProblems(fetchedProblems);

                    const firstProblemPath = getProblemTitlePath(
                        fetchedProblems[0],
                        ""
                    );

                    setTitlePath(firstProblemPath || "북마크 문제 풀이");
                    setQuestionStartedAt(Date.now());
                    return;
                }

                if (isRandomMode) {
                    if (ignore) return;

                    setError("랜덤 문제 풀기는 아직 별도 연동 전입니다.");
                    setTitlePath("랜덤 문제 풀기");
                    return;
                }

                if (isUnsupportedMode) {
                    if (ignore) return;

                    setError(`지원하지 않는 문제 풀이 모드입니다: ${mode}`);
                    setTitlePath("QuizPlayPage");
                    return;
                }

                /**
                 * folder 모드 처리
                 * - /quiz/play?mode=folder&folderId=9
                 * - /quiz/play?folderId=9
                 * 둘 다 지원한다.
                 */
                if (isFolderPracticeMode) {
                    if (!folderId) {
                        if (ignore) return;

                        setError("folderId가 없습니다. leaf 폴더에서 진입해주세요.");
                        setTitlePath("QuizPlayPage");
                        return;
                    }

                    const data = await getFolderPractice(folderId);

                    if (ignore) return;

                    const fetchedProblems = data.problems ?? [];

                    setLocalProblems(fetchedProblems);
                    setTitlePath(
                        getPracticeTitlePath(data, initialTitlePath || "문제 풀이")
                    );
                    setQuestionStartedAt(Date.now());
                    return;
                }

                /**
                 * mode도 없고 folderId도 없는 경우
                 */
                if (!folderId) {
                    if (ignore) return;

                    setError("folderId가 없습니다. leaf 폴더에서 진입해주세요.");
                    setTitlePath("QuizPlayPage");
                    return;
                }

                /**
                 * 방어적 fallback:
                 * 기존 /quiz/play?folderId=9 흐름이 혹시 위 분기를 타지 못해도 동작하도록 유지한다.
                 */
                const data = await getFolderPractice(folderId);

                if (ignore) return;

                setLocalProblems(data.problems ?? []);
                setTitlePath(
                    getPracticeTitlePath(data, initialTitlePath || "문제 풀이")
                );
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
    }, [
        folderId,
        mode,
        initialTitlePath,
        isBookmarkMode,
        isRandomMode,
        isFolderMode,
        isLegacyFolderMode,
        isFolderPracticeMode,
        isUnsupportedMode,
    ]);

    useEffect(() => {
        if (!loading && problems.length > 0 && !showCompleteScreen) {
            setQuestionStartedAt(Date.now());
            setSubmissionError("");
            setTimeAdjustError("");
        }
    }, [currentIndex, loading, problems.length, showCompleteScreen]);

    const handleExit = () => {
        navigate("/");
    };

    const getExitButtonText = () => {
        return "홈으로";
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

    const toggleAnswerByPageClick = () => {
        if (submitting) return;
        if (timeAdjustModal.open) return;

        setShowAnswer((prev) => !prev);
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
            <div style={pageStyle}>
                <h1 style={{ margin: 0 }}>{titlePath || "문제 풀이"}</h1>
                <p style={mutedTextStyle}>문제를 불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={pageStyle}>
                <h1 style={{ margin: 0 }}>{titlePath || "QuizPlayPage"}</h1>
                <p style={{ color: "var(--color-danger, #fca5a5)" }}>{error}</p>

                {!isBookmarkMode && !isRandomMode && !isUnsupportedMode && !folderId && (
                    <p style={mutedTextStyle}>
                        예: <code>/quiz/play?mode=folder&amp;folderId=9</code>
                    </p>
                )}
            </div>
        );
    }

    if (problems.length === 0) {
        return (
            <div style={pageStyle}>
                <h1 style={{ margin: 0 }}>{titlePath || "문제 풀이"}</h1>
                <p style={mutedTextStyle}>{getEmptyMessage()}</p>
            </div>
        );
    }

    if (showCompleteScreen) {
        return (
            <div
                style={{
                    ...pageStyle,
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
                <p style={mutedTextStyle}>{getCompleteMessage()}</p>
                <button style={getButtonStyle(false)} onClick={handleExit}>
                    {getExitButtonText()}
                </button>
            </div>
        );
    }

    const problem = problems[currentIndex];
    const currentTitlePath = getProblemTitlePath(
        problem,
        titlePath || "문제 풀이"
    );
    const { parentPath, currentTitle } = splitTitlePath(currentTitlePath);

    const isPrevDisabled = currentIndex === 0 || submitting;
    const isNextDisabled = submitting;
    const isExitDisabled = submitting;

    return (
        <div
            style={pageStyle}
            onClick={toggleAnswerByPageClick}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    gap: 16,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        minWidth: 0,
                        flex: 1,
                    }}
                >
                    {parentPath && (
                        <p style={titleParentPathStyle}>
                            {parentPath}
                        </p>
                    )}

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            minWidth: 0,
                        }}
                    >
                        <h1 style={titleMainStyle}>
                            {currentTitle} [{problem.questionNo}번]
                        </h1>
                    </div>
                </div>

                <div style={progressCountStyle}>
                    {currentIndex + 1} / {problems.length}
                </div>
            </div>

            <hr style={hrStyle} />

            <div style={{ marginBottom: 16 }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 6,
                    }}
                >
                    <span style={{ flexShrink: 0, lineHeight: 1.7 }}>💁‍♂</span>

                    <div
                        className="quiz-markdown"
                        style={{ flex: 1, minWidth: 0, ...questionTextStyle }}
                    >
                        <MarkdownContent value={problem.questionText} />
                    </div>
                </div>
            </div>

            {problem.questionImages?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    {problem.questionImages.map((img, idx) => (
                        <img
                            key={img.imageId ?? idx}
                            src={img.url}
                            alt={img.alt ?? "question"}
                            style={{
                                maxWidth: "100%",
                                borderRadius: 8,
                                marginBottom: 8,
                                border: "1px solid var(--color-border, #374151)",
                            }}
                        />
                    ))}
                </div>
            )}

            {showAnswer && (
                <div style={answerCardStyle}>
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ marginBottom: 6, fontWeight: 600 }}>해설</div>

                        <div className="quiz-markdown" style={explanationTextStyle}>
                            <MarkdownContent value={problem.explanationText} />
                        </div>
                    </div>

                    <div>
                        <div style={{ marginBottom: 6, fontWeight: 600 }}>정답</div>

                        <div className="quiz-markdown" style={answerTextStyle}>
                            <MarkdownContent value={problem.answerText} />
                        </div>
                    </div>
                </div>
            )}

            {submissionError && (
                <p
                    style={{
                        color: "var(--color-danger, #fca5a5)",
                        marginTop: 0,
                    }}
                >
                    {submissionError}
                </p>
            )}
            <div
                onClick={(e) => e.stopPropagation()}
                style={bottomLeftControlsStyle}
            >
                <button
                    style={getButtonStyle(isPrevDisabled)}
                    onClick={goPrev}
                    disabled={isPrevDisabled}
                >
                    이전 문제
                </button>

                <button
                    style={getButtonStyle(isNextDisabled)}
                    onClick={handleNextClick}
                    disabled={isNextDisabled}
                >
                    {submitting ? "제출 중..." : "다음 문제"}
                </button>
            </div>

            <div
                onClick={(e) => e.stopPropagation()}
                style={bottomBookmarkStyle}
            >
                <BookmarkToggleButton
                    isBookmarked={!!problem?.meta?.isBookmarked}
                    onClick={toggleBookmark}
                />
            </div>

            {timeAdjustModal.open && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.68)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                        padding: 16,
                    }}
                >
                    <div style={modalCardStyle}>
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
                                style={inputStyle}
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
                                style={inputStyle}
                            />
                            <span>초</span>
                        </div>

                        {timeAdjustError && (
                            <p style={{ color: "var(--color-danger, #fca5a5)" }}>
                                {timeAdjustError}
                            </p>
                        )}

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 8,
                                marginTop: 20,
                            }}
                        >
                            <button
                                style={getButtonStyle(submitting)}
                                onClick={closeTimeAdjustModal}
                                disabled={submitting}
                            >
                                취소
                            </button>
                            <button
                                style={getButtonStyle(submitting)}
                                onClick={handleTimeAdjustSubmit}
                                disabled={submitting}
                            >
                                {submitting ? "제출 중..." : "제출"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div onClick={(e) => e.stopPropagation()}>
                <FabGroup
                    onEdit={goEdit}
                    onHome={() => navigate("/")}
                    onToggleMusic={() => setIsMusicOn((v) => !v)}
                    isMusicOn={isMusicOn}
                />
            </div>
        </div>
    );
}

function BookmarkToggleButton({ isBookmarked, onClick }) {
    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            aria-label={isBookmarked ? "북마크 해제" : "북마크 추가"}
            title={isBookmarked ? "북마크 해제" : "북마크 추가"}
            style={{
                width: 48,
                height: 48,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                background: "transparent",
                color: isBookmarked
                    ? "var(--color-primary, #f59e0b)"
                    : "var(--color-text-muted, #9ca3af)",
                cursor: "pointer",
                padding: 0,
                flexShrink: 0,
            }}
        >
            <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    d="M6 4.75C6 3.78 6.78 3 7.75 3h8.5C17.22 3 18 3.78 18 4.75V21l-6-3.75L6 21V4.75Z"
                    fill={isBookmarked ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
            </svg>
        </button>
    );
}