import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getCurrentMentorPlans,
    saveMentorPlan,
} from "../../shared/api/mentorApi";

const pageStyle = {
    width: "100%",
    maxWidth: 920,
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
    minHeight: 130,
};

function getApiErrorMessage(error, fallbackMessage) {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.result?.message ||
        fallbackMessage
    );
}

export default function MentorPlanPage() {
    const navigate = useNavigate();

    const [careerPlan, setCareerPlan] = useState("");
    const [monthlyPlan, setMonthlyPlan] = useState("");
    const [weeklyPlan, setWeeklyPlan] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        let ignore = false;

        async function loadPlans() {
            try {
                setLoading(true);
                setMessage("");

                const data = await getCurrentMentorPlans();

                if (ignore) return;

                setCareerPlan(data?.careerPlan?.content ?? "");
                setMonthlyPlan(data?.monthlyPlan?.content ?? "");
                setWeeklyPlan(data?.weeklyPlan?.content ?? "");
            } catch (error) {
                if (ignore) return;

                console.error("AI 멘토 계획 조회 실패:", error);
                setMessage("기존 AI 멘토 계획을 불러오지 못했습니다. 새로 입력해도 됩니다.");
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        loadPlans();

        return () => {
            ignore = true;
        };
    }, []);

    async function handleSavePlans() {
        try {
            setSaving(true);
            setMessage("");

            await saveMentorPlan("CAREER", {
                content: careerPlan.trim(),
            });

            await saveMentorPlan("MONTHLY", {
                content: monthlyPlan.trim(),
            });

            await saveMentorPlan("WEEKLY", {
                content: weeklyPlan.trim(),
            });

            setMessage("AI 멘토 계획이 저장되었습니다.");
        } catch (error) {
            console.error("AI 멘토 계획 저장 실패:", error);
            alert(getApiErrorMessage(error, "AI 멘토 계획 저장에 실패했습니다."));
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div style={pageStyle}>
                <h1 style={{ margin: 0 }}>AI 멘토 계획 설정</h1>
                <p style={mutedTextStyle}>AI 멘토 계획을 불러오는 중입니다...</p>
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
                        AI 멘토 계획 설정
                    </h1>
                    <p
                        style={{
                            ...mutedTextStyle,
                            marginTop: 6,
                            marginBottom: 0,
                            fontSize: 13,
                            lineHeight: 1.5,
                        }}
                    >
                        AI 멘토가 매일 피드백할 때 참고할 장기/월간/주간 계획을 저장합니다.
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

            <section style={cardStyle}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 18,
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
                        취업 전반 계획
                        <textarea
                            value={careerPlan}
                            onChange={(event) => setCareerPlan(event.target.value)}
                            placeholder="예: 2027년 상반기 백엔드 신입 취업. Java/Spring, CS, 프로젝트 운영 경험, 면접 말하기를 핵심으로 준비한다."
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
                        이번달 계획
                        <textarea
                            value={monthlyPlan}
                            onChange={(event) => setMonthlyPlan(event.target.value)}
                            placeholder="예: 루틴 시계 MVP 완성, AI 멘토 피드백 구현, Redis 분산락 프로젝트 설명 정리."
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
                        이번주 계획
                        <textarea
                            value={weeklyPlan}
                            onChange={(event) => setWeeklyPlan(event.target.value)}
                            placeholder="예: 백엔드 API 검증, 프론트 연동, 매일 문제 복습, PR 정리."
                            style={textareaStyle}
                        />
                    </label>
                </div>

                <button
                    type="button"
                    onClick={handleSavePlans}
                    disabled={saving}
                    style={{
                        ...primaryButtonStyle,
                        width: "100%",
                        marginTop: 18,
                        padding: "13px 14px",
                        fontSize: 15,
                        opacity: saving ? 0.65 : 1,
                        cursor: saving ? "not-allowed" : "pointer",
                    }}
                >
                    {saving ? "저장 중..." : "저장하기"}
                </button>
            </section>
        </div>
    );
}