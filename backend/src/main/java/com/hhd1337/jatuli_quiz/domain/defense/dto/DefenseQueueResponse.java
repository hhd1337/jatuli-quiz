package com.hhd1337.jatuli_quiz.domain.defense.dto;

import java.util.List;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class DefenseQueueResponse {

    private DefenseQueueResponse() {
    }

    @Getter
    @Builder
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @AllArgsConstructor
    public static class DefenseQueueEntryItem {
        private Long folderId;
        private String folderName;
        private String folderFullPath;
        private Integer totalProblemCount;
        private Integer queueOrder;
    }

    @Getter
    @Builder
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @AllArgsConstructor
    public static class GetDefenseQueueResponse {
        private Integer totalCount;
        private List<DefenseQueueEntryItem> entries;
    }
}
