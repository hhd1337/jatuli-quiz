package com.hhd1337.jatuli_quiz.domain.home.converter;

import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import com.hhd1337.jatuli_quiz.domain.home.dto.HomeResponse;

public class HomeConverter {

    private HomeConverter() {
    }

    public static HomeResponse.AchievementCard toAchievementCard(
            Integer todayFocusSeconds,
            Long accumulatedFocusSeconds,
            Integer todaySolvedCount,
            Integer totalSolvedCount,
            Integer daysInARow,
            Integer level,
            Integer todayGoalCount,
            Integer todayGoalSolvedCount
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
            Integer solvedProblemCount
    ) {
        return HomeResponse.RootFolderItem.builder()
                .folderId(folder.getFolderId())
                .name(folder.getName())
                .solvedProblemCount(solvedProblemCount)
                .totalProblemCount(folder.getProblemCount() == null ? 0 : folder.getProblemCount())
                .build();
    }

    public static HomeResponse.GetHomeResponse toGetHomeResponse(
            HomeResponse.AchievementCard achievementCard,
            java.util.List<HomeResponse.RootFolderItem> rootFolders
    ) {
        return HomeResponse.GetHomeResponse.builder()
                .achievementCard(achievementCard)
                .rootFolders(rootFolders)
                .build();
    }
}