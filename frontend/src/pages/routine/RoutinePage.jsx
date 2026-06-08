import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    completeRoutinePeriod,
    getDailyRoutine,
    resetRoutinePeriod,
    saveDailyRoutine,
} from "../../shared/api/routineApi";

const DEFAULT_PERIODS = [
    {
        label: "기상 준비",
        startTime: "05:40:00",
        endTime: "06:00:00",
        taskContent: "기상, 세수, 책상 앞에 앉기",
        sortOrder: 1,
        type: "ETC",
    },
    {
        label: "1교시",
        startTime: "06:00:00",
        endTime: "06:50:00",
        taskContent: "",
        sortOrder: 2,
        type: "STUDY",
    },
    {
        label: "2교시",
        startTime: "07:00:00",
        endTime: "07:50:00",
        taskContent: "",
        sortOrder: 3,
        type: "STUDY",
    },
    {
        label: "3교시",
        startTime: "08:00:00",
        endTime: "08:50:00",
        taskContent: "",
        sortOrder: 4,
        type: "STUDY",
    },
    {
        label: "샤워시간",
        startTime: "08:50:00",
        endTime: "09:20:00",
        taskContent: "샤워",
        sortOrder: 5,
        type: "BREAK",
    },
    {
        label: "4교시",
        startTime: "09:20:00",
        endTime: "10:00:00",
        taskContent: "",
        sortOrder: 6,
        type: "STUDY",
    },
    {
        label: "5교시",
        startTime: "10:10:00",
        endTime: "11:00:00",
        taskContent: "",
        sortOrder: 7,
        type: "STUDY",
    },
    {
        label: "6교시",
        startTime: "11:10:00",
        endTime: "12:00:00",
        taskContent: "",
        sortOrder: 8,
        type: "STUDY",
    },
    {
        label: "점심 쉬는 시간",
        startTime: "12:00:00",
        endTime: "15:00:00",
        taskContent: "쉬기, 준비, 웹 예배하기",
        sortOrder: 9,
        type: "BREAK",
    },
    {
        label: "야자 1교시",
        startTime: "15:00:00",
        endTime: "16:00:00",
        taskContent: "",
        sortOrder: 10,
        type: "STUDY",
    },
    {
        label: "야자 2교시",
        startTime: "16:00:00",
        endTime: "17:00:00",
        taskContent: "",
        sortOrder: 11,
        type: "STUDY",
    },
    {
        label: "야자 3교시",
        startTime: "17:00:00",
        endTime: "18:00:00",
        taskContent: "",
        sortOrder: 12,
        type: "STUDY",
    },
    {
        label: "야자 4교시",
        startTime: "18:00:00",
        endTime: "19:00:00",
        taskContent: "",
        sortOrder: 13,
        type: "STUDY",
    },
    {
        label: "야자 5교시",
        startTime: "19:00:00",
        endTime: "20:00:00",
        taskContent: "",
        sortOrder: 14,
        type: "STUDY",
    },
    {
        label: "야자 6교시",
        startTime: "20:00:00",
        endTime: "21:00:00",
        taskContent: "",
        sortOrder: 15,
        type: "STUDY",
    },
    {
        label: "저녁 쉬는 시간",
        startTime: "21:00:00",
        endTime: "22:30:00",
        taskContent: "쉬기, 준비, 웹 예배하기",
        sortOrder: 16,
        type: "BREAK",
    },
];

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
    padding: "14px",
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

const dangerButtonStyle = {
    ...buttonBaseStyle,
    color: "#fca5a5",
};

const inputStyle = {
    width: "100%",
    border: "1px solid var(--color-border)",
    background: "var(--color-bg)",
    color: "var(--color-text)",
    borderRadius: 10,
    padding: "9px 10px",
    fontSize: 14,
    boxSizing: "border-box",
};

const textareaStyle = {
    ...inputStyle,
    minHeight: 42,
    resize: "vertical",
    lineHeight: 1.5,
};

