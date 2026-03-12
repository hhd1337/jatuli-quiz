package com.hhd1337.jatuli_quiz.domain.practice.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

public class PracticeResponse {

    @Getter
    @Builder
    @AllArgsConstructor
    public static class GetPracticeProblemsResponse {
        private String selectionRule;
        private List<PracticeProblemDto> problems;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class PracticeProblemDto {
        private Long problemId;
        private Integer problemNum;
        private String question;
        private String answer;
        private String explanation;
        private PracticeProblemMetaDto meta;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class PracticeProblemMetaDto {
        private Integer attemptCount;
        private Boolean isBookmarked;
    }
}