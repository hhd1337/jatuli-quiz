package com.hhd1337.jatuli_quiz.domain.problemsubmission.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

public class ProblemSubmissionResponse {

    @Getter
    @Builder
    @AllArgsConstructor
    public static class CreateProblemSubmissionResponse {
        private Long problemId;
        private Integer attemptCount;
        private Integer todaySolvedCount;
        private Integer todayFocusSeconds;
        private Long accumulatedFocusSeconds;
        private Integer daysInARow;
    }
}
