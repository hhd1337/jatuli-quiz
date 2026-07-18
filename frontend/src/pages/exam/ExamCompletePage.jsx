import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    clearCompletedExam,
    loadCompletedExam,
} from "../../features/exam/examStorage.js";
import "./exam.css";

function formatElapsedSeconds(totalSeconds) {
    const safeSeconds = Math.max(
        0,
        Number(totalSeconds ?? 0)
    );

    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor(
        (safeSeconds % 3600) / 60
    );
    const seconds = safeSeconds % 60;

    const parts = [];

    if (hours > 0) {
        parts.push(`${hours}시간`);
    }

    if (minutes > 0) {
        parts.push(`${minutes}분`);
    }

    parts.push(`${seconds}초`);

    return parts.join(" ");
}

function formatSubmittedAt(submittedAt) {
    if (!submittedAt) {
        return "-";
    }

    const date = new Date(submittedAt);

    if (Number.isNaN(date.getTime())) {
        return submittedAt;
    }

    return new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function normalizeText(value, fallbackText) {
    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {
        return fallbackText;
    }

    return String(value).trim();
}

export default function ExamCompletePage() {
    const navigate = useNavigate();

    const [completedExam] = useState(() =>
        loadCompletedExam()
    );

    useEffect(() => {
        if (!completedExam) {
            navigate("/", {
                replace: true,
            });
        }
    }, [completedExam, navigate]);

    const comparisonProblems = useMemo(() => {
        if (!completedExam) {
            return [];
        }

        const submissionProblems = Array.isArray(
            completedExam.submissionResult?.problems
        )
            ? completedExam.submissionResult.problems
            : [];

        const originalProblems = Array.isArray(
            completedExam.problems
        )
            ? completedExam.problems
            : [];

        const originalProblemMap = new Map(
            originalProblems.map((problem) => [
                String(problem.problemId),
                problem,
            ])
        );

        /*
         * 정상적인 경우에는 제출 API 응답의 problems를 사용한다.
         * 제출 응답에는 실제 정답과 해설이 들어 있다.
         *
         * 응답에 문제가 없다면 시험 시작 당시 문제 목록을
         * 예비 데이터로 사용한다.
         */
        const baseProblems =
            submissionProblems.length > 0
                ? submissionProblems
                : originalProblems;

        return baseProblems.map((problem, index) => {
            const problemId = String(
                problem.problemId
            );

            const originalProblem =
                originalProblemMap.get(problemId);

            const userAnswer =
                completedExam.answers?.[problemId];

            return {
                problemId: problem.problemId,
                orderNumber:
                    problem.orderNumber ?? index + 1,
                problemNum:
                    problem.problemNum ??
                    originalProblem?.problemNum,
                folderFullPath:
                    problem.folderFullPath ??
                    originalProblem?.folderFullPath ??
                    problem.folderName ??
                    originalProblem?.folderName ??
                    "",
                questionText:
                    problem.questionText ??
                    originalProblem?.questionText ??
                    "",
                answerText:
                    problem.answerText ?? "",
                explanationText:
                    problem.explanationText ?? "",
                userAnswer: userAnswer ?? "",
            };
        });
    }, [completedExam]);

    if (!completedExam) {
        return null;
    }

    const result =
        completedExam.submissionResult ?? {};

    function handleGoHome() {
        clearCompletedExam();

        navigate("/", {
            replace: true,
        });
    }

    function handleStartNewExam() {
        clearCompletedExam();

        navigate("/exam/setup", {
            replace: true,
        });
    }

    return (
        <main className="exam-result-page">
            <section className="exam-complete-card">
                <div className="exam-complete-icon">
                    ✓
                </div>

                <h1>시험을 제출했습니다</h1>

                <p>
                    시험에 포함된 모든 문제가 풀이
                    기록으로 저장되었습니다. 아래에서
                    정답과 내가 작성한 답을 비교해보세요.
                </p>

                <dl className="exam-complete-summary">
                    <div>
                        <dt>제출 문제 수</dt>

                        <dd>
                            {result.submittedProblemCount ??
                                comparisonProblems.length}
                            문제
                        </dd>
                    </div>

                    <div>
                        <dt>소요 시간</dt>

                        <dd>
                            {formatElapsedSeconds(
                                result.totalElapsedSeconds
                            )}
                        </dd>
                    </div>

                    <div>
                        <dt>제출 시각</dt>

                        <dd>
                            {formatSubmittedAt(
                                result.submittedAt
                            )}
                        </dd>
                    </div>
                </dl>
            </section>

            <section className="exam-review-section">
                <div className="exam-review-header">
                    <div>
                        <h2>답안 비교</h2>

                        <p>
                            각 문제의 정답과 내가 작성한
                            답을 직접 비교해보세요.
                        </p>
                    </div>

                    <strong>
                        총 {comparisonProblems.length}문제
                    </strong>
                </div>

                <div className="exam-review-list">
                    {comparisonProblems.map(
                        (problem, index) => (
                            <article
                                key={problem.problemId}
                                className="exam-review-card"
                            >
                                <header className="exam-review-card__header">
                                    <strong>
                                        {problem.orderNumber ??
                                            index + 1}
                                        번 문제
                                    </strong>

                                    {problem.folderFullPath && (
                                        <span>
                                            {
                                                problem.folderFullPath
                                            }
                                        </span>
                                    )}
                                </header>

                                <section className="exam-review-block">
                                    <h3>문제</h3>

                                    <div className="exam-review-text">
                                        {normalizeText(
                                            problem.questionText,
                                            "문제 내용이 없습니다."
                                        )}
                                    </div>
                                </section>

                                <section className="exam-review-block exam-review-block--answer">
                                    <h3>정답</h3>

                                    <div className="exam-review-text">
                                        {normalizeText(
                                            problem.answerText,
                                            "등록된 정답이 없습니다."
                                        )}
                                    </div>
                                </section>

                                <section className="exam-review-block exam-review-block--user">
                                    <h3>내가 적은 답</h3>

                                    <div className="exam-review-text">
                                        {normalizeText(
                                            problem.userAnswer,
                                            "작성한 답안이 없습니다."
                                        )}
                                    </div>
                                </section>
                            </article>
                        )
                    )}
                </div>
            </section>

            <div className="exam-result-actions">
                <button
                    type="button"
                    className="exam-secondary-button"
                    onClick={handleGoHome}
                >
                    홈으로
                </button>

                <button
                    type="button"
                    className="exam-primary-button"
                    onClick={handleStartNewExam}
                >
                    새 시험 시작
                </button>
            </div>
        </main>
    );
}