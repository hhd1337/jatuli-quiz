import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

import Lottie from "lottie-react";
import successLottie from "../../assets/lottie/success1.json";
// import successLottie from "../../assets/lottie/success2.json";

import {
    useLocation,
    useNavigate,
    useOutletContext,
    useSearchParams,
} from "react-router-dom";

import { getFolderPractice } from "../../shared/api/folderApi";
import {
    getBookmarkedPractice,
    getFolderPracticeCursor,
    submitProblemSubmission,
    toggleProblemBookmark,
    updateProblem,
} from "../../shared/api/quizApi";
import FabGroup from "../../features/fab/FabGroup";
import MarkdownContent from "../../shared/components/MarkdownContent";

const TEN_MINUTES_IN_SECONDS = 10 * 60;

const DEFAULT_FOCUS_MINUTES = 5;
const MIN_FOCUS_MINUTES = 1;
const MAX_FOCUS_MINUTES = 10;

const SCRATCHPAD_FOCUS_MINUTES_STORAGE_KEY =
    "jatuli:quiz:scratchpad-focus-minutes:v1";

const SCRATCHPAD_DRAFTS_STORAGE_KEY =
    "jatuli:quiz:scratchpad-drafts:v1";

const SCRATCHPAD_VISIBLE_STORAGE_KEY =
    "jatuli:quiz:scratchpad-visible:v1";

const SCRATCHPAD_MAX_DRAFT_COUNT = 3000;

// 연습장 JSON 데이터 자체가 사용할 수 있는 최대 용량
// 3MiB = 3,145,728 bytes
const SCRATCHPAD_MAX_STORAGE_BYTES = 3 * 1024 * 1024;

const SCRATCHPAD_SAVE_DEBOUNCE_MS = 500;

const UTF8_ENCODER = new TextEncoder();

function getUtf8ByteSize(value) {
    return UTF8_ENCODER.encode(String(value ?? "")).byteLength;
}

function normalizeScratchpadDraft(rawDraft) {
    // 기존 버전에서 문자열로 저장된 답안 호환
    if (typeof rawDraft === "string") {
        if (rawDraft.length === 0) {
            return null;
        }

        return {
            text: rawDraft,
            updatedAt: 0,
        };
    }

    if (
        !rawDraft ||
        typeof rawDraft !== "object" ||
        Array.isArray(rawDraft)
    ) {
        return null;
    }

    const text =
        typeof rawDraft.text === "string"
            ? rawDraft.text
            : String(rawDraft.text ?? "");

    if (text.length === 0) {
        return null;
    }

    const rawUpdatedAt = Number(rawDraft.updatedAt);

    return {
        text,
        updatedAt: Number.isFinite(rawUpdatedAt)
            ? rawUpdatedAt
            : 0,
    };
}

function pruneScratchpadDrafts(drafts) {
    if (
        !drafts ||
        typeof drafts !== "object" ||
        Array.isArray(drafts)
    ) {
        return {};
    }

    const sortedEntries = Object.entries(drafts)
        .map(([problemId, rawDraft]) => {
            return [
                String(problemId),
                normalizeScratchpadDraft(rawDraft),
            ];
        })
        .filter(([, draft]) => draft !== null)
        .sort(([, firstDraft], [, secondDraft]) => {
            return (
                Number(secondDraft.updatedAt) -
                Number(firstDraft.updatedAt)
            );
        })
        .slice(0, SCRATCHPAD_MAX_DRAFT_COUNT);

    const keptEntries = [];

    // 빈 JSON 객체인 {}의 크기
    let totalBytes = getUtf8ByteSize("{}");

    for (const [problemId, draft] of sortedEntries) {
        const serializedEntry =
            `${JSON.stringify(problemId)}:${JSON.stringify(draft)}`;

        const commaBytes =
            keptEntries.length > 0
                ? getUtf8ByteSize(",")
                : 0;

        const entryBytes =
            getUtf8ByteSize(serializedEntry) + commaBytes;

        if (
            totalBytes + entryBytes >
            SCRATCHPAD_MAX_STORAGE_BYTES
        ) {
            break;
        }

        keptEntries.push([problemId, draft]);
        totalBytes += entryBytes;
    }

    return Object.fromEntries(keptEntries);
}

function readScratchpadDrafts() {
    if (typeof window === "undefined") {
        return {};
    }

    try {
        const savedValue = window.localStorage.getItem(
            SCRATCHPAD_DRAFTS_STORAGE_KEY
        );

        if (!savedValue) {
            return {};
        }

        const parsedValue = JSON.parse(savedValue);

        if (
            !parsedValue ||
            typeof parsedValue !== "object" ||
            Array.isArray(parsedValue)
        ) {
            return {};
        }

        return pruneScratchpadDrafts(parsedValue);
    } catch (error) {
        console.warn("연습장 임시 답안 복원 실패:", error);
        return {};
    }
}

function readScratchpadVisible() {
    if (typeof window === "undefined") {
        return true;
    }

    const savedValue = window.localStorage.getItem(
        SCRATCHPAD_VISIBLE_STORAGE_KEY
    );

    if (savedValue === null) {
        return true;
    }

    return savedValue === "true";
}

function readScratchpadFocusMinutes() {
    if (typeof window === "undefined") {
        return DEFAULT_FOCUS_MINUTES;
    }

    const savedValue = window.localStorage.getItem(
        SCRATCHPAD_FOCUS_MINUTES_STORAGE_KEY
    );

    const parsedMinutes = Number(savedValue);

    if (!Number.isInteger(parsedMinutes)) {
        return DEFAULT_FOCUS_MINUTES;
    }

    if (
        parsedMinutes < MIN_FOCUS_MINUTES ||
        parsedMinutes > MAX_FOCUS_MINUTES
    ) {
        return DEFAULT_FOCUS_MINUTES;
    }

    return parsedMinutes;
}

