import { apiClient } from "./client";

function formatSecondsToKoreanTime(totalSeconds) {
    const safeSeconds = Math.max(0, Number(totalSeconds) || 0);

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

function normalizeHomeResponse(raw) {
    const achievementCard = raw?.achievementCard ?? {};
    const rootFolders = Array.isArray(raw?.rootFolders) ? raw.rootFolders : [];

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
        },
        rootFolders: rootFolders.map((folder) => ({
            folderId: folder.folderId,
            name: folder.name ?? "",
            solvedCount: folder.solvedProblemCount ?? 0,
            totalCount: folder.totalProblemCount ?? 0,
        })),
        quickActions: [
            { key: "RANDOM", label: "랜덤 문제 풀기" },
            { key: "BOOKMARK", label: "북마크 문제 풀기" },
        ],
    };
}

export async function getHomeData() {
    const response = await apiClient.get("/api/v1/home");
    return normalizeHomeResponse(response.data.result);
}