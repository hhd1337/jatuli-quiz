package com.hhd1337.jatuli_quiz.domain.home.converter;

import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import com.hhd1337.jatuli_quiz.domain.home.dto.HomeResponse;
import java.util.List;

public class HomeConverter {

    private HomeConverter() {
    }

    public static HomeResponse.AchievementCard toAchievementCard(
            int todayFocusSeconds,
            long accumulatedFocusSeconds,
            int todaySolvedCount,
            int totalSolvedCount,
            int daysInARow,
            int level,
            int todayGoalCount,
            int todayGoalSolvedCount
    ) {
        return HomeResponse.AchievementCard.builder()
                .todayFocusSeconds(todayFocusSeconds)
                .accumulatedFocusSeconds(accumulatedFocusSeconds)
                .todaySolvedCount(todaySolvedCount)
                .totalSolvedCount(totalSolvedCount)
                .daysInARow(daysInARow)
                .level(level)
                .todayGoalCount(todayGoalCount)
                .todayGoalSolvedCount(todayGoalSolvedCount)
                .build();
    }

    public static HomeResponse.BookmarkCycleProgress toBookmarkCycleProgress(
            int currentBookmarkedRoundNo,
            int totalBookmarkedProblemCount,
            int currentCycleSolvedProblemCount
    ) {
        int safeCurrentRoundNo = Math.max(1, currentBookmarkedRoundNo);
        int safeTotalCount = Math.max(0, totalBookmarkedProblemCount);
        int safeSolvedCount = Math.max(0, Math.min(currentCycleSolvedProblemCount, safeTotalCount));

        int progressPercent = safeTotalCount == 0
                ? 0
                : (int) Math.floor((safeSolvedCount * 100.0) / safeTotalCount);

        return HomeResponse.BookmarkCycleProgress.builder()
                .currentBookmarkedRoundNo(safeCurrentRoundNo)
                .totalBookmarkedProblemCount(safeTotalCount)
                .currentCycleSolvedProblemCount(safeSolvedCount)
                .progressPercent(progressPercent)
                .build();
    }

    public static HomeResponse.RootFolderItem toRootFolderItem(
            Folder folder,
            int solvedProblemCount,
            int totalProblemCount,
            boolean leaf,
            List<HomeResponse.RootFolderItem> children
    ) {
        return HomeResponse.RootFolderItem.builder()
                .folderId(folder.getFolderId())
                .name(folder.getName())
                .solvedProblemCount(solvedProblemCount)
                .totalProblemCount(totalProblemCount)
                .leaf(leaf)
                .children(children)
                .build();
    }

    public static HomeResponse.GetHomeResponse toGetHomeResponse(
            HomeResponse.AchievementCard achievementCard,
            HomeResponse.BookmarkCycleProgress bookmarkCycleProgress,
            List<HomeResponse.RootFolderItem> rootFolders
    ) {
        return HomeResponse.GetHomeResponse.builder()
                .achievementCard(achievementCard)
                .bookmarkCycleProgress(bookmarkCycleProgress)
                .rootFolders(rootFolders)
                .build();
    }
}