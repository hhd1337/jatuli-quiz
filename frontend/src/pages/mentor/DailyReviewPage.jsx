import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    generateDailyMentorFeedback,
    getCurrentMentorPlans,
    getDailyMentorFeedback,
    getDailyReflection,
    getDailyRoutineSummary,
    saveDailyReflection,
} from "../../shared/api/mentorApi";

const pageStyle = {
    width: "100%",
    maxWidth: 960,
    margin: "0 auto",
    padding: "28px clamp(10px, 3vw, 22px) 56px",
    color: "var(--color-text)",
    boxSizing: "border-box",
};

const cardStyle = {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid var(--color-border)",
    background: "var(--color-surface)",
    color: "var(--color-text)",
    borderRadius: 18,
    padding: "clamp(16px, 4vw, 22px)",
};

const softCardStyle = {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid var(--color-border)",
    background: "var(--color-surface)",
    color: "var(--color-text)",
    borderRadius: 14,
    padding: 14,
};

const mutedTextStyle = {
    color: "var(--color-text-muted)",
};

const buttonBaseStyle = {
    border: "1px solid var(--color-border)",
    background: "var(--color-button-bg)",
    color: "var(--color-button-text)",
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 800,
    fontSize: 14,
    cursor: "pointer",
};

const primaryButtonStyle = {
    ...buttonBaseStyle,
    background: "var(--color-primary)",
    color: "var(--color-bg)",
};

const accentColors = {
    blue: "#60a5fa",
    green: "#22c55e",
    pink: "#fb7185",
    amber: "#f59e0b",
    purple: "#a78bfa",
    grey: "#f9fafb",
};

function SummaryMetricCard({
                               label,
                               value,
                               accentColor,
                           }) {
    return (
        <div
            style={{
                ...softCardStyle,
                position: "relative",
                overflow: "hidden",
                minHeight: 92,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: `inset 4px 0 0 ${accentColor}`,
            }}
        >
            <div
                style={{
                    color: "var(--color-text-muted)",
                    fontSize: 14,
                    fontWeight: 800,
                }}
            >
                {label}
            </div>

            <strong
                style={{
                    marginTop: 8,
                    fontSize: 30,
                    lineHeight: 1,
                    color: "var(--color-text)",
                    letterSpacing: "-0.04em",
                }}
            >
                {value}
            </strong>
        </div>
    );
}

const textareaStyle = {
    width: "100%",
    border: "1px solid var(--color-border)",
    background: "var(--color-bg)",
    color: "var(--color-text)",
    borderRadius: 12,
    padding: "12px 13px",
    fontSize: 14,
    boxSizing: "border-box",
    resize: "vertical",
    lineHeight: 1.6,
    minHeight: 82,
};