function getTodayDateText() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const date = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${date}`;
}

function cloneDefaultPeriods() {
    return DEFAULT_PERIODS.map((period) => ({ ...period }));
}

function toTimeInputValue(timeText) {
    if (!timeText) return "";
    return String(timeText).slice(0, 5);
}

function normalizeTimeForApi(timeText) {
    if (!timeText) return "00:00:00";

    const parts = String(timeText).split(":");

    const hour = String(parts[0] ?? "00").padStart(2, "0");
    const minute = String(parts[1] ?? "00").padStart(2, "0");
    const second = String(parts[2] ?? "00").padStart(2, "0");

    return `${hour}:${minute}:${second}`;
}

function normalizeTimeInputText(value) {
    if (!value) return "";

    const onlyTimeText = String(value)
        .trim()
        .replace(/[^\d:]/g, "");

    const [rawHour = "", rawMinute = ""] = onlyTimeText.split(":");

    const hour = Math.max(0, Math.min(23, Number(rawHour || 0)));
    const minute = Math.max(0, Math.min(59, Number(rawMinute || 0)));

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function parseTodayTime(timeText, baseDate = new Date()) {
    const normalized = normalizeTimeForApi(timeText);
    const [hour, minute, second] = normalized.split(":");

    const date = new Date(baseDate);
    date.setHours(Number(hour), Number(minute), Number(second), 0);

    return date;
}

function sortPeriodsByTime(periods = []) {
    return [...periods].sort((a, b) => {
        const startCompare = String(a.startTime).localeCompare(String(b.startTime));

        if (startCompare !== 0) {
            return startCompare;
        }

        return Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0);
    });
}

function findCurrentPeriod(periods = [], now = new Date()) {
    return (
        periods.find((period) => {
            const start = parseTodayTime(period.startTime, now);
            const end = parseTodayTime(period.endTime, now);

            return start <= now && now < end;
        }) ?? null
    );
}

function findNextPeriod(periods = [], now = new Date()) {
    return (
        periods.find((period) => {
            const start = parseTodayTime(period.startTime, now);

            return now < start;
        }) ?? null
    );
}

function findPreviousStudyPeriod(periods = [], currentPeriod) {
    if (!currentPeriod) return null;

    const currentIndex = periods.findIndex((period) => isSamePeriod(period, currentPeriod));

    if (currentIndex <= 0) {
        return null;
    }

    for (let index = currentIndex - 1; index >= 0; index -= 1) {
        if (periods[index].type === "STUDY") {
            return periods[index];
        }
    }

    return null;
}

function isSamePeriod(left, right) {
    if (!left || !right) return false;

    if (left.periodId && right.periodId) {
        return left.periodId === right.periodId;
    }

    return (
        left.label === right.label &&
        left.startTime === right.startTime &&
        left.endTime === right.endTime
    );
}

function getElapsedSeconds(period, now = new Date()) {
    if (!period) return 0;

    const start = parseTodayTime(period.startTime, now);

    return Math.max(0, Math.floor((now - start) / 1000));
}

function getRemainingSecondsUntilPeriod(period, now = new Date()) {
    if (!period) return 0;

    const start = parseTodayTime(period.startTime, now);

    return Math.max(0, Math.floor((start - now) / 1000));
}

function formatClockTime(totalSeconds) {
    const safeSeconds = Math.max(0, Number(totalSeconds) || 0);

    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    return [
        String(hours).padStart(2, "0"),
        String(minutes).padStart(2, "0"),
        String(seconds).padStart(2, "0"),
    ].join(":");
}

function formatTimeRange(period) {
    if (!period) return "";

    return `${toTimeInputValue(period.startTime)} ~ ${toTimeInputValue(period.endTime)}`;
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
            return "대기";
    }
}

function isStudyPeriod(period) {
    return period?.type === "STUDY";
}

function getPeriodCardVisualStyle(period, active = false) {
    const study = isStudyPeriod(period);

    if (active) {
        return {
            background: study
                ? "rgba(245, 158, 11, 0.18)"
                : "#3a3f46",
            borderColor: study
                ? "var(--color-primary)"
                : "#4b5563",
        };
    }

    return {
        background: study ? "#050505" : "#2f333b",
        borderColor: "#374151",
    };
}

function getPeriodStatusButtonStyle(period) {
    const completed = period?.status === "COMPLETED";

    return {
        border: completed
            ? "1px solid var(--color-primary)"
            : "1px solid var(--color-border)",
        background: completed
            ? "var(--color-primary)"
            : "transparent",
        color: completed
            ? "var(--color-bg)"
            : "var(--color-text-muted)",
        borderRadius: 999,
        padding: "6px 11px",
        fontSize: 12,
        fontWeight: 900,
        cursor: "pointer",
        whiteSpace: "nowrap",
    };
}

function addMinutesToTime(timeText, minutesToAdd) {
    const normalized = normalizeTimeForApi(timeText);
    const [hour, minute] = normalized.split(":").map(Number);

    const totalMinutes = hour * 60 + minute + minutesToAdd;
    const clampedMinutes = Math.max(0, Math.min(23 * 60 + 59, totalMinutes));

    const nextHour = Math.floor(clampedMinutes / 60);
    const nextMinute = clampedMinutes % 60;

    return `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}:00`;
}

function validatePeriods(periods) {
    if (!periods.length) {
        return "루틴 구간은 최소 1개 이상이어야 합니다.";
    }

    const sortedPeriods = sortPeriodsByTime(periods);

    for (const period of sortedPeriods) {
        if (!period.label?.trim()) {
            return "교시명/구간명을 입력해주세요.";
        }

        if (!period.startTime || !period.endTime) {
            return "시작 시간과 종료 시간을 모두 입력해주세요.";
        }

        const start = parseTodayTime(period.startTime);
        const end = parseTodayTime(period.endTime);

        if (start >= end) {
            return `'${period.label}' 구간의 시작 시간은 종료 시간보다 빨라야 합니다.`;
        }
    }

    for (let index = 0; index < sortedPeriods.length - 1; index += 1) {
        const current = sortedPeriods[index];
        const next = sortedPeriods[index + 1];

        const currentEnd = parseTodayTime(current.endTime);
        const nextStart = parseTodayTime(next.startTime);

        if (currentEnd > nextStart) {
            return `'${current.label}' 구간과 '${next.label}' 구간의 시간이 겹칩니다.`;
        }
    }

    return "";
}

function getApiErrorMessage(error, fallbackMessage) {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.result?.message ||
        fallbackMessage
    );
}

function toFormPeriods(periods = []) {
    return sortPeriodsByTime(periods).map((period, index) => ({
        periodId: period.periodId,
        label: period.label ?? "",
        startTime: normalizeTimeForApi(period.startTime),
        endTime: normalizeTimeForApi(period.endTime),
        taskContent: period.taskContent ?? "",
        sortOrder: period.sortOrder ?? index + 1,
        type: period.type ?? "STUDY",
        status: period.status ?? "PENDING",
    }));
}

function buildSavePayloadPeriods(periods = []) {
    return sortPeriodsByTime(periods).map((period, index) => ({
        label: period.label.trim(),
        startTime: normalizeTimeForApi(period.startTime),
        endTime: normalizeTimeForApi(period.endTime),
        taskContent: period.taskContent?.trim() ?? "",
        sortOrder: index + 1,
        type: period.type || "STUDY",
    }));
}

export default function RoutinePage() {
    const navigate = useNavigate();

    const [todayDate] = useState(() => getTodayDateText());
    const [routine, setRoutine] = useState(null);
    const [formPeriods, setFormPeriods] = useState(() => cloneDefaultPeriods());

    const [now, setNow] = useState(() => new Date());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submittingStatus, setSubmittingStatus] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [message, setMessage] = useState("");

    const orderedPeriods = useMemo(
        () => sortPeriodsByTime(routine?.periods ?? []),
        [routine]
    );

    const currentPeriod = useMemo(
        () => findCurrentPeriod(orderedPeriods, now),
        [orderedPeriods, now]
    );

    const nextPeriod = useMemo(
        () => findNextPeriod(orderedPeriods, now),
        [orderedPeriods, now]
    );

    const previousStudyPeriod = useMemo(
        () => findPreviousStudyPeriod(orderedPeriods, currentPeriod),
        [orderedPeriods, currentPeriod]
    );

    const isBreakTime = currentPeriod?.type === "BREAK";

    const clockTitle = useMemo(() => {
        if (currentPeriod && isBreakTime) {
            if (previousStudyPeriod?.label) {
                return `${previousStudyPeriod.label} 쉬는시간!`;
            }

            return "쉬는시간!";
        }

        if (currentPeriod) {
            return currentPeriod.label;
        }

        if (nextPeriod) {
            return "다음 루틴 대기";
        }

        return "오늘 루틴 종료";
    }, [currentPeriod, isBreakTime, nextPeriod, previousStudyPeriod]);

    const clockSeconds = useMemo(() => {
        if (currentPeriod) {
            return getElapsedSeconds(currentPeriod, now);
        }

        if (nextPeriod) {
            return getRemainingSecondsUntilPeriod(nextPeriod, now);
        }

        return 0;
    }, [currentPeriod, nextPeriod, now]);

    const clockTaskText = useMemo(() => {
        if (currentPeriod) {
            return currentPeriod.taskContent?.trim() || "할 일이 비어 있습니다.";
        }

        if (nextPeriod) {
            return `${nextPeriod.label} · ${formatTimeRange(nextPeriod)} · ${
                nextPeriod.taskContent?.trim() || "할 일이 비어 있습니다."
            }`;
        }

        return "오늘 등록된 모든 루틴 시간이 끝났습니다.";
    }, [currentPeriod, nextPeriod]);

    useEffect(() => {
        const timerId = window.setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => window.clearInterval(timerId);
    }, []);

    useEffect(() => {
        let ignore = false;

        async function loadRoutine() {
            try {
                setLoading(true);
                setMessage("");

                const data = await getDailyRoutine(todayDate);

                if (ignore) return;

                setRoutine(data);
                setFormPeriods(toFormPeriods(data.periods));
                setIsEditMode(false);
            } catch (error) {
                if (ignore) return;

                console.error("오늘 루틴 조회 실패:", error);

                setRoutine(null);
                setFormPeriods(cloneDefaultPeriods());
                setIsEditMode(true);
                setMessage("오늘 등록된 루틴이 없습니다. 기본 루틴을 수정해서 저장해주세요.");
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        loadRoutine();

        return () => {
            ignore = true;
        };
    }, [todayDate]);

    function handleChangePeriod(index, field, value) {
        setFormPeriods((prev) =>
            prev.map((period, periodIndex) =>
                periodIndex === index
                    ? {
                        ...period,
                        [field]: value,
                    }
                    : period
            )
        );
    }

    function handleAddPeriod() {
        setFormPeriods((prev) => {
            const sortedPeriods = sortPeriodsByTime(prev);
            const lastPeriod = sortedPeriods[sortedPeriods.length - 1];

            const nextStartTime = lastPeriod?.endTime ?? "06:00:00";
            const nextEndTime = addMinutesToTime(nextStartTime, 50);

            return [
                ...prev,
                {
                    label: `새 구간 ${prev.length + 1}`,
                    startTime: nextStartTime,
                    endTime: nextEndTime,
                    taskContent: "",
                    sortOrder: prev.length + 1,
                    type: "STUDY",
                },
            ];
        });
    }

    function handleRemovePeriod(index) {
        if (formPeriods.length <= 1) {
            alert("루틴 구간은 최소 1개 이상이어야 합니다.");
            return;
        }

        setFormPeriods((prev) => prev.filter((_, periodIndex) => periodIndex !== index));
    }

    function handleLoadDefaultPeriods() {
        const confirmed = window.confirm(
            "현재 입력 중인 루틴을 기본 루틴으로 바꿀까요?"
        );

        if (!confirmed) return;

        setFormPeriods(cloneDefaultPeriods());
    }

    function handleSortPeriods() {
        setFormPeriods((prev) =>
            sortPeriodsByTime(prev).map((period, index) => ({
                ...period,
                sortOrder: index + 1,
            }))
        );
    }

    function handleStartEdit() {
        if (routine?.periods?.length) {
            setFormPeriods(toFormPeriods(routine.periods));
        } else {
            setFormPeriods(cloneDefaultPeriods());
        }

        setIsEditMode(true);
    }

    function handleCancelEdit() {
        if (!routine) {
            navigate("/");
            return;
        }

        setFormPeriods(toFormPeriods(routine.periods));
        setIsEditMode(false);
    }

    async function handleSaveRoutine() {
        const payloadPeriods = buildSavePayloadPeriods(formPeriods);
        const validationMessage = validatePeriods(payloadPeriods);

        if (validationMessage) {
            alert(validationMessage);
            return;
        }

        try {
            setSaving(true);
            setMessage("");

            const savedRoutine = await saveDailyRoutine({
                routineDate: todayDate,
                periods: payloadPeriods,
            });

            setRoutine(savedRoutine);
            setFormPeriods(toFormPeriods(savedRoutine.periods));
            setIsEditMode(false);
            setMessage("오늘 루틴이 저장되었습니다.");
        } catch (error) {
            console.error("오늘 루틴 저장 실패:", error);
            alert(getApiErrorMessage(error, "오늘 루틴 저장에 실패했습니다."));
        } finally {
            setSaving(false);
        }
    }

    async function handleCompleteCurrentPeriod() {
        if (!currentPeriod?.periodId) {
            alert("저장된 루틴 구간만 완료 처리할 수 있습니다.");
            return;
        }

        try {
            setSubmittingStatus(true);

            const updatedRoutine = await completeRoutinePeriod(currentPeriod.periodId);

            setRoutine(updatedRoutine);
            setFormPeriods(toFormPeriods(updatedRoutine.periods));
        } catch (error) {
            console.error("루틴 완료 처리 실패:", error);
            alert(getApiErrorMessage(error, "루틴 완료 처리에 실패했습니다."));
        } finally {
            setSubmittingStatus(false);
        }
    }

    async function handleTogglePeriodCompleted(period) {
        if (!period?.periodId) {
            alert("저장된 루틴 구간만 상태를 변경할 수 있습니다.");
            return;
        }

        try {
            setSubmittingStatus(true);

            const updatedRoutine =
                period.status === "COMPLETED"
                    ? await resetRoutinePeriod(period.periodId)
                    : await completeRoutinePeriod(period.periodId);

            setRoutine(updatedRoutine);
            setFormPeriods(toFormPeriods(updatedRoutine.periods));
        } catch (error) {
            console.error("루틴 상태 변경 실패:", error);
            alert(getApiErrorMessage(error, "루틴 상태 변경에 실패했습니다."));
        } finally {
            setSubmittingStatus(false);
        }
    }

    async function handleSkipCurrentPeriod() {
        if (!currentPeriod?.periodId) {
            alert("저장된 루틴 구간만 건너뜀 처리할 수 있습니다.");
            return;
        }

        try {
            setSubmittingStatus(true);

            const updatedRoutine = await skipRoutinePeriod(currentPeriod.periodId);

            setRoutine(updatedRoutine);
            setFormPeriods(toFormPeriods(updatedRoutine.periods));
        } catch (error) {
            console.error("루틴 건너뜀 처리 실패:", error);
            alert(getApiErrorMessage(error, "루틴 건너뜀 처리에 실패했습니다."));
        } finally {
            setSubmittingStatus(false);
        }
    }

    if (loading) {
        return (
            <div style={pageStyle}>
                <h1 style={{ margin: 0 }}>오늘 루틴 시계</h1>
                <p style={mutedTextStyle}>오늘 루틴을 불러오는 중입니다...</p>
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
                        오늘 루틴 시계
                    </h1>
                    <p
                        style={{
                            ...mutedTextStyle,
                            marginTop: 6,
                            marginBottom: 0,
                            fontSize: 13,
                        }}
                    >
                        {todayDate} · 현재 시간 기준으로 교시와 할 일을 자동 표시합니다.
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
                        onClick={() => navigate("/")}
                        style={buttonBaseStyle}
                    >
                        홈
                    </button>

                    {!isEditMode && (
                        <button
                            type="button"
                            onClick={handleStartEdit}
                            style={primaryButtonStyle}
                        >
                            루틴 수정
                        </button>
                    )}
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

            {isEditMode ? (
                <section style={cardStyle}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 12,
                            marginBottom: 16,
                            flexWrap: "wrap",
                        }}
                    >
                        <div>
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: 21,
                                    letterSpacing: "-0.04em",
                                }}
                            >
                                오늘 루틴 등록/수정
                            </h2>
                            <p
                                style={{
                                    ...mutedTextStyle,
                                    marginTop: 6,
                                    marginBottom: 0,
                                    fontSize: 13,
                                    lineHeight: 1.5,
                                }}
                            >
                                교시명은 화면 표시용이고, 실제 루틴 판단은 시작 시간과 종료 시간으로 계산합니다.
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
                                onClick={handleLoadDefaultPeriods}
                                style={buttonBaseStyle}
                            >
                                기본값
                            </button>

                            <button
                                type="button"
                                onClick={handleSortPeriods}
                                style={buttonBaseStyle}
                            >
                                시간순 정렬
                            </button>

                            <button
                                type="button"
                                onClick={handleAddPeriod}
                                style={primaryButtonStyle}
                            >
                                + 구간 추가
                            </button>
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                        }}
                    >
                        {formPeriods.map((period, index) => (
                            <div
                                key={`${period.label}-${period.startTime}-${index}`}
                                style={{
                                    ...softCardStyle,
                                    ...getPeriodCardVisualStyle(period, false),
                                    display: "grid",
                                    gridTemplateColumns: "minmax(110px, 0.8fr) 112px 112px 118px minmax(220px, 2fr) auto",                                    gap: 8,
                                    alignItems: "center",
                                }}
                            >
                                <label
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 5,
                                        fontSize: 12,
                                        color: "var(--color-text-muted)",
                                        minWidth: 0,
                                    }}
                                >
                                    구간명
                                    <input
                                        value={period.label}
                                        onChange={(event) =>
                                            handleChangePeriod(index, "label", event.target.value)
                                        }
                                        placeholder="1교시"
                                        style={inputStyle}
                                    />
                                </label>

                                <label
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 5,
                                        fontSize: 12,
                                        color: "var(--color-text-muted)",
                                    }}
                                >
                                    시작
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={toTimeInputValue(period.startTime)}
                                        onChange={(event) =>
                                            handleChangePeriod(index, "startTime", event.target.value)
                                        }
                                        onBlur={(event) =>
                                            handleChangePeriod(
                                                index,
                                                "startTime",
                                                normalizeTimeInputText(event.target.value)
                                            )
                                        }
                                        placeholder="06:00"
                                        style={{
                                            ...inputStyle,
                                            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                                            fontWeight: 800,
                                            letterSpacing: "-0.03em",
                                            textAlign: "center",
                                        }}
                                    />
                                </label>

                                <label
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 5,
                                        fontSize: 12,
                                        color: "var(--color-text-muted)",
                                    }}
                                >
                                    종료
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={toTimeInputValue(period.endTime)}
                                        onChange={(event) =>
                                            handleChangePeriod(index, "endTime", event.target.value)
                                        }
                                        onBlur={(event) =>
                                            handleChangePeriod(
                                                index,
                                                "endTime",
                                                normalizeTimeInputText(event.target.value)
                                            )
                                        }
                                        placeholder="06:50"
                                        style={{
                                            ...inputStyle,
                                            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                                            fontWeight: 800,
                                            letterSpacing: "-0.03em",
                                            textAlign: "center",
                                        }}
                                    />
                                </label>

                                <label
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 5,
                                        fontSize: 12,
                                        color: "var(--color-text-muted)",
                                    }}
                                >
                                    타입
                                    <select
                                        value={period.type}
                                        onChange={(event) =>
                                            handleChangePeriod(index, "type", event.target.value)
                                        }
                                        style={inputStyle}
                                    >
                                        <option value="STUDY">공부</option>
                                        <option value="BREAK">쉬는시간</option>
                                        <option value="ETC">기타</option>
                                    </select>
                                </label>

                                <label
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 5,
                                        fontSize: 12,
                                        color: "var(--color-text-muted)",
                                        minWidth: 0,
                                    }}
                                >
                                    할 일
                                    <textarea
                                        value={period.taskContent}
                                        onChange={(event) =>
                                            handleChangePeriod(index, "taskContent", event.target.value)
                                        }
                                        placeholder="이 시간에 할 일을 적어주세요"
                                        rows={1}
                                        style={textareaStyle}
                                    />
                                </label>

                                <button
                                    type="button"
                                    onClick={() => handleRemovePeriod(index)}
                                    style={{
                                        ...dangerButtonStyle,
                                        alignSelf: "end",
                                        padding: "9px 10px",
                                    }}
                                >
                                    삭제
                                </button>
                            </div>
                        ))}
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: 8,
                            marginTop: 16,
                            flexWrap: "wrap",
                        }}
                    >
                        <button
                            type="button"
                            onClick={handleSaveRoutine}
                            disabled={saving}
                            style={{
                                ...primaryButtonStyle,
                                flex: 1,
                                opacity: saving ? 0.65 : 1,
                                cursor: saving ? "not-allowed" : "pointer",
                            }}
                        >
                            {saving ? "저장 중..." : "오늘 루틴 저장"}
                        </button>

                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={saving}
                            style={buttonBaseStyle}
                        >
                            취소
                        </button>
                    </div>
                </section>
            ) : (
                <>
                    <section
                        style={{
                            minHeight: "min(70vh, 620px)",
                            borderRadius: 24,
                            border: isBreakTime
                                ? "1px solid #e5e7eb"
                                : "1px solid #111827",
                            background: isBreakTime ? "#ffffff" : "#000000",
                            color: isBreakTime ? "#111827" : "#ffffff",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            padding: "clamp(28px, 8vw, 72px) clamp(14px, 5vw, 48px)",
                            boxSizing: "border-box",
                            boxShadow: "0 18px 55px rgba(0, 0, 0, 0.35)",
                        }}
                    >
                        <div
                            style={{
                                color: isBreakTime ? "#111827" : "#facc15",
                                fontSize: "clamp(38px, 11vw, 86px)",
                                fontWeight: 900,
                                lineHeight: 1.05,
                                letterSpacing: "-0.08em",
                                marginBottom: "clamp(20px, 4vw, 28px)",
                            }}
                        >
                            {clockTitle}
                        </div>

                        <div
                            style={{
                                color: isBreakTime ? "#111827" : "#ffffff",
                                fontFamily:
                                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                                fontSize: "clamp(52px, 16vw, 132px)",
                                fontWeight: 900,
                                lineHeight: 1,
                                letterSpacing: "-0.08em",
                                marginBottom: "clamp(28px, 5vw, 46px)",
                            }}
                        >
                            {formatClockTime(clockSeconds)}
                        </div>

                        <div
                            style={{
                                color: isBreakTime ? "#111827" : "#fb7185",
                                fontSize: "clamp(22px, 6vw, 48px)",
                                fontWeight: 800,
                                lineHeight: 1.35,
                                letterSpacing: "-0.06em",
                                maxWidth: 900,
                                wordBreak: "keep-all",
                                overflowWrap: "break-word",
                            }}
                        >
                            {clockTaskText}
                        </div>

                        {currentPeriod && (
                            <div
                                style={{
                                    display: "flex",
                                    gap: 8,
                                    justifyContent: "center",
                                    flexWrap: "wrap",
                                    marginTop: 28,
                                    fontSize: 14,
                                    fontWeight: 800,
                                }}
                            >
                                <span
                                    style={{
                                        border: isBreakTime
                                            ? "1px solid #111827"
                                            : "1px solid #374151",
                                        borderRadius: 999,
                                        padding: "7px 12px",
                                        color: isBreakTime ? "#111827" : "#d1d5db",
                                    }}
                                >
                                    {formatTimeRange(currentPeriod)}
                                </span>

                                <span
                                    style={{
                                        border: isBreakTime
                                            ? "1px solid #111827"
                                            : "1px solid #374151",
                                        borderRadius: 999,
                                        padding: "7px 12px",
                                        color: isBreakTime ? "#111827" : "#d1d5db",
                                    }}
                                >
                                    {getStatusText(currentPeriod.status)}
                                </span>
                            </div>
                        )}

                    </section>

                    <section
                        style={{
                            ...cardStyle,
                            marginTop: 14,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 12,
                                marginBottom: 12,
                            }}
                        >
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: 18,
                                    letterSpacing: "-0.04em",
                                }}
                            >
                                오늘 루틴 목록
                            </h2>

                            <span
                                style={{
                                    ...mutedTextStyle,
                                    fontSize: 13,
                                }}
                            >
                                {orderedPeriods.length}개 구간
                            </span>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                            }}
                        >
                            {orderedPeriods.map((period) => {
                                const active = isSamePeriod(period, currentPeriod);

                                return (
                                    <div
                                        key={period.periodId ?? `${period.label}-${period.startTime}`}
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "88px 116px minmax(0, 1fr) auto",
                                            gap: 8,
                                            alignItems: "center",
                                            border: "1px solid var(--color-border)",
                                            borderRadius: 12,
                                            padding: "10px 12px",
                                            ...getPeriodCardVisualStyle(period, active),
                                        }}
                                    >
                                        <strong
                                            style={{
                                                color: active
                                                    ? "var(--color-primary)"
                                                    : "var(--color-text)",
                                                fontSize: 14,
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {period.label}
                                        </strong>

                                        <span
                                            style={{
                                                ...mutedTextStyle,
                                                fontSize: 13,
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {formatTimeRange(period)}
                                        </span>

                                        <span
                                            style={{
                                                fontSize: 14,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {period.taskContent || "할 일 없음"}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => handleTogglePeriodCompleted(period)}
                                            disabled={submittingStatus}
                                            style={{
                                                ...getPeriodStatusButtonStyle(period),
                                                opacity: submittingStatus ? 0.65 : 1,
                                                cursor: submittingStatus ? "not-allowed" : "pointer",
                                            }}
                                        >
                                            {period.status === "COMPLETED" ? "완료" : "대기"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}