import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
        taskContent: "기상, 계획등록",
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
        label: "1교시 쉬는시간",
        startTime: "06:50:00",
        endTime: "07:00:00",
        taskContent: "쉬기, 다음 교시 준비",
        sortOrder: 3,
        type: "BREAK",
    },
    {
        label: "2교시",
        startTime: "07:00:00",
        endTime: "07:50:00",
        taskContent: "",
        sortOrder: 4,
        type: "STUDY",
    },
    {
        label: "2교시 쉬는시간",
        startTime: "07:50:00",
        endTime: "08:00:00",
        taskContent: "쉬기, 다음 교시 준비",
        sortOrder: 5,
        type: "BREAK",
    },
    {
        label: "3교시",
        startTime: "08:00:00",
        endTime: "08:50:00",
        taskContent: "",
        sortOrder: 6,
        type: "STUDY",
    },
    {
        label: "샤워시간",
        startTime: "08:50:00",
        endTime: "09:20:00",
        taskContent: "샤워",
        sortOrder: 7,
        type: "BREAK",
    },
    {
        label: "4교시",
        startTime: "09:20:00",
        endTime: "10:00:00",
        taskContent: "",
        sortOrder: 8,
        type: "STUDY",
    },
    {
        label: "4교시 쉬는시간",
        startTime: "10:00:00",
        endTime: "10:10:00",
        taskContent: "쉬기, 다음 교시 준비",
        sortOrder: 9,
        type: "BREAK",
    },
    {
        label: "5교시",
        startTime: "10:10:00",
        endTime: "11:00:00",
        taskContent: "",
        sortOrder: 10,
        type: "STUDY",
    },
    {
        label: "5교시 쉬는시간",
        startTime: "11:00:00",
        endTime: "11:10:00",
        taskContent: "쉬기, 다음 교시 준비",
        sortOrder: 11,
        type: "BREAK",
    },
    {
        label: "6교시",
        startTime: "11:10:00",
        endTime: "12:00:00",
        taskContent: "",
        sortOrder: 12,
        type: "STUDY",
    },
    {
        label: "점심 쉬는 시간",
        startTime: "12:00:00",
        endTime: "15:00:00",
        taskContent: "3시간 빡 쉬기!",
        sortOrder: 13,
        type: "BREAK",
    },
    {
        label: "야자 1교시",
        startTime: "15:00:00",
        endTime: "16:00:00",
        taskContent: "",
        sortOrder: 14,
        type: "STUDY",
    },
    {
        label: "야자 2교시",
        startTime: "16:00:00",
        endTime: "17:00:00",
        taskContent: "",
        sortOrder: 15,
        type: "STUDY",
    },
    {
        label: "야자 3교시",
        startTime: "17:00:00",
        endTime: "18:00:00",
        taskContent: "",
        sortOrder: 16,
        type: "STUDY",
    },
    {
        label: "야자 4교시",
        startTime: "18:00:00",
        endTime: "19:00:00",
        taskContent: "",
        sortOrder: 17,
        type: "STUDY",
    },
    {
        label: "야자 5교시",
        startTime: "19:00:00",
        endTime: "20:00:00",
        taskContent: "",
        sortOrder: 18,
        type: "STUDY",
    },
    {
        label: "야자 6교시",
        startTime: "20:00:00",
        endTime: "21:00:00",
        taskContent: "",
        sortOrder: 19,
        type: "STUDY",
    },
    {
        label: "저녁 쉬는 시간",
        startTime: "21:00:00",
        endTime: "22:30:00",
        taskContent: "집 도착, 1시간쯤 빡 쉬기!",
        sortOrder: 20,
        type: "BREAK",
    },
];

const CLOCK_FONT_FAMILY =
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

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

function getTaskTextareaStyle(period) {
    const isStudy = period?.type === "STUDY";

    return {
        ...textareaStyle,
        background: isStudy
            ? "rgba(245, 158, 11, 0.12)"
            : "var(--color-bg)",
        border: isStudy
            ? "1px solid rgba(245, 158, 11, 0.75)"
            : "1px solid var(--color-border)",
        color: isStudy
            ? "#fff7ed"
            : "var(--color-text)",
        fontWeight: isStudy ? 800 : 500,
        boxShadow: isStudy
            ? "inset 0 0 0 1px rgba(245, 158, 11, 0.15)"
            : "none",
        caretColor: isStudy
            ? "var(--color-primary)"
            : "auto",
    };
}

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
function isTaskTargetPeriod(period) {
    return period?.type !== "BREAK";
}

