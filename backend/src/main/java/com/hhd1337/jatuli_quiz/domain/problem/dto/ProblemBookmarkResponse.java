package com.hhd1337.jatuli_quiz.domain.problem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

public class ProblemBookmarkResponse {

    @Getter
    @Builder
    @AllArgsConstructor
    public static class ToggleBookmarkResponse {
        private Long problemId;
        private Boolean isBookmarked;
    }
}