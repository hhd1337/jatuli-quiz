import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    useNavigate,
} from "react-router-dom";
import { submitExam } from "../../shared/api/examApi.js";
import {
    clearActiveExam,
    loadActiveExam,
    saveActiveExam,
    saveCompletedExam,
} from "../../features/exam/examStorage.js";
import "./exam.css";

function calculateRemainingSeconds(deadlineAt) {
    return Math.max(
        0,
        Math.ceil((deadlineAt - Date.now()) / 1000)
    );
}

function formatTimer(totalSeconds) {
    const safeSeconds = Math.max(
        0,
        Number(totalSeconds ?? 0)
    );

    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor(
        (safeSeconds % 3600) / 60
    );
    const seconds = safeSeconds % 60;

    if (hours > 0) {
        return [
            hours,
            minutes,
            seconds,
        ]
            .map((value) =>
                String(value).padStart(2, "0")
            )
            .join(":");
    }

    return [minutes, seconds]
        .map((value) =>
            String(value).padStart(2, "0")
        )
        .join(":");
}

export default function ExamPlayPage() {
    const navigate = useNavigate();

    const [exam, setExam] = useState(() =>
        loadActiveExam()
    );

    const [remainingSeconds, setRemainingSeconds] =
        useState(() =>
            exam
                ? calculateRemainingSeconds(
                    exam.deadlineAt
                )
                : 0
        );

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [submitError, setSubmitError] =
        useState("");

    const submittingRef = useRef(false);

    useEffect(() => {
        if (!exam) {
            navigate("/exam/setup", {
                replace: true,
            });
        }
    }, [exam, navigate]);

    const submitCurrentExam = useCallback(
        async (submissionReason) => {
            if (
                !exam ||
                submittingRef.current
            ) {
                return;
            }

            submittingRef.current = true;
            setIsSubmitting(true);
            setSubmitError("");

            const elapsedSeconds = Math.min(
                exam.timeLimitSeconds,
                Math.max(
                    0,
                    Math.floor(
                        (Date.now() -
                            exam.startedAt) /
                        1000
                    )
                )
            );

            const problemIds = exam.problems.map(
                (problem) => problem.problemId
            );

            try {
                const submissionResult =
                    await submitExam({
                        problemIds,
                        totalElapsedSeconds:
                        elapsedSeconds,
                    });

                saveCompletedExam({
                    submissionReason,
                    answers: exam.answers,
                    problems: exam.problems,
                    submissionResult,
                });

                clearActiveExam();

                navigate("/exam/complete", {
                    replace: true,
                });
            } catch (error) {
                submittingRef.current = false;
                setIsSubmitting(false);

                setSubmitError(
                    error.message ||
                    "시험 제출에 실패했습니다."
                );
            }
        },
        [exam, navigate]
    );

    useEffect(() => {
        if (!exam || isSubmitting) {
            return undefined;
        }

        const updateTimer = () => {
            const nextRemainingSeconds =
                calculateRemainingSeconds(
                    exam.deadlineAt
                );

            setRemainingSeconds(
                nextRemainingSeconds
            );

            if (nextRemainingSeconds <= 0) {
                submitCurrentExam("TIME_EXPIRED");
            }
        };

        updateTimer();

        const intervalId = window.setInterval(
            updateTimer,
            1000
        );

        return () => {
            window.clearInterval(intervalId);
        };
    }, [
        exam,
        isSubmitting,
        submitCurrentExam,
    ]);

    useEffect(() => {
        if (!exam || isSubmitting) {
            return undefined;
        }

        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener(
            "beforeunload",
            handleBeforeUnload
        );

        return () => {
            window.removeEventListener(
                "beforeunload",
                handleBeforeUnload
            );
        };
    }, [exam, isSubmitting]);

    function handleAnswerChange(
        problemId,
        answer
    ) {
        setExam((previous) => {
            if (!previous) {
                return previous;
            }

            const nextExam = {
                ...previous,
                answers: {
                    ...previous.answers,
                    [String(problemId)]: answer,
                },
            };

            saveActiveExam(nextExam);

            return nextExam;
        });
    }

    function handleManualSubmit() {
        if (isSubmitting) {
            return;
        }

        const shouldSubmit = window.confirm(
            "시험을 제출할까요? 제출 후에는 현재 시험으로 돌아올 수 없습니다."
        );

        if (!shouldSubmit) {
            return;
        }

        submitCurrentExam("MANUAL");
    }

    if (!exam) {
        return null;
    }

    const answeredProblemCount =
        exam.problems.filter((problem) => {
            const answer =
                exam.answers[
                    String(problem.problemId)
                    ];

            return Boolean(answer?.trim());
        }).length;

    const isUrgent =
        remainingSeconds > 0 &&
        remainingSeconds <= 60;

    const remainingTimePercent =
        exam.timeLimitSeconds > 0
            ? Math.max(
                0,
                Math.min(
                    100,
                    (remainingSeconds /
                        exam.timeLimitSeconds) *
                    100
                )
            )
            : 0;

    return (
        <main className="exam-play-page">
            <header className="exam-play-header">
                <div className="exam-play-header__status">
                    <strong>시험 진행 중</strong>

                    <span>
            {answeredProblemCount} /{" "}
                        {exam.totalProblemCount} 답안 작성
        </span>
                </div>

                <div
                    className={`exam-timer ${
                        isUrgent ? "is-urgent" : ""
                    }`}
                    aria-live="polite"
                >
                    {formatTimer(remainingSeconds)}
                </div>

                <div
                    className="exam-countdown-track"
                    role="progressbar"
                    aria-label="시험 남은 시간"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(
                        remainingTimePercent
                    )}
                >
                    <div
                        className="exam-countdown-progress"
                        style={{
                            width: `${remainingTimePercent}%`,
                        }}
                    />
                </div>
            </header>

            {submitError && (
                <div
                    className="exam-error-message"
                    role="alert"
                >
                    {submitError}
                </div>
            )}

            <section className="exam-problem-list">
                {exam.problems.map((problem, index) => {
                    const answer =
                        exam.answers[
                            String(problem.problemId)
                            ] ?? "";

                    const isAnswered =
                        answer.trim().length > 0;

                    return (
                        <article
                            key={problem.problemId}
                            className={[
                                "exam-problem-card",
                                isAnswered ? "is-answered" : "",
                            ]
                                .filter(Boolean)
                                .join(" ")}
                        >
                            <div className="exam-problem-meta">
                                <strong>
                                    {index + 1}번
                                </strong>

                                <span>
                    {problem.folderFullPath ??
                        problem.folderName}
                </span>
                            </div>

                            <div className="exam-question-text">
                                {problem.questionText}
                            </div>

                            <label className="exam-answer-field">
                                <textarea
                                    value={answer}
                                    onChange={(event) =>
                                        handleAnswerChange(
                                            problem.problemId,
                                            event.target.value
                                        )
                                    }
                                    placeholder="생각나는 내용을 자유롭게 작성하세요."
                                    disabled={isSubmitting}
                                />
                            </label>
                        </article>
                    );
                })}
            </section>

            <div className="exam-submit-area">
                <div>
                    <strong>
                        {answeredProblemCount}문제
                        작성
                    </strong>

                    <span>
                        출제된 모든 문제는 제출 시
                        풀이 기록으로 저장됩니다.
                    </span>
                </div>

                <button
                    type="button"
                    className="exam-primary-button"
                    disabled={isSubmitting}
                    onClick={handleManualSubmit}
                >
                    {isSubmitting
                        ? "제출 중..."
                        : "시험 제출"}
                </button>
            </div>
        </main>
    );
}