function getPeriodTaskLabel(period) {
    const task = period?.taskContent?.trim();

    if (!task) {
        return `${period?.label ?? "루틴"} 할 일 없음`;
    }

    return task;
}

function getPeriodIdentity(period) {
    if (!period) return "";

    return period.periodId
        ? `id:${period.periodId}`
        : `${period.label}-${period.startTime}-${period.endTime}`;
}

function getPreviousUncompletedTaskPeriods(periods = [], currentPeriod, now = new Date()) {
    const sortedPeriods = sortPeriodsByTime(periods);

    const currentIndex = currentPeriod
        ? sortedPeriods.findIndex(
            (period) => getPeriodIdentity(period) === getPeriodIdentity(currentPeriod)
        )
        : -1;

    return sortedPeriods.filter((period, index) => {
        if (!isTaskTargetPeriod(period)) {
            return false;
        }

        if (period.status === "COMPLETED") {
            return false;
        }

        if (currentIndex >= 0) {
            return index < currentIndex;
        }

        const end = parseTodayTime(period.endTime, now);

        return end <= now;
    });
}

function buildClockTaskLines({
                                 previousUncompletedPeriods,
                                 currentPeriod,
                                 nextPeriod,
                             }) {
    const lines = previousUncompletedPeriods.map((period) => ({
        key: getPeriodIdentity(period),
        text: getPeriodTaskLabel(period),
    }));

    if (currentPeriod) {
        const isCurrentTaskTarget = isTaskTargetPeriod(currentPeriod);

        if (isCurrentTaskTarget) {
            if (currentPeriod.status !== "COMPLETED") {
                lines.push({
                    key: getPeriodIdentity(currentPeriod),
                    text: getPeriodTaskLabel(currentPeriod),
                });
            }

            if (lines.length > 0) {
                return lines;
            }

            return [
                {
                    key: "current-completed",
                    text: "현재 구간의 할 일을 완료했습니다.",
                },
            ];
        }

        if (lines.length > 0) {
            return lines;
        }

        return [
            {
                key: getPeriodIdentity(currentPeriod),
                text: getPeriodTaskLabel(currentPeriod),
            },
        ];
    }

    if (nextPeriod) {
        lines.push({
            key: getPeriodIdentity(nextPeriod),
            text: `${nextPeriod.label} · ${formatTimeRange(nextPeriod)} · ${getPeriodTaskLabel(nextPeriod)}`,
        });

        return lines;
    }

    if (lines.length > 0) {
        return lines;
    }

    return [
        {
            key: "done",
            text: "오늘 등록된 모든 루틴 시간이 끝났습니다.",
        },
    ];
}