function formatCountdown(totalSeconds) {
    const safeSeconds = Math.max(
        0,
        Math.floor(Number(totalSeconds) || 0)
    );

    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0"
    )}`;
}

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

const scratchpadCardStyle = {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid var(--color-border, #374151)",
    background: "var(--color-surface, #1f2937)",
    color: "var(--color-text, #f9fafb)",
    borderRadius: 12,
    padding: 11,
    marginBottom: 20,
};

const scratchpadTextareaStyle = {
    width: "100%",
    minHeight: 240,
    boxSizing: "border-box",
    padding: 10,
    marginTop: 4,
    border: "1px solid var(--color-border, #374151)",
    borderRadius: 8,
    background: "var(--color-bg, #111827)",
    color: "var(--color-text, #f9fafb)",
    fontSize: 15,
    lineHeight: 1.6,
    resize: "vertical",
    outline: "none",
};

const focusProgressTrackStyle = {
    width: "100%",
    height: 12,
    overflow: "hidden",
    borderRadius: 999,
    background: "rgba(127, 29, 29, 0.3)",
    border: "1px solid rgba(248, 113, 113, 0.45)",
};

const focusEndModalOverlayStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 1500,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.68)",
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

const editingProblemCardStyle = {
    ...answerCardStyle,
    background: "rgba(30, 58, 138, 0.24)",
    borderColor: "#3b82f6",
    boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.1)",
};

const editableRawTextBaseStyle = {
    display: "block",
    width: "100%",
    boxSizing: "border-box",

    margin: 0,
    padding: 0,

    border: "none",
    borderRadius: 0,
    outline: "none",

    background: "transparent",
    color: "var(--color-text, #f9fafb)",
    caretColor: "#60a5fa",

    fontFamily: "inherit",
    resize: "none",
    overflow: "hidden",

    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
    overflowWrap: "anywhere",
};

const editableQuestionTextStyle = {
    ...editableRawTextBaseStyle,
    ...questionTextStyle,
};

const editableExplanationTextStyle = {
    ...editableRawTextBaseStyle,
    ...explanationTextStyle,
};

const editableAnswerTextStyle = {
    ...editableRawTextBaseStyle,
    ...answerTextStyle,
};

const editProblemIconButtonStyle = {
    position: "absolute",
    top: 1,
    right: 1,

    width: 40,
    height: 40,

    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",

    padding: 0,
    border: "none",
    borderRadius: 8,

    background: "transparent",
    color: "var(--color-text-muted, #9ca3af)",

    cursor: "pointer",
    zIndex: 1,
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

const NEXT_SPLASH_DURATION_MS = 3200;

const nextSplashOverlayStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 2000,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(2px)",
    pointerEvents: "auto",
};

const nextSplashCardStyle = {
    width: 300,
    minHeight: 200,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
    border: "1px solid var(--color-border, #374151)",
    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.35)",
};

const nextSplashTextStyle = {
    marginTop: 8,
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text, #f9fafb)",
};

function getButtonStyle(disabled = false, size = "normal") {
    const isSmall = size === "small";

    return {
        border: "1px solid var(--color-border, #374151)",
        background: disabled
            ? "var(--color-button-disabled-bg, #1f2937)"
            : "var(--color-button-bg, #374151)",
        color: disabled
            ? "var(--color-button-disabled-text, #6b7280)"
            : "var(--color-button-text, #f9fafb)",
        padding: isSmall ? "6px 8px" : "6px 10px",
        borderRadius: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.65 : 1,
        minWidth: isSmall ? 45 : 80,
        width: "auto",
        height: 35,
        fontSize: isSmall ? 13 : 14,
        whiteSpace: "nowrap",
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

function stripMarkdownForSpeech(value) {
    return String(value ?? "")
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/```[\s\S]*?```/g, "")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/[#>*_~\-]/g, "")
        .replace(/\n{2,}/g, "\n")
        .trim();
}

function buildAnswerSpeechText(problem) {
    const explanation = stripMarkdownForSpeech(problem?.explanationText);
    const answer = stripMarkdownForSpeech(problem?.answerText);

    const parts = [];

    if (explanation) {
        parts.push(`해설입니다. ${explanation}`);
    }

    if (answer) {
        parts.push(`정답입니다. ${answer}`);
    }

    return parts.join("\n\n");
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

function AutoResizeTextarea({
                                value,
                                onValueChange,
                                style,
                                ariaLabel,
                            }) {
    const textareaRef = useRef(null);

    useLayoutEffect(() => {
        const textarea = textareaRef.current;

        if (!textarea) {
            return;
        }

        /*
         * 기존 높이를 먼저 제거한 뒤 scrollHeight를 적용한다.
         *
         * 내용이 길어질 때뿐 아니라 내용을 지웠을 때도
         * 높이가 자연스럽게 다시 줄어든다.
         */
        textarea.style.height = "0px";
        textarea.style.height = `${textarea.scrollHeight}px`;
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            data-prevent-answer-toggle
            rows={1}
            value={value}
            aria-label={ariaLabel}
            onChange={(event) =>
                onValueChange(event.target.value)
            }
            style={style}
        />
    );
}

export default function QuizPlayPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const {
        isMusicOn,
        toggleMusic,
        duckBackgroundAudio,
        restoreBackgroundAudio,
    } = useOutletContext();

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

    const [localProblems, setLocalProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [titlePath, setTitlePath] = useState(initialTitlePath);
    const [showCompleteScreen, setShowCompleteScreen] = useState(false);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    const [isScratchpadVisible, setIsScratchpadVisible] = useState(
        readScratchpadVisible
    );

    const [scratchpadDrafts, setScratchpadDrafts] = useState(
        readScratchpadDrafts
    );

    const [focusDurationMinutes, setFocusDurationMinutes] = useState(
        readScratchpadFocusMinutes
    );

    const focusDurationSeconds = focusDurationMinutes * 60;

    const [isFocusActive, setIsFocusActive] = useState(false);
    const [focusEndsAt, setFocusEndsAt] = useState(null);
    const [focusRemainingSeconds, setFocusRemainingSeconds] = useState(
        DEFAULT_FOCUS_MINUTES * 60
    );

    const [focusEndModalOpen, setFocusEndModalOpen] = useState(false);

    const [nextSplashOpen, setNextSplashOpen] = useState(false);
    const [splashMessage, setSplashMessage] = useState("좋아요!");
    const nextSplashTimerRef = useRef(null);

    const [isSpeaking, setIsSpeaking] = useState(false);
    const speechSessionIdRef = useRef(0);

    const [questionStartedAt, setQuestionStartedAt] = useState(Date.now());
    const [submitting, setSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState("");
    const [submittedProblemIds, setSubmittedProblemIds] = useState(() => new Set());

    const [bookmarkSubmitting, setBookmarkSubmitting] = useState(false);
    const [bookmarkError, setBookmarkError] = useState("");

    const [isProblemEditing, setIsProblemEditing] = useState(false);

    const [problemEditForm, setProblemEditForm] = useState({
        questionText: "",
        explanationText: "",
        answerText: "",
    });

    const [problemEditSubmitting, setProblemEditSubmitting] =
        useState(false);

    const [problemEditError, setProblemEditError] = useState("");

    const [timeAdjustModal, setTimeAdjustModal] = useState({
        open: false,
        elapsedSeconds: 0,
        minutes: "0",
        seconds: "0",
    });
    const [timeAdjustError, setTimeAdjustError] = useState("");

    const stopAnswerSpeech = useCallback(() => {
        // 이전 음성 세션의 이벤트를 무효화한다.
        speechSessionIdRef.current += 1;

        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }

        setIsSpeaking(false);
        restoreBackgroundAudio();
    }, [restoreBackgroundAudio]);

    const problems = localProblems;

    const currentProblemId = problems[currentIndex]?.problemId;

    const currentScratchpadDraft =
        currentProblemId == null
            ? ""
            : scratchpadDrafts[String(currentProblemId)]?.text ?? "";

    const resetFocusSession = () => {
        setIsFocusActive(false);
        setFocusEndsAt(null);
        setFocusRemainingSeconds(focusDurationSeconds);
        setFocusEndModalOpen(false);
    };

    const resolveFolderStartIndex = async (targetFolderId, fetchedProblems) => {
        if (!targetFolderId || fetchedProblems.length === 0) {
            return 0;
        }

        try {
            const cursor = await getFolderPracticeCursor(targetFolderId);

            if (!cursor.hasCursor) {
                return 0;
            }

            const safeCursorIndex = Math.min(
                Math.max(Number(cursor.nextProblemIndex) || 0, 0),
                fetchedProblems.length - 1
            );

            const shouldContinue = window.confirm(
                `${cursor.nextProblemNumber}번 문제부터 이어서 풀까요?\n\n확인: 이어서 풀기\n취소: 처음부터 풀기`
            );

            return shouldContinue ? safeCursorIndex : 0;
        } catch (cursorError) {
            console.warn("폴더별 커서 조회 실패:", cursorError);
            return 0;
        }
    };

    const getSubmissionContext = () => {
        if (isBookmarkMode) {
            return {
                practiceMode: "BOOKMARKED",
            };
        }

        if (isFolderPracticeMode) {
            return {
                practiceMode: "FOLDER",
                folderId: Number(folderId),
            };
        }

        return {};
    };

    useEffect(() => {
        try {
            window.localStorage.setItem(
                SCRATCHPAD_FOCUS_MINUTES_STORAGE_KEY,
                String(focusDurationMinutes)
            );
        } catch (error) {
            console.warn("집중 시간 설정 저장 실패:", error);
        }
    }, [focusDurationMinutes]);

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
                setBookmarkError("");
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
                    const startIndex = await resolveFolderStartIndex(folderId, fetchedProblems);

                    if (ignore) return;

                    setLocalProblems(fetchedProblems);
                    setCurrentIndex(startIndex);
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

                const fetchedProblems = data.problems ?? [];

                let startIndex = 0;

                try {
                    const cursor = await getFolderPracticeCursor(folderId);

                    if (!ignore && cursor.hasCursor && fetchedProblems.length > 0) {
                        const safeCursorIndex = Math.min(
                            Math.max(Number(cursor.nextProblemIndex) || 0, 0),
                            fetchedProblems.length - 1
                        );

                        const shouldContinue = window.confirm(
                            `${cursor.nextProblemNumber}번 문제부터 이어서 풀까요?\n\n확인: 이어서 풀기\n취소: 처음부터 풀기`
                        );

                        if (shouldContinue) {
                            startIndex = safeCursorIndex;
                        }
                    }
                } catch (cursorError) {
                    console.warn("폴더별 커서 조회 실패:", cursorError);
                }

                setLocalProblems(fetchedProblems);
                setCurrentIndex(startIndex);
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
            setBookmarkError("");
            setTimeAdjustError("");
            setProblemEditError("");
            setIsProblemEditing(false);
            setProblemEditSubmitting(false);

            stopAnswerSpeech();
        }
    }, [
        currentIndex,
        loading,
        problems.length,
        showCompleteScreen,
        stopAnswerSpeech,
    ]);

    useEffect(() => {
        return () => {
            stopAnswerSpeech();
        };
    }, [stopAnswerSpeech]);

    useEffect(() => {
        return () => {
            if (nextSplashTimerRef.current) {
                clearTimeout(nextSplashTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        try {
            window.localStorage.setItem(
                SCRATCHPAD_VISIBLE_STORAGE_KEY,
                String(isScratchpadVisible)
            );
        } catch (error) {
            console.warn("연습장 표시 상태 저장 실패:", error);
        }
    }, [isScratchpadVisible]);

    useEffect(() => {
        const saveTimer = window.setTimeout(() => {
            try {
                const prunedDrafts =
                    pruneScratchpadDrafts(scratchpadDrafts);

                const currentSerialized =
                    JSON.stringify(scratchpadDrafts);

                const prunedSerialized =
                    JSON.stringify(prunedDrafts);

                window.localStorage.setItem(
                    SCRATCHPAD_DRAFTS_STORAGE_KEY,
                    prunedSerialized
                );

                // 개수 또는 용량 제한으로 제거된 답안이 있다면
                // React 상태도 실제 저장 결과와 동일하게 맞춘다.
                if (currentSerialized !== prunedSerialized) {
                    setScratchpadDrafts(prunedDrafts);
                }
            } catch (error) {
                console.warn("연습장 임시 답안 저장 실패:", error);
            }
        }, SCRATCHPAD_SAVE_DEBOUNCE_MS);

        return () => {
            window.clearTimeout(saveTimer);
        };
    }, [scratchpadDrafts]);

    useEffect(() => {
        resetFocusSession();
    }, [currentProblemId]);

    useEffect(() => {
        if (!isFocusActive || focusEndsAt == null) {
            return undefined;
        }

        const updateRemainingTime = () => {
            const remainingSeconds = Math.max(
                0,
                Math.ceil((focusEndsAt - Date.now()) / 1000)
            );

            setFocusRemainingSeconds(remainingSeconds);

            if (remainingSeconds === 0) {
                setIsFocusActive(false);
                setFocusEndsAt(null);
                setFocusEndModalOpen(true);

                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
            }
        };

        updateRemainingTime();

        const intervalId = window.setInterval(
            updateRemainingTime,
            250
        );

        return () => {
            window.clearInterval(intervalId);
        };
    }, [isFocusActive, focusEndsAt]);

    const handleScratchpadChange = (value) => {
        if (currentProblemId == null) {
            return;
        }

        const problemKey = String(currentProblemId);

        setScratchpadDrafts((prev) => {
            const next = { ...prev };

            if (value.length === 0) {
                delete next[problemKey];
                return next;
            }

            next[problemKey] = {
                text: value,
                updatedAt: Date.now(),
            };

            return next;
        });
    };

    const handleFocusDurationChange = (value) => {
        if (isFocusActive) {
            return;
        }

        const nextMinutes = Number(value);

        if (!Number.isInteger(nextMinutes)) {
            return;
        }

        if (
            nextMinutes < MIN_FOCUS_MINUTES ||
            nextMinutes > MAX_FOCUS_MINUTES
        ) {
            return;
        }

        setFocusDurationMinutes(nextMinutes);
        setFocusRemainingSeconds(nextMinutes * 60);
    };

    const handleHideScratchpad = () => {
        if (isFocusActive) {
            const shouldStopAndHide = window.confirm(
                "진행 중인 집중 타이머를 종료하고 연습장을 숨길까요?"
            );

            if (!shouldStopAndHide) {
                return;
            }

            resetFocusSession();
        }

        setIsScratchpadVisible(false);
    };

    const handleShowScratchpad = () => {
        setIsScratchpadVisible(true);
    };

    const handleStartFocus = () => {
        setFocusEndModalOpen(false);
        setFocusRemainingSeconds(focusDurationSeconds);
        setFocusEndsAt(
            Date.now() + focusDurationSeconds * 1000
        );
        setIsFocusActive(true);
    };

    const handleStopFocus = () => {
        const shouldStop = window.confirm(
            "진행 중인 집중 타이머를 종료할까요?"
        );

        if (!shouldStop) {
            return;
        }

        resetFocusSession();
    };

    const handleExit = () => {
        stopAnswerSpeech();
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
        stopAnswerSpeech();
        resetFocusSession();

        const next = currentIndex + 1;

        if (next >= problems.length) {
            setShowAnswer(false);
            setShowCompleteScreen(true);
            return;
        }

        setCurrentIndex(next);
        setShowAnswer(false);
    };

    const getRandomSplashMessage = () => {
        const messages = [
            "1년 뒤의 나는 환하게 웃는다.",
            "나는 멈추지 않고, 결국 도착한다.",
            "나는 하기 싫을 때 1시간 더한다.",
            "나는 어려운 공부를 좋아한다. 쉬운공부는 재미없다.",
            "나는 끝까지 쌓아 결국 도달한다.",
            "나는 나를 믿는다.",
            "나는 내 가능성을 끝까지 끌어올린다.",
            "나는 조급함으로 루틴을 망치지 않고, 매일 축적한다",
            "나는 불안하면 지금 할 것 하나만 생각한다.",
            "나는 따듯하게, 매일 정진을 지속한다.",
            "나는 압도적인 기본기와 문제해결력을 가졌다.",
        ];

        return messages[Math.floor(Math.random() * messages.length)];
    };

    const goNextWithSplash = () => {
        stopAnswerSpeech();
        resetFocusSession();

        if (nextSplashTimerRef.current) {
            clearTimeout(nextSplashTimerRef.current);
        }

        setSplashMessage(getRandomSplashMessage());
        setNextSplashOpen(true);

        nextSplashTimerRef.current = setTimeout(() => {
            setNextSplashOpen(false);
            goNext();
        }, NEXT_SPLASH_DURATION_MS);
    };

    const goPrev = () => {
        stopAnswerSpeech();

        const prev = currentIndex - 1;

        if (prev < 0) {
            return;
        }

        resetFocusSession();
        setCurrentIndex(prev);
        setShowAnswer(false);
    };

    const updateProblemBookmarkState = (targetProblemId, isBookmarked) => {
        setLocalProblems((prev) =>
            prev.map((p) => {
                if (String(p.problemId) !== String(targetProblemId)) {
                    return p;
                }

                return {
                    ...p,
                    meta: {
                        ...p.meta,
                        isBookmarked,
                    },
                };
            })
        );
    };

    const handleToggleBookmark = async () => {
        if (bookmarkSubmitting || nextSplashOpen) return;

        const problem = problems[currentIndex];

        if (!problem?.problemId) {
            setBookmarkError("문제 ID가 없어 북마크 상태를 변경할 수 없습니다.");
            return;
        }

        const problemId = problem.problemId;
        const previousBookmarked = !!problem.meta?.isBookmarked;
        const optimisticBookmarked = !previousBookmarked;

        try {
            setBookmarkSubmitting(true);
            setBookmarkError("");

            // 클릭 즉시 아이콘 상태를 먼저 바꿔서 반응성을 좋게 만든다.
            updateProblemBookmarkState(problemId, optimisticBookmarked);

            // 서버에 실제 북마크 토글 요청
            const result = await toggleProblemBookmark(problemId);

            // 서버가 내려준 최신 상태로 다시 동기화
            updateProblemBookmarkState(problemId, result.isBookmarked);
        } catch (err) {
            console.error("북마크 토글 실패:", err);

            // 실패하면 원래 상태로 되돌린다.
            updateProblemBookmarkState(problemId, previousBookmarked);

            setBookmarkError("북마크 상태를 변경하지 못했습니다. 다시 시도해주세요.");
        } finally {
            setBookmarkSubmitting(false);
        }
    };

    const startProblemEditing = () => {
        if (
            isProblemEditing ||
            problemEditSubmitting ||
            nextSplashOpen
        ) {
            return;
        }

        const problem = problems[currentIndex];

        if (!problem?.problemId) {
            setProblemEditError(
                "문제 ID가 없어 수정할 수 없습니다."
            );
            return;
        }

        stopAnswerSpeech();
        setShowAnswer(true);
        setProblemEditError("");

        setProblemEditForm({
            questionText: problem.questionText ?? "",
            explanationText: problem.explanationText ?? "",
            answerText: problem.answerText ?? "",
        });

        setIsProblemEditing(true);
    };

    const cancelProblemEditing = () => {
        if (problemEditSubmitting) {
            return;
        }

        const problem = problems[currentIndex];

        setProblemEditForm({
            questionText: problem?.questionText ?? "",
            explanationText: problem?.explanationText ?? "",
            answerText: problem?.answerText ?? "",
        });

        setProblemEditError("");
        setIsProblemEditing(false);
    };

    const handleProblemEditFormChange = (fieldName, value) => {
        setProblemEditForm((prev) => ({
            ...prev,
            [fieldName]: value,
        }));
    };

    const saveProblemEdit = async () => {
        if (problemEditSubmitting) {
            return;
        }

        const problem = problems[currentIndex];

        if (!problem?.problemId) {
            setProblemEditError(
                "문제 ID가 없어 수정할 수 없습니다."
            );
            return;
        }

        if (!problemEditForm.questionText.trim()) {
            setProblemEditError(
                "문제 내용은 비어 있을 수 없습니다."
            );
            return;
        }

        if (!problemEditForm.explanationText.trim()) {
            setProblemEditError(
                "해설 내용은 비어 있을 수 없습니다."
            );
            return;
        }

        if (!problemEditForm.answerText.trim()) {
            setProblemEditError(
                "정답 내용은 비어 있을 수 없습니다."
            );
            return;
        }

        try {
            setProblemEditSubmitting(true);
            setProblemEditError("");

            const updatedProblem = await updateProblem({
                problemId: problem.problemId,
                questionText: problemEditForm.questionText,
                explanationText: problemEditForm.explanationText,
                answerText: problemEditForm.answerText,
            });

            setLocalProblems((prev) =>
                prev.map((item) => {
                    if (
                        String(item.problemId) !==
                        String(updatedProblem.problemId)
                    ) {
                        return item;
                    }

                    return {
                        ...item,
                        questionText:
                        updatedProblem.questionText,
                        explanationText:
                        updatedProblem.explanationText,
                        answerText:
                        updatedProblem.answerText,
                    };
                })
            );

            setProblemEditForm({
                questionText: updatedProblem.questionText,
                explanationText: updatedProblem.explanationText,
                answerText: updatedProblem.answerText,
            });

            setIsProblemEditing(false);
        } catch (error) {
            console.error("문제 수정 실패:", error);

            const serverMessage =
                error?.response?.data?.message;

            setProblemEditError(
                serverMessage ||
                "문제를 수정하지 못했습니다. 다시 시도해주세요."
            );
        } finally {
            setProblemEditSubmitting(false);
        }
    };

    const handleProblemEditButton = async () => {
        if (!isProblemEditing) {
            startProblemEditing();
            return;
        }

        await saveProblemEdit();
    };

    const submitCurrentProblemAndGoNext = async (elapsedSeconds) => {
        const problem = problems[currentIndex];

        if (!problem?.problemId) {
            setSubmissionError("문제 ID가 없어 제출 결과를 저장할 수 없습니다.");
            return false;
        }

        if (submittedProblemIds.has(problem.problemId)) {
            goNextWithSplash();
            return true;
        }

        try {
            setSubmitting(true);
            setSubmissionError("");

            const result = await submitProblemSubmission({
                problemId: problem.problemId,
                isCorrect: true,
                elapsedSeconds,
                ...getSubmissionContext(),
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

            goNextWithSplash();
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

    const toggleAnswerByPageClick = (event) => {
        if (submitting) return;
        if (problemEditSubmitting) return;
        if (isProblemEditing) return;
        if (timeAdjustModal.open) return;
        if (focusEndModalOpen) return;
        if (nextSplashOpen) return;

        const blockedElement = event.target?.closest?.(
            [
                "button",
                "textarea",
                "input",
                "select",
                "a",
                "[data-prevent-answer-toggle]",
            ].join(", ")
        );

        if (blockedElement) {
            return;
        }

        setShowAnswer((prev) => !prev);
    };

    const handleSkipNextClick = () => {
        if (submitting || nextSplashOpen) return;

        goNext();
    };

    const handleSubmitAndNextClick = async () => {
        if (submitting || nextSplashOpen) return;

        const problem = problems[currentIndex];

        if (submittedProblemIds.has(problem?.problemId)) {
            goNextWithSplash();
            return;
        }

        const elapsedSeconds = getNowSeconds(questionStartedAt);

        if (elapsedSeconds >= TEN_MINUTES_IN_SECONDS) {
            openTimeAdjustModal(elapsedSeconds);
            return;
        }

        await submitCurrentProblemAndGoNext(elapsedSeconds);
    };

    const handleFocusSubmitAndNext = async () => {
        setFocusEndModalOpen(false);
        await handleSubmitAndNextClick();
    };

    const handleFocusMore = () => {
        setFocusEndModalOpen(false);
        setFocusRemainingSeconds(focusDurationSeconds);
        setFocusEndsAt(
            Date.now() + focusDurationSeconds * 1000
        );
        setIsFocusActive(true);
    };

    const handleSpeakAnswer = () => {
        if (!("speechSynthesis" in window)) {
            setSubmissionError(
                "현재 브라우저에서는 음성 읽기를 지원하지 않습니다."
            );
            return;
        }

        // 읽기 중 버튼을 다시 누르면 음성을 중지하고
        // 백색소음을 원래 볼륨으로 복구한다.
        if (isSpeaking) {
            stopAnswerSpeech();
            return;
        }

        const currentProblem = problems[currentIndex];
        const speechText = buildAnswerSpeechText(currentProblem);

        if (!speechText) {
            setSubmissionError(
                "읽을 정답 또는 해설이 없습니다."
            );
            return;
        }

        setSubmissionError("");
        setShowAnswer(true);

        // 기존 음성의 지연 이벤트와 새 음성을 구분한다.
        const currentSpeechSessionId =
            speechSessionIdRef.current + 1;

        speechSessionIdRef.current =
            currentSpeechSessionId;

        // 혹시 브라우저에 남아 있는 이전 음성을 제거한다.
        window.speechSynthesis.cancel();

        // 정답 읽기 시작 전에 백색소음 볼륨을 낮춘다.
        duckBackgroundAudio();

        const utterance =
            new SpeechSynthesisUtterance(speechText);

        utterance.lang = "ko-KR";
        utterance.rate = 0.95;
        utterance.pitch = 0.9;
        utterance.volume = 1;

        const finishSpeech = () => {
            // 이미 다른 음성이 시작되었거나 중지된 경우
            // 과거 이벤트는 무시한다.
            if (
                speechSessionIdRef.current !==
                currentSpeechSessionId
            ) {
                return;
            }

            // 같은 종료 이벤트가 여러 번 처리되지 않도록
            // 현재 세션도 무효화한다.
            speechSessionIdRef.current += 1;

            setIsSpeaking(false);
            restoreBackgroundAudio();
        };

        utterance.onend = finishSpeech;
        utterance.onerror = finishSpeech;

        try {
            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        } catch (error) {
            console.error("정답 음성 읽기 실패:", error);

            setSubmissionError(
                "정답 또는 해설을 읽지 못했습니다."
            );

            finishSpeech();
        }
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

    const isProblemEditLocked =
        isProblemEditing || problemEditSubmitting;

    const isPrevDisabled =
        currentIndex === 0 ||
        submitting ||
        nextSplashOpen ||
        isProblemEditLocked;

    const isSkipNextDisabled =
        submitting ||
        nextSplashOpen ||
        isProblemEditLocked;

    const isSubmitNextDisabled =
        submitting ||
        nextSplashOpen ||
        isProblemEditLocked;

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

            {!isProblemEditing && (
                <div style={{ marginBottom: 16 }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 6,
                        }}
                    >
            <span
                style={{
                    flexShrink: 0,
                    lineHeight: 1.7,
                }}
            >
                💁‍♂
            </span>

                        <div
                            className="quiz-markdown"
                            style={{
                                flex: 1,
                                minWidth: 0,
                                ...questionTextStyle,
                            }}
                        >
                            <MarkdownContent
                                value={problem.questionText}
                            />
                        </div>
                    </div>
                </div>
            )}

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

            {isProblemEditing ? (
                <div
                    data-prevent-answer-toggle
                    onClick={(event) => event.stopPropagation()}
                >
                    <div style={editingProblemCardStyle}>
                        {/* 문제 제목 */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 6,
                                marginBottom: 22,
                            }}
                        >
                <span
                    style={{
                        flexShrink: 0,
                        lineHeight: 1.7,
                    }}
                >
                    💁‍♂
                </span>

                            <AutoResizeTextarea
                                value={problemEditForm.questionText}
                                ariaLabel="문제 내용 수정"
                                onValueChange={(value) =>
                                    handleProblemEditFormChange(
                                        "questionText",
                                        value
                                    )
                                }
                                style={{
                                    flex: 1,
                                    minWidth: 0,
                                    ...editableQuestionTextStyle,
                                }}
                            />
                        </div>

                        {/* 해설 */}
                        <div style={{ marginBottom: 22 }}>
                            <div
                                style={{
                                    marginBottom: 8,
                                    fontWeight: 600,
                                    fontSize: 16,
                                    lineHeight: 1.45,
                                }}
                            >
                                해설
                            </div>

                            <AutoResizeTextarea
                                value={problemEditForm.explanationText}
                                ariaLabel="문제 해설 수정"
                                onValueChange={(value) =>
                                    handleProblemEditFormChange(
                                        "explanationText",
                                        value
                                    )
                                }
                                style={editableExplanationTextStyle}
                            />
                        </div>

                        {/* 정답 */}
                        <div>
                            <div
                                style={{
                                    marginBottom: 8,
                                    fontWeight: 600,
                                    fontSize: 16,
                                    lineHeight: 1.45,
                                }}
                            >
                                정답
                            </div>

                            <AutoResizeTextarea
                                value={problemEditForm.answerText}
                                ariaLabel="문제 정답 수정"
                                onValueChange={(value) =>
                                    handleProblemEditFormChange(
                                        "answerText",
                                        value
                                    )
                                }
                                style={editableAnswerTextStyle}
                            />
                        </div>
                    </div>

                    <div
                        data-prevent-answer-toggle
                        onClick={(event) => event.stopPropagation()}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 8,
                            marginTop: -8,
                            marginBottom: 16,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <button
                                type="button"
                                disabled={problemEditSubmitting}
                                onClick={handleProblemEditButton}
                                style={{
                                    ...getButtonStyle(
                                        problemEditSubmitting
                                    ),
                                    background: "#1d4ed8",
                                    borderColor: "#3b82f6",
                                    color: "#f8fafc",
                                }}
                            >
                                {problemEditSubmitting
                                    ? "수정 중..."
                                    : "수정 완료"}
                            </button>

                            <button
                                type="button"
                                disabled={problemEditSubmitting}
                                onClick={cancelProblemEditing}
                                style={getButtonStyle(
                                    problemEditSubmitting,
                                    "small"
                                )}
                            >
                                수정 취소
                            </button>
                        </div>

                        <button
                            type="button"
                            disabled
                            style={getButtonStyle(true)}
                        >
                            정답 읽기
                        </button>
                    </div>
                </div>
            ) : (
                showAnswer && (
                    <div
                        data-prevent-answer-toggle
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div
                            style={{
                                ...answerCardStyle,
                                position: "relative",
                            }}
                        >
                            <button
                                type="button"
                                data-prevent-answer-toggle
                                aria-label="문제 수정"
                                title="문제 수정"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleProblemEditButton();
                                }}
                                style={editProblemIconButtonStyle}
                            >
                                <svg
                                    width="21"
                                    height="21"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
                                    <path d="m15 5 3 3" />
                                </svg>
                            </button>

                            <div style={{ marginBottom: 20 }}>
                                <div
                                    style={{
                                        marginBottom: 6,
                                        fontWeight: 600,
                                    }}
                                >
                                    해설
                                </div>

                                <div style={explanationTextStyle}>
                                    <MarkdownContent
                                        value={problem.explanationText}
                                    />
                                </div>
                            </div>

                            <div>
                                <div
                                    style={{
                                        marginBottom: 6,
                                        fontWeight: 600,
                                    }}
                                >
                                    정답
                                </div>

                                <div style={answerTextStyle}>
                                    <MarkdownContent
                                        value={problem.answerText}
                                    />
                                </div>
                            </div>
                        </div>

                        <div
                            onClick={(event) => event.stopPropagation()}
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center",
                                marginTop: -8,
                                marginBottom: 16,
                            }}
                        >
                            <button
                                type="button"
                                style={getButtonStyle(false)}
                                onClick={handleSpeakAnswer}
                            >
                                {isSpeaking ? "읽기 중지" : "정답 읽기"}
                            </button>
                        </div>
                    </div>
                )
            )}

            {isScratchpadVisible && (
                <AnswerScratchpad
                    value={currentScratchpadDraft}
                    onChange={handleScratchpadChange}
                    onHide={handleHideScratchpad}
                    isFocusActive={isFocusActive}
                    focusDurationMinutes={focusDurationMinutes}
                    focusDurationSeconds={focusDurationSeconds}
                    focusRemainingSeconds={focusRemainingSeconds}
                    onFocusDurationChange={handleFocusDurationChange}
                    onStartFocus={handleStartFocus}
                    onStopFocus={handleStopFocus}
                />
            )}

            {problemEditError && (
                <p
                    data-prevent-answer-toggle
                    style={{
                        color: "var(--color-danger, #fca5a5)",
                        marginTop: 0,
                        marginBottom: 12,
                        lineHeight: 1.5,
                    }}
                >
                    {problemEditError}
                </p>
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

            {bookmarkError && (
                <p
                    style={{
                        color: "var(--color-danger, #fca5a5)",
                        marginTop: 0,
                    }}
                >
                    {bookmarkError}
                </p>
            )}
            <div
                onClick={(e) => e.stopPropagation()}
                style={bottomLeftControlsStyle}
            >
                <button
                    style={getButtonStyle(isPrevDisabled, "small")}
                    onClick={goPrev}
                    disabled={isPrevDisabled}
                >
                    &lt; 이전
                </button>

                <button
                    style={getButtonStyle(isSkipNextDisabled, "small")}
                    onClick={handleSkipNextClick}
                    disabled={isSkipNextDisabled}
                >
                    다음 &gt;
                </button>

                <button
                    style={getButtonStyle(isSubmitNextDisabled)}
                    onClick={handleSubmitAndNextClick}
                    disabled={isSubmitNextDisabled}
                >
                    {submitting ? "제출 중..." : "제출 후 다음"}
                </button>
            </div>

            <div
                onClick={(e) => e.stopPropagation()}
                style={bottomBookmarkStyle}
            >
                <BookmarkToggleButton
                    isBookmarked={!!problem?.meta?.isBookmarked}
                    onClick={handleToggleBookmark}
                    disabled={
                        bookmarkSubmitting ||
                        nextSplashOpen ||
                        problemEditSubmitting
                    }
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

            {focusEndModalOpen && (
                <div
                    data-prevent-answer-toggle
                    onClick={(event) => event.stopPropagation()}
                    style={focusEndModalOverlayStyle}
                >
                    <div style={modalCardStyle}>
                        <h2 style={{ marginTop: 0 }}>
                            {focusDurationMinutes}분 집중이 종료되었습니다.
                        </h2>

                        <p
                            style={{
                                marginBottom: 24,
                                lineHeight: 1.6,
                                color: "var(--color-text-muted, #9ca3af)",
                            }}
                        >
                            현재 문제를 제출하고 다음 문제로 이동하거나,
                            같은 문제를 좀 더 풀 수 있습니다.
                        </p>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 8,
                            }}
                        >
                            <button
                                type="button"
                                style={getButtonStyle(submitting)}
                                onClick={handleFocusSubmitAndNext}
                                disabled={submitting}
                            >
                                {submitting
                                    ? "제출 중..."
                                    : "제출 후 다음"}
                            </button>

                            <button
                                type="button"
                                style={{
                                    ...getButtonStyle(false),
                                    borderColor: "#ef4444",
                                    background: "#991b1b",
                                }}
                                onClick={handleFocusMore}
                            >
                                {focusDurationMinutes}분만 더
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div onClick={(e) => e.stopPropagation()}>
                <FabGroup
                    onEdit={startProblemEditing}
                    onHome={handleExit}
                    onToggleMusic={toggleMusic}
                    isMusicOn={isMusicOn}
                    onShowScratchpad={handleShowScratchpad}
                    showScratchpadAction={!isScratchpadVisible}
                />
            </div>

            {nextSplashOpen && (
                <div
                    style={nextSplashOverlayStyle}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div style={nextSplashCardStyle}>
                        <Lottie
                            animationData={successLottie}
                            loop={false}
                            style={{
                                width: 140,
                                height: 140,
                            }}
                        />

                        <div style={nextSplashTextStyle}>
                            {splashMessage}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function AnswerScratchpad({
                              value,
                              onChange,
                              onHide,
                              isFocusActive,
                              focusDurationMinutes,
                              focusDurationSeconds,
                              focusRemainingSeconds,
                              onFocusDurationChange,
                              onStartFocus,
                              onStopFocus,
                          }) {
    const progressPercent = Math.max(
        0,
        Math.min(
            100,
            (focusRemainingSeconds / focusDurationSeconds) * 100
        )
    );

    return (
        <section
            data-prevent-answer-toggle
            onClick={(event) => event.stopPropagation()}
            style={scratchpadCardStyle}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        fontSize: 17,
                        lineHeight: 1.3,
                    }}
                >
                    연습장
                </h2>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                    }}
                >
                    <select
                        value={focusDurationMinutes}
                        onChange={(event) =>
                            onFocusDurationChange(event.target.value)
                        }
                        disabled={isFocusActive}
                        aria-label="집중 시간 선택"
                        title="집중 시간 선택"
                        style={{
                            height: 35,
                            padding: "0 7px",
                            borderRadius: 6,
                            border: "1px solid var(--color-border, #374151)",
                            background: "var(--color-bg, #111827)",
                            color: "var(--color-text, #f9fafb)",
                            fontSize: 13,
                            cursor: isFocusActive
                                ? "not-allowed"
                                : "pointer",
                            opacity: isFocusActive ? 0.65 : 1,
                        }}
                    >
                        {Array.from(
                            {
                                length:
                                    MAX_FOCUS_MINUTES -
                                    MIN_FOCUS_MINUTES +
                                    1,
                            },
                            (_, index) =>
                                MIN_FOCUS_MINUTES + index
                        ).map((minutes) => (
                            <option key={minutes} value={minutes}>
                                {minutes}분
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        style={{
                            ...getButtonStyle(false, "small"),
                            borderColor: "#ef4444",
                            background: isFocusActive
                                ? "#7f1d1d"
                                : "#991b1b",
                        }}
                        onClick={
                            isFocusActive
                                ? onStopFocus
                                : onStartFocus
                        }
                    >
                        {isFocusActive ? "집중 종료" : "시작"}
                    </button>

                    <button
                        type="button"
                        style={getButtonStyle(false, "small")}
                        onClick={onHide}
                    >
                        숨기기
                    </button>
                </div>
            </div>

            {isFocusActive && (
                <div
                    style={{
                        marginTop: 16,
                        marginBottom: 4,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 8,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#fca5a5",
                            }}
                        >
                            {focusDurationMinutes}분 집중
                        </span>

                        <strong
                            style={{
                                fontSize: 18,
                                fontVariantNumeric: "tabular-nums",
                                color: "#f87171",
                            }}
                        >
                            {formatCountdown(
                                focusRemainingSeconds
                            )}
                        </strong>
                    </div>

                    <div
                        role="progressbar"
                        aria-label="집중 남은 시간"
                        aria-valuemin={0}
                        aria-valuemax={focusDurationSeconds}
                        aria-valuenow={focusRemainingSeconds}
                        style={focusProgressTrackStyle}
                    >
                        <div
                            style={{
                                width: `${progressPercent}%`,
                                height: "100%",
                                borderRadius: 999,
                                background: "#ef4444",
                                transition: "width 0.25s linear",
                            }}
                        />
                    </div>
                </div>
            )}

            <textarea
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                placeholder="문제를 보고 생각한 내용을 자유롭게 작성하세요."
                style={scratchpadTextareaStyle}
            />
        </section>
    );
}

function BookmarkToggleButton({ isBookmarked, onClick, disabled = false }) {
    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();

                if (disabled) return;

                onClick();
            }}
            disabled={disabled}
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
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.6 : 1,
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