import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHomeData } from "../../shared/api/homeApi";

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

    return isCollapsed ? "▶" : "▼";
}

function FolderTreeItem({
                            folder,
                            depth = 0,
                            navigate,
                            collapsedFolderIds,
                            onToggleFolder,
                            pathNames = [],
                            parentFolderId = null,
                        }) {
    const children = folder.children ?? [];
    const hasChildren = children.length > 0;
    const isCollapsed = collapsedFolderIds.has(folder.folderId);
    const isPlayableLeaf = folder.leaf && folder.totalCount > 0;
    const isEmptyLeaf = folder.leaf && folder.totalCount <= 0;
    const currentPathNames = [...pathNames, folder.name];
    const titlePath = currentPathNames.join("/");

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
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 1fr) auto",
                        alignItems: "center",
                        gap: 12,
                        paddingLeft: depth * 16,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            minWidth: 0,
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
                </div>
            </button>

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

    useEffect(() => {
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
                                />
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}