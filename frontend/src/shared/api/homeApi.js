import { apiClient } from "./client";

function normalizeHomeResponse(raw) {
    const achievementCard = raw?.achievementCard ?? {};
    const rootFolders = Array.isArray(raw?.rootFolders) ? raw.rootFolders : [];

    return {
        summary: {
            savedTimeMinutes: Math.floor((achievementCard.accumulatedFocusSeconds ?? 0) / 60),
            level: achievementCard.level ?? 1,
            solvedCountTotal: achievementCard.totalSolvedCount ?? 0,
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