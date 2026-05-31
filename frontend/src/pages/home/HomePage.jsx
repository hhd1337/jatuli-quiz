import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHomeData } from "../../shared/api/homeApi";
import { createFolder } from "../../shared/api/folderApi";
import { importProblemsText } from "../../shared/api/quizApi";

const pageStyle = {
    maxWidth: 880,
    margin: "0 auto",
    padding: "32px 20px 56px",
    color: "var(--color-text)",
};

const sectionStyle = {
    marginTop: 32,
};

const cardStyle = {
    border: "1px solid var(--color-border)",
    background: "var(--color-surface)",
    color: "var(--color-text)",
    borderRadius: 18,
    padding: 20,
};

const softCardStyle = {
    border: "1px solid var(--color-border)",
    background: "var(--color-surface)",
    color: "var(--color-text)",
    borderRadius: 16,
    padding: 18,
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

function formatRoundedMinutes(timeText) {
    const hourMatch = timeText.match(/(\d+)시간/);
    const minuteMatch = timeText.match(/(\d+)분/);
    const secondMatch = timeText.match(/(\d+)초/);

    const hours = hourMatch ? Number(hourMatch[1]) : 0;
    const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
    const seconds = secondMatch ? Number(secondMatch[1]) : 0;

    const totalMinutes = Math.round(hours * 60 + minutes + seconds / 60);

    if (totalMinutes <= 0) return "0분";

    if (totalMinutes >= 60) {
        const roundedHours = Math.floor(totalMinutes / 60);
        const remainMinutes = totalMinutes % 60;

        if (remainMinutes === 0) return `${roundedHours}시간`;
        return `${roundedHours}시간 ${remainMinutes}분`;
    }

    return `${totalMinutes}분`;
}

function getStreakMarks(streakDays) {
    if (!streakDays || streakDays <= 0) return "-";
    return "🧱".repeat(streakDays);
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
        return "문제당 평균 1초 미만 걸렸어요";
    }

    if (averageSeconds < 60) {
        return `문제당 평균 ${averageSeconds}초 정도 걸렸어요`;
    }

    const minutes = Math.floor(averageSeconds / 60);
    const seconds = averageSeconds % 60;

    if (seconds === 0) {
        return `문제당 평균 ${minutes}분 정도 걸렸어요`;
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

    return isCollapsed ? "📁" : "📂";
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

                            creatingParentFolder,
                            newFolderName,
                            setNewFolderName,
                            onStartCreateFolder,
                            onSubmitCreateFolder,
                            onCancelCreateFolder,

                            onStartImportProblems,

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
                        padding: "10px 0",
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
                            paddingLeft: depth * 16,
                        }}
                    >
                    <span
                        aria-hidden="true"
                        style={{
                            width: 22,
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
                                    fontSize: 15,
                                    fontWeight: 400,
                                }}
                            >
                            {folder.solvedCount}/{folder.totalCount}
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
                                        onClick={() => alert("폴더 이름 변경 API가 아직 없습니다.")}
                                        style={{
                                            ...folderActionButtonStyle,
                                            width: "100%",
                                            borderRadius: 8,
                                            opacity: 0.5,
                                            cursor: "not-allowed",
                                        }}
                                    >
                                        이름 변경 준비중
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => alert("폴더 삭제 API가 아직 없습니다.")}
                                        style={{
                                            ...folderActionButtonStyle,
                                            width: "100%",
                                            borderRadius: 8,
                                            opacity: 0.5,
                                            cursor: "not-allowed",
                                        }}
                                    >
                                        삭제 준비중
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
                        marginLeft: depth * 16 + 34,
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
                        marginLeft: depth * 16 + 11,
                        paddingLeft: 12,
                        borderLeft: "1px solid var(--color-border)",
                    }}
                >
                    {children.map((child) => (
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

                            creatingParentFolder={creatingParentFolder}
                            newFolderName={newFolderName}
                            setNewFolderName={setNewFolderName}
                            onStartCreateFolder={onStartCreateFolder}
                            onSubmitCreateFolder={onSubmitCreateFolder}
                            onCancelCreateFolder={onCancelCreateFolder}

                            onStartImportProblems={onStartImportProblems}

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

export default function HomePage() {
    const navigate = useNavigate();

    const [homeData, setHomeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [collapsedFolderIds, setCollapsedFolderIds] = useState(() => new Set());
    const [isManageMode, setIsManageMode] = useState(false);

    const [creatingParentFolder, setCreatingParentFolder] = useState(null);
    const [newFolderName, setNewFolderName] = useState("");

    const [problemImportTargetFolder, setProblemImportTargetFolder] = useState(null);
    const [problemImportText, setProblemImportText] = useState("");

    const [openedMenuFolderId, setOpenedMenuFolderId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    function toggleFolder(folderId) {
        setCollapsedFolderIds((prev) => {
            const next = new Set(prev);

            if (next.has(folderId)) {
                next.delete(folderId);
            } else {
                next.add(folderId);
            }

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

    function handleStartImportProblems(folder, titlePath) {
        setProblemImportTargetFolder({
            folderId: folder.folderId,
            titlePath,
        });

        setProblemImportText("");
        setOpenedMenuFolderId(null);
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
                <h1 style={{ margin: 0 }}>정진하자</h1>
                <p style={mutedTextStyle}>홈 화면을 불러오는 중입니다...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={pageStyle}>
                <h1 style={{ margin: 0 }}>정진하자</h1>
                <p style={{ color: "var(--color-primary)" }}>{error}</p>
            </div>
        );
    }

    if (!homeData) {
        return (
            <div style={pageStyle}>
                <h1 style={{ margin: 0 }}>정진하자</h1>
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

    const bookmarkButtonLabel =
        bookmarkSolvedCount > 0 ? "이어서 풀기" : "시작하기";

    return (
        <div style={pageStyle}>
            {/* ================== 헤더 ================== */}
            <header
                style={{
                    marginBottom: 24,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        gap: 16,
                        marginBottom: 10,
                    }}
                >
                    <div>
                        <h1
                            style={{
                                margin: 0,
                                fontSize: 38,
                                lineHeight: 1.15,
                                letterSpacing: "-0.05em",
                            }}
                        >
                            정진하자
                        </h1>
                        <ol
                            style={{
                                ...mutedTextStyle,
                                marginTop: 20,
                                marginBottom: 0,
                                paddingLeft: 15,
                                fontSize: 15,
                                lineHeight: 1.7,
                            }}
                        >
                            <li>뜨거운 열정보다 중요한 것은 지속적인 열정이다.</li>
                            <li>나의 목표는 백엔드 개발자로서의 압도적인 기본기와 문제해결 경험이다.</li>
                            <li>
                                나는 조급함으로 축적 루틴을 망치지 않고, 거북이 마음으로 쌓아
                                백엔드 괴물이 된다.
                            </li>
                        </ol>
                    </div>
                </div>
            </header>

            {/* ================== 오늘의 성취 ================== */}
            <section>
                <div
                    style={{
                        ...cardStyle,
                        padding: 22,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 16,
                            marginBottom: 18,
                        }}
                    >
                        <div>
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: 22,
                                    letterSpacing: "-0.04em",
                                }}
                            >
                                🙆 오늘의 성취
                            </h2>

                            {/*<p*/}
                            {/*    style={{*/}
                            {/*        ...mutedTextStyle,*/}
                            {/*        marginTop: 6,*/}
                            {/*        marginBottom: 0,*/}
                            {/*        fontSize: 14,*/}
                            {/*    }}*/}
                            {/*>*/}
                            {/*    오늘 만든 작은 승리를 한눈에 확인하세요.*/}
                            {/*</p>*/}
                        </div>

                        <div
                            style={{
                                color: "var(--color-primary)",
                                fontSize: 14,
                                fontWeight: 800,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {isGoalCompleted ? "목표 달성" : "진행 중"}
                        </div>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                            gap: "clamp(8px, 2vw, 12px)",
                            marginBottom: 18,
                        }}
                    >
                        <MetricCard
                            label="오늘 푼 문제"
                            value={`${todaySolvedCount}제`}
                            valueColor="var(--color-accent-strong)"
                            description={
                                isGoalCompleted
                                    ? `목표보다 ${exceededGoalCount}문제 더 풀었어요`
                                    : `목표 ${todayGoalCount}문제까지 ${Math.max(
                                        0,
                                        todayGoalCount - todayGoalSolvedCount
                                    )}문제 남았어요`
                            }
                        />

                        <MetricCard
                            label="오늘 저축 시간"
                            value={formatRoundedMinutes(summary.todayFocusTimeText)}
                            valueColor="var(--color-accent-strong)"
                            description={formatAverageTimePerProblem(
                                summary.todayFocusTimeText,
                                todaySolvedCount
                            )}
                        />

                        <MetricCard
                            label="연속 도전"
                            value={`${summary.streakDays}일째`}
                            valueColor="var(--color-accent-strong)"
                            description={getStreakMarks(summary.streakDays)}
                        />
                    </div>

                    <div
                        style={{
                            borderTop: "1px solid var(--color-border)",
                            paddingTop: 16,
                        }}
                    >
                        {/*<div*/}
                        {/*    style={{*/}
                        {/*        display: "flex",*/}
                        {/*        justifyContent: "space-between",*/}
                        {/*        alignItems: "center",*/}
                        {/*        gap: 12,*/}
                        {/*        marginBottom: 8,*/}
                        {/*        fontSize: 14,*/}
                        {/*    }}*/}
                        {/*>*/}
                        {/*    <span style={mutedTextStyle}>오늘 목표</span>*/}
                        {/*    <strong>*/}
                        {/*        {todayGoalSolvedCount} / {todayGoalCount}문제*/}
                        {/*    </strong>*/}
                        {/*</div>*/}

                        {/*<ProgressBar*/}
                        {/*    value={todayGoalProgressPercent}*/}
                        {/*    height={10}*/}
                        {/*    ariaLabel="오늘 목표 달성률"*/}
                        {/*/>*/}

                        <p
                            style={{
                                ...mutedTextStyle,
                                marginTop: 12,
                                marginBottom: 0,
                                fontSize: 14,
                            }}
                        >
                            누적 {summary.solvedCountTotal}문제 ·{" "}
                            {summary.accumulatedFocusTimeText} 저축
                        </p>
                    </div>
                </div>
            </section>

            {/* ================== 북마크 순회 ================== */}
            <section style={sectionStyle}>
                {/*<h2*/}
                {/*    style={{*/}
                {/*        marginTop: 0,*/}
                {/*        marginBottom: 12,*/}
                {/*        fontSize: 26,*/}
                {/*        letterSpacing: "-0.04em",*/}
                {/*    }}*/}
                {/*>*/}
                {/*    북마크 문제 이어 풀기*/}
                {/*</h2>*/}

                <div style={cardStyle}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 16,
                            marginBottom: 14,
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
                                📦 북마크 문제 이어 풀기
                            </h3>

                            <p
                                style={{
                                    ...mutedTextStyle,
                                    marginTop: 8,
                                    marginBottom: 0,
                                    lineHeight: 1.55,
                                    fontSize: 15,
                                }}
                            >
                                북마크한 문제를 한 바퀴 다 풀면 레벨업.
                            </p>
                        </div>

                        <div
                            style={{
                                flexShrink: 0,
                                border: "1px solid var(--color-border)",
                                borderRadius: 999,
                                padding: "6px 10px",
                                color: "var(--color-primary)",
                                fontSize: 13,
                                fontWeight: 800,
                            }}
                        >
                            {currentBookmarkedRoundNo}회차 : Level {summary.level}
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
                        height={14}
                        ariaLabel="북마크 문제 전체 순회 진행률"
                    />

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                            marginTop: 18,
                        }}
                    >
                        <p
                            style={{
                                ...mutedTextStyle,
                                margin: 0,
                                fontSize: 14,
                            }}
                        >
                            {hasBookmarkProblems
                                ? "남은 문제를 이어서 풀어보세요."
                                : "아직 북마크된 문제가 없습니다."}
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/quiz/play?mode=bookmark")}
                            disabled={!hasBookmarkProblems}
                            style={getButtonStyle(!hasBookmarkProblems)}
                        >
                            {bookmarkButtonLabel}
                        </button>
                    </div>

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
                                fontSize: 26,
                                letterSpacing: "-0.04em",
                            }}
                        >
                            전체 문제
                        </h2>

                        <p
                            style={{
                                ...mutedTextStyle,
                                marginTop: 6,
                                marginBottom: 0,
                                fontSize: 14,
                            }}
                        >
                            원하는 주제를 골라 바로 연습할 수 있어요.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsManageMode((prev) => !prev)}
                        style={{
                            ...getButtonStyle(false),
                            padding: "8px 12px",
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

                {rootFolders.length === 0 ? (
                    <div style={cardStyle}>
                        <p style={{ ...mutedTextStyle, margin: 0 }}>
                            표시할 문제가 없습니다.
                        </p>
                    </div>
                ) : (
                    <div
                        style={{
                            ...cardStyle,
                            padding: "10px 16px",
                        }}
                    >
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

                                    creatingParentFolder={creatingParentFolder}
                                    newFolderName={newFolderName}
                                    setNewFolderName={setNewFolderName}
                                    onStartCreateFolder={handleStartCreateFolder}
                                    onSubmitCreateFolder={handleSubmitCreateFolder}
                                    onCancelCreateFolder={handleCancelCreateFolder}

                                    onStartImportProblems={handleStartImportProblems}

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
                        placeholder={`문제1

문제 본문

해설 해설 본문

정답 정답 본문

---

문제2

문제 본문

해설 해설 본문

정답 정답 본문`}
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

        </div>
    );
}