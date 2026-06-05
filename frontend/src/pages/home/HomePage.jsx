import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHomeData } from "../../shared/api/homeApi";
import {
    createFolder,
    renameFolder,
    deleteFolder,
    reorderChildFolders,
} from "../../shared/api/folderApi";
import {
    importProblemsText,
    getFolderProblemsForCopy,
} from "../../shared/api/quizApi";

const pageStyle = {
    width: "100%",
    maxWidth: 880,
    margin: "0 auto",
    padding: "32px clamp(8px, 3vw, 20px) 56px",
    color: "var(--color-text)",
    boxSizing: "border-box",
};

const sectionStyle = {
    marginTop: 8,
};

const cardStyle = {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid var(--color-border)",
    background: "var(--color-surface)",
    color: "var(--color-text)",
    borderRadius: 18,
    padding: "clamp(16px, 4vw, 20px)",
};

const softCardStyle = {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid var(--color-border)",
    background: "var(--color-surface)",
    color: "var(--color-text)",
    borderRadius: 16,
    padding: "clamp(14px, 3.5vw, 18px)",
};

const mutedTextStyle = {
    color: "var(--color-text-muted)",
};

const buttonBaseStyle = {
    border: "1px solid var(--color-border)",
    background: "var(--color-button-bg)",
    color: "var(--color-button-text)",
    padding: "10px 16px",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 15,
};

const folderActionButtonStyle = {
    border: "1px solid var(--color-border)",
    background: "var(--color-button-bg)",
    color: "var(--color-button-text)",
    borderRadius: 999,
    padding: "5px 9px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
};

const folderIconButtonStyle = {
    border: "1px solid var(--color-border)",
    background: "var(--color-button-bg)",
    color: "var(--color-button-text)",
    borderRadius: 999,
    width: 28,
    height: 28,
    fontSize: 16,
    fontWeight: 900,
    cursor: "pointer",
    lineHeight: 1,
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
    width: "100%",
    border: "1px solid var(--color-border)",
    background: "var(--color-bg)",
    color: "var(--color-text)",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    lineHeight: 1.6,
    resize: "vertical",
    boxSizing: "border-box",
};

function getButtonStyle(disabled = false) {
    return {
        ...buttonBaseStyle,
        background: disabled
            ? "var(--color-button-disabled-bg)"
            : "var(--color-button-bg)",
        color: disabled
            ? "var(--color-button-disabled-text)"
            : "var(--color-button-text)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.65 : 1,
    };
}

function getPercent(value) {
    if (Number.isNaN(value)) return 0;
    return Math.max(0, Math.min(100, value));
}

function getGoalProgressPercent(solvedCount, goalCount) {
    if (!goalCount || goalCount <= 0) return 0;
    return getPercent(Math.round((solvedCount / goalCount) * 100));
}

function getFolderProgressPercent(solvedCount, totalCount) {
    if (!totalCount || totalCount <= 0) return 0;
    return getPercent(Math.round((solvedCount / totalCount) * 100));
}

function formatCompactTime(timeText) {
    if (!timeText) return "0s";

    const hourMatch = timeText.match(/(\d+)시간/);
    const minuteMatch = timeText.match(/(\d+)분/);
    const secondMatch = timeText.match(/(\d+)초/);

    const hours = hourMatch ? Number(hourMatch[1]) : 0;
    const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
    const seconds = secondMatch ? Number(secondMatch[1]) : 0;

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    if (totalSeconds <= 0) {
        return (
            <>
                0<span style={{ fontSize: "0.5em" }}>s</span>
            </>
        );
    }

    const displayHours = Math.floor(totalSeconds / 3600);
    const displayMinutes = Math.floor((totalSeconds % 3600) / 60);
    const displaySeconds = totalSeconds % 60;

    const unitStyle = {
        fontSize: "0.5em",
        verticalAlign: "baseline",
    };

    if (displayHours > 0) {
        return (
            <>
                {displayHours}
                <span style={unitStyle}>h</span>
                {String(displayMinutes).padStart(2, "0")}
            </>
        );
    }

    if (displayMinutes > 0) {
        return (
            <>
                {displayMinutes}
                <span style={unitStyle}>m</span>
                {String(displaySeconds).padStart(2, "0")}
            </>
        );
    }

    return (
        <>
            {displaySeconds}
            <span style={unitStyle}>s</span>
        </>
    );
}

function getStreakMarks(streakDays) {
    if (!streakDays || streakDays <= 0) return "-";
    return "🍀".repeat(streakDays);
}

function parseKoreanTimeToSeconds(timeText) {
    if (!timeText) return 0;

    const hourMatch = timeText.match(/(\d+)시간/);
    const minuteMatch = timeText.match(/(\d+)분/);
    const secondMatch = timeText.match(/(\d+)초/);

    const hours = hourMatch ? Number(hourMatch[1]) : 0;
    const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
    const seconds = secondMatch ? Number(secondMatch[1]) : 0;

    return hours * 3600 + minutes * 60 + seconds;
}

function formatAverageTimePerProblem(timeText, solvedCount) {
    if (!solvedCount || solvedCount <= 0) {
        return "아직 푼 문제가 없어요";
    }

    const totalSeconds = parseKoreanTimeToSeconds(timeText);
    const averageSeconds = Math.round(totalSeconds / solvedCount);

    if (averageSeconds <= 0) {
        return "문제당 평균 1초";
    }

    if (averageSeconds < 60) {
        return `문제당 평균 ${averageSeconds}초`;
    }

    const minutes = Math.floor(averageSeconds / 60);
    const seconds = averageSeconds % 60;

    if (seconds === 0) {
        return `문제당 평균 ${minutes}분`;
    }

    return `문제당 평균 ${minutes}분 ${seconds}초 정도 걸렸어요`;
}

