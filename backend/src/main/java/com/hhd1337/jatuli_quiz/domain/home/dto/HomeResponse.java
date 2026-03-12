package com.hhd1337.jatuli_quiz.domain.home.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

public class HomeResponse {

    @Getter
    @Builder
    @AllArgsConstructor
    public static class GetHomeResponse {
        private AchievementCard achievementCard;
        private List<RootFolderItem> rootFolders;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class AchievementCard {
        private Integer todayFocusSeconds;
        private Long accumulatedFocusSeconds;
        private Integer todaySolvedCount;
        private Integer totalSolvedCount;
        private Integer daysInARow;
        private Integer level;
        private Integer todayGoalCount;
        private Integer todayGoalSolvedCount;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class RootFolderItem {
        private Long folderId;
        private String name;
        private Integer solvedProblemCount;
        private Integer totalProblemCount;
    }
}
