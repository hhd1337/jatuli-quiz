import { apiClient } from "./client";

function formatSecondsToKoreanTime(totalSeconds) {
    const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));

    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    const parts = [];

    if (hours > 0) {
        parts.push(`${hours}시간`);
    }

    if (minutes > 0) {
        parts.push(`${minutes}분`);
    }

    if (seconds > 0 || parts.length === 0) {
        parts.push(`${seconds}초`);
    }

    return parts.join(" ");
}

function toNonNegativeNumber(value, fallback = 0) {
    const numberValue = Number(value);

    if (!Number.isFinite(numberValue)) {
        return fallback;
    }

    return Math.max(0, Math.floor(numberValue));
}

function normalizeFolderTree(folder) {
    const children = Array.isArray(folder?.children)
        ? folder.children.map(normalizeFolderTree)
        : [];

    return {
        folderId: folder?.folderId,
        name: folder?.name ?? "",
        solvedCount: folder?.solvedProblemCount ?? 0,
        totalCount: folder?.totalProblemCount ?? 0,
        leaf: Boolean(folder?.leaf),
        children,
    };
}

function normalizeHomeResponse(raw) {
    const achievementCard = raw?.achievementCard ?? {};
    const bookmarkCycleProgress = raw?.bookmarkCycleProgress ?? {};
    const rootFolders = Array.isArray(raw?.rootFolders) ? raw.rootFolders : [];

    const totalBookmarkedProblemCount = toNonNegativeNumber(
        bookmarkCycleProgress.totalBookmarkedProblemCount,
        0
    );

    const rawCurrentCycleSolvedProblemCount = toNonNegativeNumber(
        bookmarkCycleProgress.currentCycleSolvedProblemCount,
        0
    );

    const currentCycleSolvedProblemCount =
        totalBookmarkedProblemCount > 0
            ? Math.min(rawCurrentCycleSolvedProblemCount, totalBookmarkedProblemCount)
            : 0;

    const currentBookmarkedRoundNo = Math.max(
        1,
        toNonNegativeNumber(bookmarkCycleProgress.currentBookmarkedRoundNo, 1)
    );

    const progressPercent =
        bookmarkCycleProgress.progressPercent !== undefined &&
        bookmarkCycleProgress.progressPercent !== null
            ? Math.min(
                100,
                toNonNegativeNumber(bookmarkCycleProgress.progressPercent, 0)
            )
            : totalBookmarkedProblemCount > 0
                ? Math.floor(
                    (currentCycleSolvedProblemCount / totalBookmarkedProblemCount) * 100
                )
                : 0;

    return {
        summary: {
            accumulatedFocusTimeText: formatSecondsToKoreanTime(
                achievementCard.accumulatedFocusSeconds
            ),
            todayFocusTimeText: formatSecondsToKoreanTime(
                achievementCard.todayFocusSeconds
            ),
            level: achievementCard.level ?? 1,
            solvedCountTotal: achievementCard.totalSolvedCount ?? 0,
            todaySolvedCount: achievementCard.todaySolvedCount ?? 0,
            streakDays: achievementCard.daysInARow ?? 0,
            todayGoal: {
                goalCount: achievementCard.todayGoalCount ?? 10,
                solvedCount: achievementCard.todayGoalSolvedCount ?? 0,
            },
            bookmarkCycle: {
                currentBookmarkedRoundNo,
                totalBookmarkedProblemCount,
                currentCycleSolvedProblemCount,
                progressPercent,
                isCompleted:
                    totalBookmarkedProblemCount > 0 &&
                    currentCycleSolvedProblemCount >= totalBookmarkedProblemCount,
            },
        },
        rootFolders: rootFolders.map(normalizeFolderTree),
        quickActions: [
            { key: "RANDOM", label: "랜덤 문제 풀기" },
            { key: "BOOKMARK", label: "북마크 문제 전체순회 시작" },
        ],
    };
}

export async function getHomeData() {
    const response = await apiClient.get("/api/v1/home");
    return normalizeHomeResponse(response.data.result);
}