function ProgressBar({ value, height = 10, ariaLabel }) {
    const safeValue = getPercent(value);

    return (
        <div
            style={{
                width: "100%",
                height,
                backgroundColor: "var(--color-surface-soft)",
                borderRadius: 999,
                overflow: "hidden",
            }}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={safeValue}
            aria-label={ariaLabel}
        >
            <div
                style={{
                    width: `${safeValue}%`,
                    height: "100%",
                    backgroundColor: "var(--color-primary)",
                    borderRadius: 999,
                    transition: "width 0.25s ease",
                }}
            />
        </div>
    );
}

function AutoFitText({
                         children,
                         color = "var(--color-text)",
                         maxFontSize = 42,
                         minFontSize = 22,
                     }) {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const [fontSize, setFontSize] = useState(maxFontSize);

    useLayoutEffect(() => {
        function resizeText() {
            const container = containerRef.current;
            const text = textRef.current;

            if (!container || !text) return;

            let nextFontSize = maxFontSize;

            text.style.fontSize = `${nextFontSize}px`;

            while (
                text.scrollWidth > container.clientWidth &&
                nextFontSize > minFontSize
                ) {
                nextFontSize -= 1;
                text.style.fontSize = `${nextFontSize}px`;
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
    }, [children, maxFontSize, minFontSize]);

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                minWidth: 0,
                overflow: "hidden",
            }}
        >
            <span
                ref={textRef}
                style={{
                    display: "inline-block",
                    maxWidth: "100%",
                    fontSize,
                    lineHeight: 1.1,
                    fontWeight: 800,
                    letterSpacing: "-0.06em",
                    color,
                    whiteSpace: "nowrap",
                }}
            >
                {children}
            </span>
        </div>
    );
}

function MetricCard({ label, value, description, valueColor = "var(--color-text)" }) {
    return (
        <div
            style={{
                ...softCardStyle,
                minWidth: 0,
                padding: "clamp(10px, 2.4vw, 18px)",
            }}
        >
            <div
                style={{
                    fontSize: "clamp(11px, 2.8vw, 13px)",
                    color: "var(--color-text-muted)",
                    marginBottom: 8,
                    wordBreak: "keep-all",
                }}
            >
                {label}
            </div>

            <div style={{ marginBottom: 8 }}>
                <AutoFitText color={valueColor}>
                    {value}
                </AutoFitText>
            </div>

            <div
                style={{
                    fontSize: "clamp(11px, 2.8vw, 13px)",
                    color: "var(--color-text-muted)",
                    lineHeight: 1.45,
                    wordBreak: "keep-all",
                    overflowWrap: "break-word",
                }}
            >
                {description}
            </div>
        </div>
    );
}

function getFolderIcon(folder, isCollapsed) {
    if (folder.leaf) {
        return folder.totalCount > 0 ? "🔘" : "◌";
    }

    return isCollapsed ? "🗂️" : "🗂️";
}

