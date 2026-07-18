package com.hhd1337.jatuli_quiz.domain.problem.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class ProblemUpdateResponse {

    private ProblemUpdateResponse() {
    }

    @Getter
    @Builder
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @AllArgsConstructor
    public static class UpdateProblemResponse {

        private Long problemId;

        private Integer problemNum;

        private String questionText;

        private String explanationText;

        private String answerText;

        private Boolean isBookmarked;

        private Integer solvedCount;

        private Long folderId;

        private String folderName;

        private String folderPath;
    }
}