function getAutoFitMaxFontSize(lineCount, isClockFullscreen) {
    if (lineCount <= 1) {
        return isClockFullscreen ? 42 : 48;
    }

    if (lineCount === 2) {
        return isClockFullscreen ? 32 : 34;
    }

    if (lineCount === 3) {
        return isClockFullscreen ? 26 : 28;
    }

    if (lineCount === 4) {
        return isClockFullscreen ? 22 : 24;
    }

    return isClockFullscreen ? 18 : 20;
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

function AutoFitTodoLines({
                              lines,
                              color,
                              isClockFullscreen,
                          }) {
    const containerRef = useRef(null);
    const contentRef = useRef(null);

    const maxFontSize = getAutoFitMaxFontSize(
        lines.length,
        isClockFullscreen
    );

    const minFontSize = isClockFullscreen ? 13 : 14;

    const [fontSize, setFontSize] = useState(maxFontSize);

    useLayoutEffect(() => {
        function resizeText() {
            const container = containerRef.current;
            const content = contentRef.current;

            if (!container || !content) return;

            let nextFontSize = maxFontSize;

            content.style.fontSize = `${nextFontSize}px`;

            while (
                (content.scrollWidth > container.clientWidth ||
                    content.scrollHeight > container.clientHeight) &&
                nextFontSize > minFontSize
                ) {
                nextFontSize -= 1;
                content.style.fontSize = `${nextFontSize}px`;
            }

            setFontSize(nextFontSize);
        }

        resizeText();

        const resizeObserver = new ResizeObserver(resizeText);

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        window.addEventListener("resize", resizeText);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", resizeText);
        };
    }, [lines, maxFontSize, minFontSize]);

    if (!lines.length) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                maxWidth: "100%",
                maxHeight: isClockFullscreen ? "34dvh" : "24dvh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
            }}
        >
            {lines.length === 1 ? (
                <div
                    ref={contentRef}
                    style={{
                        width: "100%",
                        color,
                        fontSize,
                        fontWeight: 900,
                        lineHeight: 1.25,
                        letterSpacing: "-0.06em",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                    }}
                >
                    {lines[0].text}
                </div>
            ) : (
                <ol
                    ref={contentRef}
                    style={{
                        width: "max-content",
                        maxWidth: "100%",
                        margin: 0,
                        paddingLeft: 0,
                        color,
                        fontSize,
                        fontWeight: 900,
                        lineHeight: 1.35,
                        letterSpacing: "-0.05em",
                        textAlign: "left",
                        listStylePosition: "inside",
                    }}
                >
                    {lines.map((line) => (
                        <li
                            key={line.key}
                            style={{
                                whiteSpace: "nowrap",
                            }}
                        >
                            {line.text}
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
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

    const [isClockFullscreen, setIsClockFullscreen] = useState(false);

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

    const previousUncompletedTaskPeriods = useMemo(
        () => getPreviousUncompletedTaskPeriods(orderedPeriods, currentPeriod, now),
        [orderedPeriods, currentPeriod, now]
    );

    const clockTaskLines = useMemo(
        () =>
            buildClockTaskLines({
                previousUncompletedPeriods: previousUncompletedTaskPeriods,
                currentPeriod,
                nextPeriod,
            }),
        [previousUncompletedTaskPeriods, currentPeriod, nextPeriod]
    );

    const isBreakTime = currentPeriod?.type === "BREAK";

    const clockTitle = useMemo(() => {
        if (currentPeriod) {
            return currentPeriod.label;
        }

        if (nextPeriod) {
            return "다음 루틴 대기";
        }

        return "오늘 루틴 종료";
    }, [currentPeriod, nextPeriod]);

    const clockSeconds = useMemo(() => {
        if (currentPeriod) {
            return getElapsedSeconds(currentPeriod, now);
        }

        if (nextPeriod) {
            return getRemainingSecondsUntilPeriod(nextPeriod, now);
        }

        return 0;
    }, [currentPeriod, nextPeriod, now]);

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

    function handleBackToRoutineClock() {
        if (!routine) {
            alert("아직 저장된 오늘 루틴이 없습니다. 먼저 오늘 루틴을 저장해주세요.");
            return;
        }

        setFormPeriods(toFormPeriods(routine.periods));
        setIsEditMode(false);
        setMessage("");
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
            setNow(new Date());
        } catch (error) {
            console.error("루틴 상태 변경 실패:", error);
            alert(getApiErrorMessage(error, "루틴 상태 변경에 실패했습니다."));
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
                        {todayDate} · 현재 시간 기준
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
                    {isEditMode ? (
                        <button
                            type="button"
                            onClick={handleBackToRoutineClock}
                            disabled={!routine}
                            style={{
                                ...buttonBaseStyle,
                                opacity: !routine ? 0.65 : 1,
                                cursor: !routine ? "not-allowed" : "pointer",
                            }}
                        >
                            오늘루틴 돌아가기
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => navigate("/")}
                                style={buttonBaseStyle}
                            >
                                홈
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/mentor/plans")}
                                style={buttonBaseStyle}
                            >
                                🗓️장기계획
                            </button>
                        </>
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
                                        style={getTaskTextareaStyle(period)}
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
                            onClick={handleBackToRoutineClock}
                            disabled={saving || !routine}
                            style={{
                                ...buttonBaseStyle,
                                opacity: saving || !routine ? 0.65 : 1,
                                cursor: saving || !routine ? "not-allowed" : "pointer",
                            }}
                        >
                            오늘루틴 돌아가기
                        </button>
                    </div>
                </section>
            ) : (
                <>
                    <section
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                            if (!isClockFullscreen) {
                                setIsClockFullscreen(true);
                            }
                        }}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();

                                if (!isClockFullscreen) {
                                    setIsClockFullscreen(true);
                                }
                            }
                        }}
                        style={{
                            position: isClockFullscreen ? "fixed" : "relative",
                            inset: isClockFullscreen ? 0 : "auto",
                            zIndex: isClockFullscreen ? 9999 : "auto",
                            width: isClockFullscreen ? "100vw" : "100%",
                            minHeight: isClockFullscreen ? "100dvh" : "min(70vh, 620px)",
                            height: isClockFullscreen ? "100dvh" : "auto",
                            borderRadius: isClockFullscreen ? 0 : 24,
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
                            padding: isClockFullscreen
                                ? "calc(env(safe-area-inset-top) + 14px) calc(env(safe-area-inset-right) + 14px) calc(env(safe-area-inset-bottom) + 14px) calc(env(safe-area-inset-left) + 14px)"
                                : "clamp(28px, 8vw, 72px) clamp(14px, 5vw, 48px)",
                            boxSizing: "border-box",
                            boxShadow: isClockFullscreen
                                ? "none"
                                : "0 18px 55px rgba(0, 0, 0, 0.35)",
                            cursor: isClockFullscreen ? "default" : "pointer",
                        }}
                    >
                        {isClockFullscreen && (
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setIsClockFullscreen(false);
                                }}
                                style={{
                                    position: "absolute",
                                    top: "calc(env(safe-area-inset-top) + 12px)",
                                    right: "calc(env(safe-area-inset-right) + 12px)",
                                    border: isBreakTime ? "1px solid #111827" : "1px solid #374151",
                                    background: isBreakTime ? "#ffffff" : "#111827",
                                    color: isBreakTime ? "#111827" : "#ffffff",
                                    borderRadius: 999,
                                    padding: "9px 13px",
                                    fontSize: 13,
                                    fontWeight: 900,
                                    cursor: "pointer",
                                }}
                            >
                                닫기
                            </button>
                        )}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "clamp(8px, 2vw, 16px)",
                                marginBottom: isClockFullscreen
                                    ? "clamp(10px, 2vw, 18px)"
                                    : "clamp(20px, 4vw, 28px)",
                                marginLeft: isClockFullscreen
                                    ? 80
                                    : 0,
                                maxWidth: "100%",
                                flexWrap: "wrap",
                            }}
                        >
                            <div
                                style={{
                                    color: isBreakTime ? "#111827" : "#facc15",
                                    fontSize: isClockFullscreen
                                        ? "clamp(28px, 7vw, 60px)"
                                        : "clamp(38px, 11vw, 86px)",
                                    fontWeight: 900,
                                    lineHeight: 1.05,
                                    letterSpacing: "-0.08em",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {clockTitle}
                            </div>

                            {currentPeriod && (
                                <span
                                    style={{
                                        border: isBreakTime
                                            ? "1px solid #111827"
                                            : "1px solid #374151",
                                        borderRadius: 999,
                                        padding: "7px 12px",
                                        color: isBreakTime ? "#111827" : "#d1d5db",
                                        fontSize: isClockFullscreen ? 12 : 14,
                                        fontWeight: 800,
                                        whiteSpace: "nowrap",
                                        letterSpacing: "-0.02em",
                                    }}
                                >
                                    {formatTimeRange(currentPeriod)}
                                </span>
                            )}
                        </div>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "clamp(10px, 2vw, 18px)",
                                marginBottom: isClockFullscreen
                                    ? "clamp(14px, 3vw, 26px)"
                                    : "clamp(28px, 5vw, 46px)",
                                maxWidth: "100%",
                            }}
                        >
                            <div
                                style={{
                                    color: isBreakTime ? "#111827" : "#ffffff",
                                    fontFamily: CLOCK_FONT_FAMILY,
                                    fontSize: isClockFullscreen
                                        ? "clamp(42px, 12vw, 92px)"
                                        : "clamp(52px, 16vw, 132px)",
                                    fontWeight: 900,
                                    lineHeight: 1,
                                    letterSpacing: "-0.08em",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {formatClockTime(clockSeconds)}
                            </div>
                        </div>

                        <AutoFitTodoLines
                            lines={clockTaskLines}
                            color={isBreakTime ? "#111827" : "#fb7185"}
                            isClockFullscreen={isClockFullscreen}
                        />

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
                                flexWrap: "wrap",
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

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    flexWrap: "wrap",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <span
                                    style={{
                                        ...mutedTextStyle,
                                        fontSize: 13,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {orderedPeriods.length}개 구간
                                </span>

                                <button
                                    type="button"
                                    onClick={handleStartEdit}
                                    style={{
                                        ...buttonBaseStyle,
                                        padding: "7px 10px",
                                        fontSize: 12,
                                        borderRadius: 999,
                                    }}
                                >
                                    ✏️ 루틴 수정
                                </button>
                            </div>
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

                                        {period.type !== "BREAK" ? (
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
                                        ) : (
                                            <span
                                                aria-hidden="true"
                                                style={{
                                                    width: 52,
                                                    height: 30,
                                                }}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate("/mentor/daily-review")}
                            style={{
                                ...primaryButtonStyle,
                                width: "100%",
                                marginTop: 16,
                                padding: "13px 14px",
                                fontSize: 15,
                            }}
                        >
                            하루 마무리하고 AI 피드백 받기
                        </button>
                    </section>
                </>
            )}
        </div>
    );
}