function FolderTreeItem({
                            folder,
                            depth = 0,
                            navigate,
                            collapsedFolderIds,
                            onToggleFolder,
                            pathNames = [],
                            parentFolderId = null,
                            isManageMode,

                            siblings = [],
                            indexInSiblings = 0,
                            orderParentFolderId,

                            onRenameFolder,
                            onDeleteFolder,
                            onMoveFolder,

                            creatingParentFolder,
                            newFolderName,
                            setNewFolderName,
                            onStartCreateFolder,
                            onSubmitCreateFolder,
                            onCancelCreateFolder,

                            onStartImportProblems,
                            onCopyFolderProblems,

                            openedMenuFolderId,
                            onToggleFolderMenu,
                            submitting = false,
                        }) {
    const children = folder.children ?? [];
    const hasChildren = children.length > 0;
    const isCollapsed = collapsedFolderIds.has(folder.folderId);
    const isLeaf = folder.leaf ?? folder.isLeaf ?? false;
    const isPlayableLeaf = isLeaf && folder.totalCount > 0;
    const isEmptyLeaf = isLeaf && folder.totalCount <= 0;
    const currentPathNames = [...pathNames, folder.name];
    const titlePath = currentPathNames.join("/");

    const totalCount = Number(folder.totalCount ?? 0);
    const hasOwnProblems = isLeaf && totalCount > 0;
    const canAddChildFolder = !hasOwnProblems;
    const canMoveUp = indexInSiblings > 0;
    const canMoveDown = indexInSiblings < siblings.length - 1;

    function handleClick() {
        if (hasChildren) {
            onToggleFolder(folder.folderId);
            return;
        }

        if (isPlayableLeaf) {
            navigate(`/quiz/play?mode=folder&folderId=${folder.folderId}`, {
                state: {
                    titlePath,
                    parentFolderId,
                },
            });
        }
    }

    return (
        <div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) auto",
                    alignItems: "center",
                    gap: 8,
                    padding: "4px 0",
                }}
            >
                <button
                    type="button"
                    onClick={handleClick}
                    style={{
                        width: "100%",
                        border: "none",
                        background: "transparent",
                        color: "var(--color-text)",
                        padding: isLeaf ? "2px 0" : "8px 0",
                        cursor: hasChildren || isPlayableLeaf ? "pointer" : "default",
                        textAlign: "left",
                        opacity: isEmptyLeaf ? 0.55 : 1,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            minWidth: 0,
                            paddingLeft: depth * 3,
                        }}
                    >
                    <span
                        aria-hidden="true"
                        style={{
                            width: 18,
                            flexShrink: 0,
                            color: folder.leaf
                                ? "var(--color-text-muted)"
                                : "var(--color-primary)",
                            fontWeight: 900,
                            textAlign: "center",
                        }}
                    >
                        {getFolderIcon(folder, isCollapsed)}
                    </span>

                        <strong
                            style={{
                                fontSize: depth === 0 ? 17 : 15,
                                fontWeight: depth === 0 ? 800 : 700,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {folder.name}
                        </strong>

                        {isPlayableLeaf && (
                            <span
                                style={{
                                    flexShrink: 0,
                                    color: "var(--color-primary)",
                                    fontSize: 11,
                                    fontWeight: 400,
                                }}
                            >
                            {folder.totalCount}문제
                        </span>
                        )}
                    </div>
                </button>

                {isManageMode && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            flexShrink: 0,
                        }}
                    >
                        {canAddChildFolder && (
                            <button
                                type="button"
                                onClick={() => onStartCreateFolder(folder, titlePath)}
                                style={folderActionButtonStyle}
                            >
                                + 폴더
                            </button>
                        )}

                        {isLeaf && (
                            <button
                                type="button"
                                onClick={() => onStartImportProblems(folder, titlePath)}
                                style={folderActionButtonStyle}
                            >
                                + 문제
                            </button>
                        )}

                        <div
                            style={{
                                position: "relative",
                                display: "inline-flex",
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => onToggleFolderMenu(folder.folderId)}
                                style={folderIconButtonStyle}
                                aria-label={`${folder.name} 관리 메뉴`}
                            >
                                ⋯
                            </button>

                            {openedMenuFolderId === folder.folderId && (
                                <div
                                    style={{
                                        position: "absolute",
                                        right: 0,
                                        top: "calc(100% + 8px)",
                                        zIndex: 50,
                                        minWidth: 132,
                                        border: "1px solid var(--color-border)",
                                        background: "var(--color-bg)",
                                        borderRadius: 12,
                                        padding: 8,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 4,
                                        boxShadow: "0 12px 30px rgba(0, 0, 0, 0.35)",
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => onCopyFolderProblems(folder, titlePath)}
                                        disabled={submitting}
                                        style={{
                                            ...folderActionButtonStyle,
                                            width: "100%",
                                            borderRadius: 8,
                                            justifyContent: "center",
                                            color: "var(--color-primary)",
                                        }}
                                    >
                                        문제 전체 복사
                                    </button>
                                    {isLeaf && (
                                        <button
                                            type="button"
                                            onClick={() => onStartImportProblems(folder, titlePath)}
                                            style={{
                                                ...folderActionButtonStyle,
                                                width: "100%",
                                                borderRadius: 8,
                                                justifyContent: "center",
                                            }}
                                        >
                                            문제 일괄등록
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => onRenameFolder(folder)}
                                        disabled={submitting}
                                        style={{
                                            ...folderActionButtonStyle,
                                            width: "100%",
                                            borderRadius: 8,
                                        }}
                                    >
                                        이름 변경
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onMoveFolder({
                                                parentFolderId: orderParentFolderId,
                                                siblings,
                                                fromIndex: indexInSiblings,
                                                direction: "UP",
                                            })
                                        }
                                        disabled={!canMoveUp || submitting}
                                        style={{
                                            ...folderActionButtonStyle,
                                            width: "100%",
                                            borderRadius: 8,
                                            opacity: canMoveUp ? 1 : 0.45,
                                            cursor: canMoveUp ? "pointer" : "not-allowed",
                                        }}
                                    >
                                        위로 이동
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onMoveFolder({
                                                parentFolderId: orderParentFolderId,
                                                siblings,
                                                fromIndex: indexInSiblings,
                                                direction: "DOWN",
                                            })
                                        }
                                        disabled={!canMoveDown || submitting}
                                        style={{
                                            ...folderActionButtonStyle,
                                            width: "100%",
                                            borderRadius: 8,
                                            opacity: canMoveDown ? 1 : 0.45,
                                            cursor: canMoveDown ? "pointer" : "not-allowed",
                                        }}
                                    >
                                        아래로 이동
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => onDeleteFolder(folder)}
                                        disabled={submitting}
                                        style={{
                                            ...folderActionButtonStyle,
                                            width: "100%",
                                            borderRadius: 8,
                                            color: "#fca5a5",
                                        }}
                                    >
                                        삭제
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {creatingParentFolder?.folderId === folder.folderId && (
                <div
                    style={{
                        marginLeft: depth * 12 + 30,
                        marginTop: 4,
                        marginBottom: 8,
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                    }}
                >
                    <input
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                onSubmitCreateFolder();
                            }

                            if (e.key === "Escape") {
                                onCancelCreateFolder();
                            }
                        }}
                        placeholder="새 폴더 이름"
                        autoFocus
                        style={inputStyle}
                    />

                    <button
                        type="button"
                        onClick={onSubmitCreateFolder}
                        disabled={submitting}
                        style={folderActionButtonStyle}
                    >
                        추가
                    </button>

                    <button
                        type="button"
                        onClick={onCancelCreateFolder}
                        style={folderActionButtonStyle}
                    >
                        취소
                    </button>
                </div>
            )}

            {hasChildren && !isCollapsed && (
                <div
                    style={{
                        marginLeft: depth * 12 + 8,
                        paddingLeft: 10,
                        borderLeft: "1px solid var(--color-border)",
                    }}
                >
                    {children.map((child, index) => (
                        <FolderTreeItem
                            key={child.folderId}
                            folder={child}
                            depth={depth + 1}
                            navigate={navigate}
                            collapsedFolderIds={collapsedFolderIds}
                            onToggleFolder={onToggleFolder}
                            pathNames={currentPathNames}
                            parentFolderId={folder.folderId}
                            isManageMode={isManageMode}

                            siblings={children}
                            indexInSiblings={index}
                            orderParentFolderId={folder.folderId}

                            onRenameFolder={onRenameFolder}
                            onDeleteFolder={onDeleteFolder}
                            onMoveFolder={onMoveFolder}

                            creatingParentFolder={creatingParentFolder}
                            newFolderName={newFolderName}
                            setNewFolderName={setNewFolderName}
                            onStartCreateFolder={onStartCreateFolder}
                            onSubmitCreateFolder={onSubmitCreateFolder}
                            onCancelCreateFolder={onCancelCreateFolder}

                            onStartImportProblems={onStartImportProblems}
                            onCopyFolderProblems={onCopyFolderProblems}

                            openedMenuFolderId={openedMenuFolderId}
                            onToggleFolderMenu={onToggleFolderMenu}
                            submitting={submitting}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function collectFolderIdsWithChildren(folders = []) {
    const ids = [];

    folders.forEach((folder) => {
        const children = folder.children ?? [];

        if (children.length > 0) {
            ids.push(folder.folderId);
            ids.push(...collectFolderIdsWithChildren(children));
        }
    });

    return ids;
}

const COLLAPSED_FOLDER_IDS_STORAGE_KEY = "jatuli.home.collapsedFolderIds";
const ROOT_FOLDER_ID = 1;

function readCollapsedFolderIdsFromStorage() {
    try {
        const rawValue = window.localStorage.getItem(
            COLLAPSED_FOLDER_IDS_STORAGE_KEY
        );

        if (!rawValue) {
            return null;
        }

        const parsedValue = JSON.parse(rawValue);

        if (!Array.isArray(parsedValue)) {
            return null;
        }

        return new Set(parsedValue);
    } catch (error) {
        console.error("폴더 접힘 상태 복원 실패:", error);
        return null;
    }
}

function saveCollapsedFolderIdsToStorage(collapsedFolderIds) {
    try {
        window.localStorage.setItem(
            COLLAPSED_FOLDER_IDS_STORAGE_KEY,
            JSON.stringify([...collapsedFolderIds])
        );
    } catch (error) {
        console.error("폴더 접힘 상태 저장 실패:", error);
    }
}

function getApiErrorMessage(error, fallbackMessage) {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.result?.message ||
        fallbackMessage
    );
}

function moveItem(array, fromIndex, toIndex) {
    const copied = [...array];
    const [removed] = copied.splice(fromIndex, 1);
    copied.splice(toIndex, 0, removed);
    return copied;
}

const GPT_COPY_PROMPT = `이 대화창에서는 아래 문제들에 대해 물어볼 것입니다.
당신은 선생님이라고 생각하고, 제가 질문하는 내용에 대해 자세하고 친절하게 설명해주세요.
단순히 정답만 말하지 말고, 왜 그런 답이 되는지 개념부터 차근차근 길게 설명해주세요.
우선 아래 문제를 먼저 학습만 해주세요.`;

function normalizeProblemText(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value).trim();
}

function buildProblemCopyText({ titlePath, problems }) {
    const problemBlocks = problems.map((problem, index) => {
        const question = normalizeProblemText(
            problem.questionText ??
            problem.question ??
            problem.content ??
            problem.problemText
        );

        const answer = normalizeProblemText(
            problem.answerText ??
            problem.answer ??
            problem.correctAnswer
        );

        const explanation = normalizeProblemText(
            problem.explanationText ??
            problem.explanation ??
            problem.commentary ??
            problem.solution
        );

        const problemNumber = problem.problemNum ?? index + 1;

        return `## 문제 ${problemNumber}

문제:
${question || "(문제 내용 없음)"}

정답:
${answer || "(정답 없음)"}

해설:
${explanation || "(해설 없음)"}`;
    });

    return `${GPT_COPY_PROMPT}

# 문제 목록

폴더:
${titlePath}

${problemBlocks.join("\n\n")}`;
}

async function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";

    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    const copied = document.execCommand("copy");

    document.body.removeChild(textarea);

    if (!copied) {
        throw new Error("클립보드 복사에 실패했습니다.");
    }
}

export default function HomePage() {
    const navigate = useNavigate();

    const [homeData, setHomeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [initialCollapsedFolderIds] = useState(() =>
        readCollapsedFolderIdsFromStorage()
    );

    const [collapsedFolderIds, setCollapsedFolderIds] = useState(
        () => initialCollapsedFolderIds ?? new Set()
    );

    const hasInitializedCollapsedFoldersRef = useRef(
        initialCollapsedFolderIds !== null
    );

    const [isManageMode, setIsManageMode] = useState(false);

    const [creatingParentFolder, setCreatingParentFolder] = useState(null);
    const [newFolderName, setNewFolderName] = useState("");

    const [problemImportTargetFolder, setProblemImportTargetFolder] = useState(null);
    const [problemImportText, setProblemImportText] = useState("");

    const [openedMenuFolderId, setOpenedMenuFolderId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [copyDialog, setCopyDialog] = useState(null);
    const copyTextareaRef = useRef(null);

    function toggleFolder(folderId) {
        setCollapsedFolderIds((prev) => {
            const next = new Set(prev);

            if (next.has(folderId)) {
                next.delete(folderId);
            } else {
                next.add(folderId);
            }

            saveCollapsedFolderIdsToStorage(next);

            return next;
        });
    }

    function handleStartCreateFolder(folder, titlePath) {
        const isLeaf = folder.leaf ?? folder.isLeaf ?? false;
        const totalCount = Number(folder.totalCount ?? 0);

        if (isLeaf && totalCount > 0) {
            alert("이미 문제가 있는 폴더 아래에는 하위 폴더를 만들 수 없습니다.");
            return;
        }

        setCreatingParentFolder({
            folderId: folder.folderId,
            titlePath,
        });

        setNewFolderName("");
        setOpenedMenuFolderId(null);
    }

    function handleCancelCreateFolder() {
        setCreatingParentFolder(null);
        setNewFolderName("");
    }

    async function handleSubmitCreateFolder() {
        const trimmedName = newFolderName.trim();

        if (!trimmedName) {
            alert("폴더 이름을 입력해주세요.");
            return;
        }

        if (!creatingParentFolder) return;

        try {
            setSubmitting(true);

            await createFolder({
                parentFolderId: creatingParentFolder.folderId,
                name: trimmedName,
            });

            setCollapsedFolderIds((prev) => {
                const next = new Set(prev);
                next.delete(creatingParentFolder.folderId);

                saveCollapsedFolderIdsToStorage(next);

                return next;
            });

            setCreatingParentFolder(null);
            setNewFolderName("");

            await fetchHomeData();
        } catch (err) {
            console.error("폴더 추가 실패:", err);
            alert("폴더 추가에 실패했습니다.");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleRenameFolder(folder) {
        const nextName = window.prompt("새 폴더 이름을 입력하세요.", folder.name);

        if (nextName === null) return;

        const trimmedName = nextName.trim();

        if (!trimmedName) {
            alert("폴더 이름을 입력해주세요.");
            return;
        }

        if (trimmedName === folder.name) {
            setOpenedMenuFolderId(null);
            return;
        }

        try {
            setSubmitting(true);
            setOpenedMenuFolderId(null);

            await renameFolder({
                folderId: folder.folderId,
                name: trimmedName,
            });

            await fetchHomeData();
        } catch (err) {
            console.error("폴더 이름 변경 실패:", err);
            alert(getApiErrorMessage(err, "폴더 이름 변경에 실패했습니다."));
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDeleteFolder(folder) {
        const hasChildren = Array.isArray(folder.children) && folder.children.length > 0;
        const totalCount = Number(folder.totalCount ?? 0);

        if (hasChildren) {
            alert("하위 폴더가 있는 폴더는 삭제할 수 없습니다.");
            return;
        }

        if (totalCount > 0) {
            alert("문제가 있는 폴더는 삭제할 수 없습니다.");
            return;
        }

        const confirmed = window.confirm(
            `'${folder.name}' 폴더를 삭제할까요?`
        );

        if (!confirmed) return;

        try {
            setSubmitting(true);
            setOpenedMenuFolderId(null);

            await deleteFolder(folder.folderId);

            await fetchHomeData();
        } catch (err) {
            console.error("폴더 삭제 실패:", err);
            alert(getApiErrorMessage(err, "폴더 삭제에 실패했습니다."));
        } finally {
            setSubmitting(false);
        }
    }

    async function handleMoveFolder({
                                        parentFolderId,
                                        siblings,
                                        fromIndex,
                                        direction,
                                    }) {
        if (!parentFolderId) {
            alert("부모 폴더 정보를 찾을 수 없습니다.");
            return;
        }

        const toIndex = direction === "UP" ? fromIndex - 1 : fromIndex + 1;

        if (toIndex < 0 || toIndex >= siblings.length) {
            return;
        }

        const reorderedFolders = moveItem(siblings, fromIndex, toIndex);
        const orderedFolderIds = reorderedFolders.map((folder) => folder.folderId);

        try {
            setSubmitting(true);
            setOpenedMenuFolderId(null);

            await reorderChildFolders({
                parentFolderId,
                orderedFolderIds,
            });

            await fetchHomeData();
        } catch (err) {
            console.error("폴더 순서 변경 실패:", err);
            alert(getApiErrorMessage(err, "폴더 순서 변경에 실패했습니다."));
        } finally {
            setSubmitting(false);
        }
    }

    function handleStartImportProblems(folder, titlePath) {
        setProblemImportTargetFolder({
            folderId: folder.folderId,
            titlePath,
        });

        setProblemImportText("");
        setOpenedMenuFolderId(null);
    }

    async function handleCopyFolderProblems(folder, titlePath) {
        try {
            setSubmitting(true);
            setOpenedMenuFolderId(null);

            const result = await getFolderProblemsForCopy(folder.folderId);
            const problems = Array.isArray(result?.problems) ? result.problems : [];

            if (problems.length === 0) {
                alert("복사할 문제가 없습니다.");
                return;
            }

            const copyText = buildProblemCopyText({
                titlePath: result?.folderPath || titlePath,
                problems,
            });

            const isMobileApple =
                /iPhone|iPad|iPod/i.test(navigator.userAgent);

            if (isMobileApple) {
                setCopyDialog({
                    titlePath: result?.folderPath || titlePath,
                    problemCount: problems.length,
                    text: copyText,
                });
                return;
            }

            try {
                await copyTextToClipboard(copyText);
                alert(`${problems.length}개의 문제가 클립보드에 복사되었습니다.`);
            } catch (copyError) {
                console.error("클립보드 복사 실패:", copyError);

                setCopyDialog({
                    titlePath: result?.folderPath || titlePath,
                    problemCount: problems.length,
                    text: copyText,
                });
            }
        } catch (err) {
            console.error("문제 전체 복사 실패:", err);
            alert("문제 전체 복사에 실패했습니다.");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleCopyDialogText() {
        if (!copyDialog?.text) return;

        try {
            await copyTextToClipboard(copyDialog.text);
            alert(`${copyDialog.problemCount}개의 문제가 클립보드에 복사되었습니다.`);
        } catch (err) {
            console.error("복사 모달에서 클립보드 복사 실패:", err);

            const textarea = copyTextareaRef.current;

            if (textarea) {
                textarea.focus();
                textarea.select();
                textarea.setSelectionRange(0, textarea.value.length);
            }

            alert("자동 복사가 막혔습니다. 아래 내용을 직접 길게 눌러 복사해주세요.");
        }
    }

    function handleCloseCopyDialog() {
        setCopyDialog(null);
    }

    function handleCancelImportProblems() {
        setProblemImportTargetFolder(null);
        setProblemImportText("");
    }

    async function handleSubmitImportProblems() {
        const rawText = problemImportText.trim();

        if (!rawText) {
            alert("등록할 문제 문자열을 입력해주세요.");
            return;
        }

        if (!problemImportTargetFolder) return;

        try {
            setSubmitting(true);

            const result = await importProblemsText({
                folderId: problemImportTargetFolder.folderId,
                rawText,
            });

            setProblemImportText("");

            await fetchHomeData();

            alert(`${result.savedCount ?? 0}개의 문제가 등록되었습니다.`);
        } catch (err) {
            console.error("문제 일괄등록 실패:", err);
            alert("문제 일괄등록에 실패했습니다.");
        } finally {
            setSubmitting(false);
        }
    }

    function handleToggleFolderMenu(folderId) {
        setOpenedMenuFolderId((prev) => (prev === folderId ? null : folderId));
    }

    async function fetchHomeData() {
        try {
            setLoading(true);
            setError("");

            const data = await getHomeData();
            setHomeData(data);

            if (!hasInitializedCollapsedFoldersRef.current) {
                const defaultCollapsedFolderIds = new Set(
                    collectFolderIdsWithChildren(data.rootFolders ?? [])
                );

                setCollapsedFolderIds(defaultCollapsedFolderIds);
                saveCollapsedFolderIdsToStorage(defaultCollapsedFolderIds);

                hasInitializedCollapsedFoldersRef.current = true;
            }
        } catch (err) {
            console.error("홈 화면 조회 실패:", err);
            setError("홈 화면 정보를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchHomeData();
    }, []);

    if (loading) {
        return (
            <div style={pageStyle}>
                <h1 style={{ margin: 0 }}>정진</h1>
                <p style={mutedTextStyle}>홈 화면을 불러오는 중입니다...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={pageStyle}>
                <h1 style={{ margin: 0 }}>정진</h1>
                <p style={{ color: "var(--color-primary)" }}>{error}</p>
            </div>
        );
    }

    if (!homeData) {
        return (
            <div style={pageStyle}>
                <h1 style={{ margin: 0 }}>정진</h1>
                <p style={mutedTextStyle}>홈 데이터가 없습니다.</p>
            </div>
        );
    }

    const { summary, rootFolders = [], quickActions = [] } = homeData;

    const bookmarkAction = quickActions.find((action) => action.key === "BOOKMARK");

    const bookmarkCycle = summary.bookmarkCycle ?? {};
    const bookmarkSolvedCount = bookmarkCycle.currentCycleSolvedProblemCount ?? 0;
    const bookmarkTotalCount = bookmarkCycle.totalBookmarkedProblemCount ?? 0;
    const bookmarkProgressPercent = bookmarkCycle.progressPercent ?? 0;
    const currentBookmarkedRoundNo = bookmarkCycle.currentBookmarkedRoundNo ?? 1;
    const hasBookmarkProblems = bookmarkTotalCount > 0;

    const todaySolvedCount = summary.todaySolvedCount ?? 0;
    const todayGoalCount = summary.todayGoal?.goalCount ?? 0;
    const todayGoalSolvedCount = summary.todayGoal?.solvedCount ?? todaySolvedCount;
    const todayGoalProgressPercent = getGoalProgressPercent(
        todayGoalSolvedCount,
        todayGoalCount
    );
    const exceededGoalCount = Math.max(0, todayGoalSolvedCount - todayGoalCount);
    const isGoalCompleted = todayGoalCount > 0 && todayGoalSolvedCount >= todayGoalCount;

    return (
        <div style={pageStyle}>
            {/* ================== 헤더 ================== */}
            <header
                style={{
                    marginBottom: 0,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        gap: 16,
                        marginBottom: 7,
                    }}
                >
                    <div>
                        <h1
                            style={{
                                margin: 0,
                                fontSize: 30,
                                lineHeight: 1.15,
                                letterSpacing: "-0.05em",
                            }}
                        >
                            정진
                        </h1>
                        <ol
                            style={{
                                ...mutedTextStyle,
                                marginTop: 5,
                                marginBottom: 0,
                                paddingLeft: 15,
                                fontSize: 10,
                                lineHeight: 1.7,
                            }}
                        >
                            <li>뜨거운 열정도 중요하지만, 지속적인 열정이 더 중요하다.</li>
                            <li>나의 목표는 백엔드 개발자로서의 압도적인 기본기와 문제해결 경험이다.</li>
                            <li>
                                나는 조급함으로 축적 루틴을 망치지 않고, 거북이 마음으로 쌓아
                                백엔드 괴물이 된다.
                            </li>
                            <li>자신을 믿지 못하는 녀석은 노력할 가치도 없다. 나는 나를 믿는다.</li>
                        </ol>
                    </div>
                </div>
            </header>

            {/* ================== 오늘의 성취 ================== */}
            <section>
                <div
                    style={{
                        ...cardStyle,
                        padding: "15px 15px 8px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 16,
                            marginBottom: 10,
                        }}
                    >
                        <div>
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: 18,
                                    letterSpacing: "-0.04em",
                                }}
                            >
                                오늘의 성취
                            </h2>
                        </div>

                        <p
                            style={{
                                ...mutedTextStyle,
                                marginTop: 0,
                                marginBottom: 0,
                                fontSize: 13,
                                color: "var(--color-primary)",
                            }}
                        >
                            누적 {summary.solvedCountTotal}문제 /{" "}
                            {summary.accumulatedFocusTimeText} 저축
                        </p>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                            gap: "clamp(8px, 2vw, 12px)",
                            marginBottom: 7,
                        }}
                    >
                        <MetricCard
                            label="오늘 푼 문제"
                            value={`${todaySolvedCount}`}
                            valueColor="var(--color-accent-strong)"
                            description={
                                isGoalCompleted
                                    // ? `🎉 목표달성 🎉 ${exceededGoalCount}문제 초과`
                                    ? `🎉 목표달성 🎉`
                                    : `목표까지 ${Math.max(
                                        0,
                                        todayGoalCount - todayGoalSolvedCount
                                    )}문제`
                            }
                        />

                        <MetricCard
                            label="오늘 저축 시간"
                            value={formatCompactTime(summary.todayFocusTimeText)}
                            valueColor="var(--color-accent-strong)"
                            description={formatAverageTimePerProblem(
                                summary.todayFocusTimeText,
                                todaySolvedCount
                            )}
                        />

                        <MetricCard
                            label="연속 도전"
                            value={
                                <>
                                    {summary.streakDays}
                                    <span style={{ fontSize: "0.5em" }}>일</span>
                                </>
                            }
                            valueColor="var(--color-accent-strong)"
                            description={getStreakMarks(summary.streakDays)}
                        />
                    </div>

                </div>
            </section>

            {/* ================== 북마크 순회 ================== */}
            <section style={sectionStyle}>
                <div
                    role="button"
                    tabIndex={hasBookmarkProblems ? 0 : -1}
                    aria-disabled={!hasBookmarkProblems}
                    onClick={() => {
                        if (!hasBookmarkProblems) return;
                        navigate("/quiz/play?mode=bookmark");
                    }}
                    onKeyDown={(e) => {
                        if (!hasBookmarkProblems) return;

                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            navigate("/quiz/play?mode=bookmark");
                        }
                    }}
                    style={{
                        ...cardStyle,
                        cursor: hasBookmarkProblems ? "pointer" : "default",
                        opacity: hasBookmarkProblems ? 1 : 0.65,
                        transition: "transform 0.15s ease, border-color 0.15s ease",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 16,
                            marginBottom: 4,
                        }}
                    >
                        <div>
                            <h3
                                style={{
                                    margin: 0,
                                    fontSize: 18,
                                    letterSpacing: "-0.04em",
                                }}
                            >
                                북마크 문제 순회
                            </h3>
                        </div>

                        <div
                            style={{
                                flexShrink: 0,
                                border: "1px solid var(--color-border)",
                                borderRadius: 999,
                                padding: "5px 9px",
                                color: "var(--color-accent-strong)",
                                fontSize: 14,
                                fontWeight: 800,
                                marginTop: -5,
                            }}
                        >
                            {currentBookmarkedRoundNo}회차 : Lv {summary.level}
                        </div>

                    </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                            gap: 12,
                            marginBottom: 10,
                        }}
                    >
                        <div>
                            <strong
                                style={{
                                    fontSize: 28,
                                    letterSpacing: "-0.04em",
                                    color: "var(--color-primary)",
                                }}
                            >
                                {bookmarkSolvedCount}
                            </strong>
                            <span style={mutedTextStyle}> / {bookmarkTotalCount}문제</span>
                        </div>

                        <strong
                            style={{
                                color: "var(--color-primary)",
                                fontSize: 16,
                            }}
                        >
                            {bookmarkProgressPercent}%
                        </strong>
                    </div>

                    <ProgressBar
                        value={bookmarkProgressPercent}
                        height={8}
                        ariaLabel="북마크 문제 전체 순회 진행률"
                    />

                    {bookmarkAction?.description && (
                        <p
                            style={{
                                ...mutedTextStyle,
                                marginTop: 12,
                                marginBottom: 0,
                                fontSize: 13,
                            }}
                        >
                            {bookmarkAction.description}
                        </p>
                    )}
                </div>
            </section>

            {/* ================== 전체 문제 ================== */}
            <section style={sectionStyle}>


                {rootFolders.length === 0 ? (

                    <div style={cardStyle}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-end",
                                gap: 12,
                                marginBottom: 12,
                            }}
                        >
                            <div>
                                <h2
                                    style={{
                                        margin: 0,
                                        fontSize: 20,
                                        letterSpacing: "-0.04em",
                                    }}
                                >
                                    🐿️ 전체 문제 🐿️
                                </h2>
                            </div>
                        </div>
                        <p style={{ ...mutedTextStyle, margin: 0 }}>
                            표시할 문제가 없습니다.
                        </p>
                    </div>
                ) : (
                    <div
                        style={{
                            ...cardStyle,
                            padding: "10px clamp(8px, 3vw, 16px)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-end",
                                gap: 12,
                                marginBottom: 1,
                            }}
                        >
                            <div>
                                <h2
                                    style={{
                                        margin: 8,
                                        marginBottom: 10,
                                        fontSize: 20,
                                        letterSpacing: "-0.04em",
                                    }}
                                >
                                    문제집
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsManageMode((prev) => !prev)}
                                style={{
                                    ...getButtonStyle(false),
                                    padding: "7px 12px",
                                    marginBottom: 10,
                                    fontSize: 13,
                                    background: isManageMode
                                        ? "var(--color-primary)"
                                        : "var(--color-button-bg)",
                                    color: isManageMode
                                        ? "var(--color-bg)"
                                        : "var(--color-button-text)",
                                }}
                            >
                                {isManageMode ? "관리 모드 끄기" : "관리 모드"}
                            </button>
                        </div>

                        {rootFolders.map((folder, index) => (
                            <div
                                key={folder.folderId}
                                style={{
                                    borderTop:
                                        index === 0
                                            ? "none"
                                            : "1px solid var(--color-border)",
                                    paddingTop: index === 0 ? 0 : 6,
                                    marginTop: index === 0 ? 0 : 6,
                                }}
                            >
                                <FolderTreeItem
                                    folder={folder}
                                    depth={0}
                                    navigate={navigate}
                                    collapsedFolderIds={collapsedFolderIds}
                                    onToggleFolder={toggleFolder}
                                    pathNames={[]}
                                    parentFolderId={null}
                                    isManageMode={isManageMode}

                                    siblings={rootFolders}
                                    indexInSiblings={index}
                                    orderParentFolderId={ROOT_FOLDER_ID}

                                    onRenameFolder={handleRenameFolder}
                                    onDeleteFolder={handleDeleteFolder}
                                    onMoveFolder={handleMoveFolder}

                                    creatingParentFolder={creatingParentFolder}
                                    newFolderName={newFolderName}
                                    setNewFolderName={setNewFolderName}
                                    onStartCreateFolder={handleStartCreateFolder}
                                    onSubmitCreateFolder={handleSubmitCreateFolder}
                                    onCancelCreateFolder={handleCancelCreateFolder}

                                    onStartImportProblems={handleStartImportProblems}
                                    onCopyFolderProblems={handleCopyFolderProblems}

                                    openedMenuFolderId={openedMenuFolderId}
                                    onToggleFolderMenu={handleToggleFolderMenu}
                                    submitting={submitting}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {problemImportTargetFolder && (
                <div
                    style={{
                        position: "fixed",
                        right: 24,
                        top: 24,
                        bottom: 24,
                        width: 460,
                        maxWidth: "calc(100vw - 48px)",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-surface)",
                        color: "var(--color-text)",
                        borderRadius: 18,
                        padding: 20,
                        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.45)",
                        zIndex: 100,
                        overflowY: "auto",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 12,
                            marginBottom: 16,
                        }}
                    >
                        <div>
                            <h3
                                style={{
                                    margin: 0,
                                    fontSize: 22,
                                    letterSpacing: "-0.04em",
                                }}
                            >
                                문제 일괄등록
                            </h3>

                            <p
                                style={{
                                    ...mutedTextStyle,
                                    marginTop: 6,
                                    marginBottom: 0,
                                    fontSize: 13,
                                    lineHeight: 1.5,
                                }}
                            >
                                {problemImportTargetFolder.titlePath}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleCancelImportProblems}
                            style={folderIconButtonStyle}
                        >
                            ×
                        </button>
                    </div>

                    <p
                        style={{
                            ...mutedTextStyle,
                            marginTop: 0,
                            marginBottom: 10,
                            fontSize: 13,
                            lineHeight: 1.6,
                        }}
                    >
                        GPT로 만든 문제 문자열을 그대로 붙여넣으세요.
                    </p>

                    <textarea
                        value={problemImportText}
                        onChange={(e) => setProblemImportText(e.target.value)}
                        placeholder={`### 문제 1
(문제)

해설
(자세한 해설)

정답
(정답)

---
### 문제 2
...`}
                        rows={18}
                        style={textareaStyle}
                    />

                    <div
                        style={{
                            display: "flex",
                            gap: 8,
                            marginTop: 14,
                        }}
                    >
                        <button
                            type="button"
                            onClick={handleSubmitImportProblems}
                            disabled={submitting}
                            style={{
                                ...getButtonStyle(submitting),
                                flex: 1,
                            }}
                        >
                            {submitting ? "등록 중..." : "문제 등록"}
                        </button>

                        <button
                            type="button"
                            onClick={handleCancelImportProblems}
                            style={getButtonStyle(false)}
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}
            {copyDialog && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0, 0, 0, 0.65)",
                        zIndex: 200,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 16,
                    }}
                >
                    <div
                        style={{
                            width: 560,
                            maxWidth: "100%",
                            maxHeight: "90vh",
                            border: "1px solid var(--color-border)",
                            background: "var(--color-surface)",
                            color: "var(--color-text)",
                            borderRadius: 18,
                            padding: 18,
                            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
                            overflow: "auto",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: 12,
                                marginBottom: 12,
                            }}
                        >
                            <div>
                                <h3
                                    style={{
                                        margin: 0,
                                        fontSize: 20,
                                        letterSpacing: "-0.04em",
                                    }}
                                >
                                    문제 전체 복사
                                </h3>

                                <p
                                    style={{
                                        ...mutedTextStyle,
                                        marginTop: 6,
                                        marginBottom: 0,
                                        fontSize: 13,
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {copyDialog.titlePath} / {copyDialog.problemCount}문제
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseCopyDialog}
                                style={folderIconButtonStyle}
                            >
                                ×
                            </button>
                        </div>

                        <p
                            style={{
                                ...mutedTextStyle,
                                marginTop: 0,
                                marginBottom: 10,
                                fontSize: 13,
                                lineHeight: 1.6,
                            }}
                        >
                            모바일 브라우저에서 자동 복사가 막힐 수 있습니다.
                            아래 버튼을 눌러 복사하거나, 안 되면 내용을 직접 길게 눌러 복사해주세요.
                        </p>

                        <textarea
                            ref={copyTextareaRef}
                            value={copyDialog.text}
                            readOnly
                            rows={14}
                            onFocus={(e) => e.target.select()}
                            style={{
                                ...textareaStyle,
                                fontSize: 13,
                                minHeight: 260,
                            }}
                        />

                        <div
                            style={{
                                display: "flex",
                                gap: 8,
                                marginTop: 14,
                            }}
                        >
                            <button
                                type="button"
                                onClick={handleCopyDialogText}
                                style={{
                                    ...getButtonStyle(false),
                                    flex: 1,
                                    background: "var(--color-primary)",
                                    color: "var(--color-bg)",
                                }}
                            >
                                클립보드에 복사
                            </button>

                            <button
                                type="button"
                                onClick={handleCloseCopyDialog}
                                style={getButtonStyle(false)}
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}