function getTodayDateText() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const date = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${date}`;
}

function getApiErrorMessage(error, fallbackMessage) {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.result?.message ||
        fallbackMessage
    );
}

function formatDateTime(value) {
    if (!value) return "-";

    return String(value).replace("T", " ").slice(0, 16);
}

function formatTime(value) {
    if (!value) return "-";

    return String(value).replace("T", " ").slice(11, 16);
}

function formatTaskTimeRange(task) {
    const start = task?.startTime ? String(task.startTime).slice(0, 5) : "";
    const end = task?.endTime ? String(task.endTime).slice(0, 5) : "";

    if (!start && !end) {
        return "";
    }

    return `${start}~${end}`;
}

function getStatusText(status) {
    switch (status) {
        case "COMPLETED":
            return "완료";
        case "SKIPPED":
            return "건너뜀";
        case "PENDING":
            return "대기";
        default:
            return status ?? "-";
    }
}

function getStatusVisual(status) {
    switch (status) {
        case "COMPLETED":
            return {
                text: "완료",
                color: "#22c55e",
                background: "rgba(34, 197, 94, 0.12)",
                border: "1px solid rgba(34, 197, 94, 0.35)",
            };
        case "SKIPPED":
            return {
                text: "건너뜀",
                color: "#f59e0b",
                background: "rgba(245, 158, 11, 0.12)",
                border: "1px solid rgba(245, 158, 11, 0.35)",
            };
        case "PENDING":
            return {
                text: "대기",
                color: "#fb7185",
                background: "rgba(251, 113, 133, 0.12)",
                border: "1px solid rgba(251, 113, 133, 0.35)",
            };
        default:
            return {
                text: status ?? "-",
                color: "var(--color-text-muted)",
                background: "transparent",
                border: "1px solid var(--color-border)",
            };
    }
}

function TaskList({
                      title,
                      icon,
                      accentColor,
                      tasks,
                      emptyText,
                  }) {
    return (
        <div
            style={{
                ...softCardStyle,
                boxShadow: `inset 3px 0 0 ${accentColor}`,
            }}
        >
            <h3
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 0,
                    marginBottom: 12,
                    fontSize: 17,
                    letterSpacing: "-0.04em",
                }}
            >
                <span
                    aria-hidden="true"
                    style={{
                        color: accentColor,
                        fontSize: 18,
                    }}
                >
                    {icon}
                </span>
                {title}
            </h3>

            {!tasks?.length ? (
                <p
                    style={{
                        ...mutedTextStyle,
                        margin: 0,
                        fontSize: 14,
                        lineHeight: 1.6,
                    }}
                >
                    {emptyText}
                </p>
            ) : (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                    }}
                >
                    {tasks.map((task, index) => {
                        const statusVisual = getStatusVisual(task.status);

                        return (
                            <div
                                key={`${task.label}-${task.startTime}-${index}`}
                                style={{
                                    position: "relative",
                                    border: "1px solid var(--color-border)",
                                    background: "var(--color-bg)",
                                    borderRadius: 14,
                                    padding: "13px 14px 42px",
                                    minHeight: 94,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "baseline",
                                        gap: 8,
                                        flexWrap: "wrap",
                                        paddingRight: 8,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 18,
                                            fontWeight: 900,
                                            lineHeight: 1.45,
                                            color: "var(--color-text)",
                                            wordBreak: "break-word",
                                            letterSpacing: "-0.035em",
                                        }}
                                    >
                                        {task.taskContent || "할 일 없음"}
                                    </span>

                                    <span
                                        style={{
                                            ...mutedTextStyle,
                                            fontSize: 12,
                                            lineHeight: 1.4,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {task.label} · {formatTaskTimeRange(task)}
                                    </span>
                                </div>

                                {task.completedAt && (
                                    <div
                                        style={{
                                            ...mutedTextStyle,
                                            position: "absolute",
                                            left: 14,
                                            bottom: 14,
                                            fontSize: 12,
                                        }}
                                    >
                                        완료 처리: {formatDateTime(task.completedAt)}
                                    </div>
                                )}

                                <span
                                    style={{
                                        position: "absolute",
                                        right: 14,
                                        bottom: 12,
                                        color: statusVisual.color,
                                        background: statusVisual.background,
                                        border: statusVisual.border,
                                        borderRadius: 999,
                                        padding: "4px 9px",
                                        fontSize: 12,
                                        fontWeight: 900,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {statusVisual.text}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function DailyReviewPage() {
    const navigate = useNavigate();

    const [todayDate] = useState(() => getTodayDateText());

    const [summary, setSummary] = useState(null);
    const [plans, setPlans] = useState(null);
    const [reflection, setReflection] = useState({
        mood: "",
        good: "",
        regret: "",
        freeText: "",
    });
    const [feedback, setFeedback] = useState(null);

    const [loading, setLoading] = useState(true);
    const [savingAndGenerating, setSavingAndGenerating] = useState(false);
    const [copying, setCopying] = useState(false);
    const [message, setMessage] = useState("");

    const hasAnyReflectionText = useMemo(() => {
        return Object.values(reflection).some((value) => value.trim().length > 0);
    }, [reflection]);

    const hasMissingPlans = useMemo(() => {
        if (!plans) return false;

        return !plans.careerPlan || !plans.monthlyPlan || !plans.weeklyPlan;
    }, [plans]);

    useEffect(() => {
        let ignore = false;

        async function loadDailyReviewData() {
            try {
                setLoading(true);
                setMessage("");

                const [summaryResult, plansResult] = await Promise.allSettled([
                    getDailyRoutineSummary(todayDate),
                    getCurrentMentorPlans(),
                ]);

                if (ignore) return;

                if (summaryResult.status === "fulfilled") {
                    setSummary(summaryResult.value);
                } else {
                    console.error("루틴 요약 조회 실패:", summaryResult.reason);
                    setSummary(null);
                    setMessage("오늘 루틴 요약을 불러오지 못했습니다. 오늘 루틴을 먼저 등록해주세요.");
                }

                if (plansResult.status === "fulfilled") {
                    setPlans(plansResult.value);
                } else {
                    console.error("AI 멘토 계획 조회 실패:", plansResult.reason);
                    setPlans(null);
                }

                try {
                    const reflectionResult = await getDailyReflection(todayDate);

                    if (!ignore) {
                        setReflection({
                            mood: reflectionResult?.mood ?? "",
                            good: reflectionResult?.good ?? "",
                            regret: reflectionResult?.regret ?? "",
                            freeText: reflectionResult?.freeText ?? "",
                        });
                    }
                } catch (error) {
                    console.info("작성된 오늘 소감이 아직 없습니다.", error);
                }

                try {
                    const feedbackResult = await getDailyMentorFeedback(todayDate);

                    if (!ignore) {
                        setFeedback(feedbackResult);
                    }
                } catch (error) {
                    console.info("생성된 오늘 AI 멘토 피드백이 아직 없습니다.", error);
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        loadDailyReviewData();

        return () => {
            ignore = true;
        };
    }, [todayDate]);

    function handleChangeReflection(field, value) {
        setReflection((prev) => ({
            ...prev,
            [field]: value,
        }));
    }

    async function handleSaveAndGenerateFeedback() {
        if (!summary) {
            alert("오늘 루틴 요약이 없습니다. 오늘 루틴을 먼저 등록해주세요.");
            return;
        }

        if (!hasAnyReflectionText) {
            alert("오늘 소감을 한 줄이라도 입력해주세요.");
            return;
        }

        try {
            setSavingAndGenerating(true);
            setMessage("");

            await saveDailyReflection({
                reflectionDate: todayDate,
                mood: reflection.mood.trim(),
                good: reflection.good.trim(),
                regret: reflection.regret.trim(),
                freeText: reflection.freeText.trim(),
            });

            const generatedFeedback = await generateDailyMentorFeedback(todayDate);

            setFeedback(generatedFeedback);
            setMessage("AI 멘토 피드백이 생성되었습니다.");
        } catch (error) {
            console.error("AI 멘토 피드백 생성 실패:", error);
            alert(getApiErrorMessage(error, "AI 멘토 피드백 생성에 실패했습니다."));
        } finally {
            setSavingAndGenerating(false);
        }
    }

    async function handleCopyFeedback() {
        if (!feedback?.feedbackContent) {
            alert("복사할 AI 멘토 피드백이 없습니다.");
            return;
        }

        try {
            setCopying(true);

            await navigator.clipboard.writeText(feedback.feedbackContent);

            setMessage("AI 멘토 피드백을 클립보드에 복사했습니다.");
        } catch (error) {
            console.error("AI 멘토 피드백 복사 실패:", error);
            alert("복사에 실패했습니다. 브라우저 권한 또는 접속 환경을 확인해주세요.");
        } finally {
            setCopying(false);
        }
    }

    if (loading) {
        return (
            <div style={pageStyle}>
                <h1 style={{ margin: 0 }}>오늘 하루 마무리</h1>
                <p style={mutedTextStyle}>오늘 루틴 결과와 소감을 불러오는 중입니다...</p>
            </div>
        );
    }

    return (
        <div style={pageStyle}>
            <header
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: 14,
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: 28,
                            letterSpacing: "-0.05em",
                        }}
                    >
                        오늘 하루 마무리
                    </h1>
                    <p
                        style={{
                            ...mutedTextStyle,
                            marginTop: 6,
                            marginBottom: 0,
                            fontSize: 13,
                        }}
                    >
                        {todayDate} · 루틴 결과와 소감을 바탕으로 AI 멘토 피드백을 생성합니다.
                    </p>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                    }}
                >
                    <button
                        type="button"
                        onClick={() => navigate("/mentor/plans")}
                        style={buttonBaseStyle}
                    >
                        🗓️장기계획
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/routine")}
                        style={buttonBaseStyle}
                    >
                        오늘루틴 돌아가기
                    </button>
                </div>
            </header>

            {message && (
                <div
                    style={{
                        ...softCardStyle,
                        marginBottom: 12,
                        color: "var(--color-primary)",
                        fontSize: 14,
                        fontWeight: 700,
                    }}
                >
                    {message}
                </div>
            )}

            {hasMissingPlans && (
                <div
                    style={{
                        ...softCardStyle,
                        marginBottom: 12,
                        color: "var(--color-primary)",
                        fontSize: 14,
                        lineHeight: 1.6,
                    }}
                >
                    AI 멘토 계획이 아직 일부 비어 있습니다. 그래도 피드백 생성은 가능하지만,
                    장기/월간/주간 계획을 입력하면 더 정확한 피드백을 받을 수 있습니다.
                    <div style={{ marginTop: 10 }}>
                        <button
                            type="button"
                            onClick={() => navigate("/mentor/plans")}
                            style={buttonBaseStyle}
                        >
                            멘토 계획 설정하기
                        </button>
                    </div>
                </div>
            )}

            <section
                style={{
                    ...cardStyle,
                    marginBottom: 14,
                }}
            >
                <h2
                    style={{
                        marginTop: 0,
                        marginBottom: 12,
                        fontSize: 20,
                        letterSpacing: "-0.04em",
                    }}
                >
                    오늘 루틴 결과 요약
                </h2>

                {!summary ? (
                    <div style={softCardStyle}>
                        <p
                            style={{
                                ...mutedTextStyle,
                                marginTop: 0,
                                lineHeight: 1.6,
                            }}
                        >
                            오늘 루틴 결과를 불러오지 못했습니다. 오늘 루틴을 먼저 등록한 뒤 다시 시도해주세요.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/routine")}
                            style={primaryButtonStyle}
                        >
                            오늘 루틴 등록하러 가기
                        </button>
                    </div>
                ) : (
                    <>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                                gap: 10,
                                marginBottom: 14,
                            }}
                        >
                            <SummaryMetricCard
                                label="전체 Task"
                                value={summary.totalCount}
                                //accentColor={accentColors.grey}
                            />

                            <SummaryMetricCard
                                label="완료"
                                value={summary.completedCount}
                                //accentColor={accentColors.grey}
                            />

                            <SummaryMetricCard
                                label="미완료"
                                value={(summary.pendingCount ?? 0) + (summary.skippedCount ?? 0)}
                                //accentColor={accentColors.grey}
                            />

                            <SummaryMetricCard
                                label="완료율"
                                value={`${summary.completionRate}%`}
                                //accentColor={accentColors.grey}
                            />

                            <SummaryMetricCard
                                label="계획 등록"
                                value={formatTime(summary.plannedAt)}
                                //accentColor={accentColors.grey}
                            />
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                                gap: 12,
                            }}
                        >
                            <TaskList
                                title="⭕ 완료한 일"
                                tasks={summary.completedTasks}
                                emptyText="아직 완료한 일이 없습니다."
                            />

                            <TaskList
                                title="❌ 미완료한 일"
                                tasks={summary.uncompletedTasks}
                                emptyText="미완료한 일이 없습니다."
                            />
                        </div>
                    </>
                )}
            </section>

            <section
                style={{
                    ...cardStyle,
                    marginBottom: 14,
                }}
            >
                <h2
                    style={{
                        marginTop: 0,
                        marginBottom: 12,
                        fontSize: 20,
                        letterSpacing: "-0.04em",
                    }}
                >
                    오늘 소감 입력
                </h2>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 14,
                    }}
                >
                    <label
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            fontSize: 14,
                            fontWeight: 800,
                        }}
                    >
                        컨디션/감정
                        <textarea
                            value={reflection.mood}
                            onChange={(event) => handleChangeReflection("mood", event.target.value)}
                            placeholder="예: 조금 지쳤지만 끝까지 붙잡았다."
                            style={textareaStyle}
                        />
                    </label>

                    <label
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            fontSize: 14,
                            fontWeight: 800,
                        }}
                    >
                        잘한 점
                        <textarea
                            value={reflection.good}
                            onChange={(event) => handleChangeReflection("good", event.target.value)}
                            placeholder="예: 루틴 시계 기능을 많이 완성했다."
                            style={textareaStyle}
                        />
                    </label>

                    <label
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            fontSize: 14,
                            fontWeight: 800,
                        }}
                    >
                        아쉬운 점
                        <textarea
                            value={reflection.regret}
                            onChange={(event) => handleChangeReflection("regret", event.target.value)}
                            placeholder="예: 야자 시간대 집중이 떨어졌다."
                            style={textareaStyle}
                        />
                    </label>

                    <label
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            fontSize: 14,
                            fontWeight: 800,
                        }}
                    >
                        자유 소감
                        <textarea
                            value={reflection.freeText}
                            onChange={(event) => handleChangeReflection("freeText", event.target.value)}
                            placeholder="예: 오늘은 중간에 흔들렸지만 그래도 끝까지 붙잡았다."
                            style={{
                                ...textareaStyle,
                                minHeight: 130,
                            }}
                        />
                    </label>
                </div>

                <button
                    type="button"
                    onClick={handleSaveAndGenerateFeedback}
                    disabled={savingAndGenerating || !summary}
                    style={{
                        ...primaryButtonStyle,
                        width: "100%",
                        marginTop: 16,
                        padding: "13px 14px",
                        fontSize: 15,
                        opacity: savingAndGenerating || !summary ? 0.65 : 1,
                        cursor: savingAndGenerating || !summary ? "not-allowed" : "pointer",
                    }}
                >
                    {savingAndGenerating ? "AI 피드백 생성 중..." : "소감 저장하고 AI 피드백 받기"}
                </button>
            </section>

            <section style={cardStyle}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 12,
                        flexWrap: "wrap",
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontSize: 20,
                            letterSpacing: "-0.04em",
                        }}
                    >
                        AI 피드백 결과
                    </h2>

                    <div
                        style={{
                            display: "flex",
                            gap: 8,
                            flexWrap: "wrap",
                        }}
                    >
                        <button
                            type="button"
                            onClick={handleCopyFeedback}
                            disabled={copying || !feedback?.feedbackContent}
                            style={{
                                ...buttonBaseStyle,
                                opacity: copying || !feedback?.feedbackContent ? 0.65 : 1,
                                cursor: copying || !feedback?.feedbackContent ? "not-allowed" : "pointer",
                            }}
                        >
                            {copying ? "복사 중..." : "복사하기"}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/routine")}
                            style={buttonBaseStyle}
                        >
                            오늘루틴 돌아가기
                        </button>
                    </div>
                </div>

                {!feedback?.feedbackContent ? (
                    <p
                        style={{
                            ...mutedTextStyle,
                            margin: 0,
                            lineHeight: 1.6,
                        }}
                    >
                        아직 생성된 AI 멘토 피드백이 없습니다. 오늘 소감을 입력한 뒤 피드백을 생성해주세요.
                    </p>
                ) : (
                    <pre
                        style={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            margin: 0,
                            lineHeight: 1.7,
                            fontFamily: "inherit",
                            fontSize: 15,
                            background: "var(--color-bg)",
                            border: "1px solid var(--color-border)",
                            borderRadius: 14,
                            padding: 14,
                        }}
                    >
                        {feedback.feedbackContent}
                    </pre>
                )}
            </section>
        </div>
    );
}