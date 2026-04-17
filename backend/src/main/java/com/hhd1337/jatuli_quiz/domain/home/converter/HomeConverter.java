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

    public static HomeResponse.RootFolderItem toRootFolderItem(
            Folder folder,
            int solvedProblemCount,
            int totalProblemCount
    ) {
        return HomeResponse.RootFolderItem.builder()
                .folderId(folder.getFolderId())
                .name(folder.getName())
                .solvedProblemCount(solvedProblemCount)
                .totalProblemCount(totalProblemCount)
                .build();
    }

    public static HomeResponse.GetHomeResponse toGetHomeResponse(
            HomeResponse.AchievementCard achievementCard,
            List<HomeResponse.RootFolderItem> rootFolders
    ) {
        return HomeResponse.GetHomeResponse.builder()
                .achievementCard(achievementCard)
                .rootFolders(rootFolders)
                .build();
    }
}