package com.hhd1337.jatuli_quiz.domain.problemsubmission.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class ProblemSubmissionRequest {
    @Getter
    @NoArgsConstructor
    public static class CreateProblemSubmissionRequest {

        @NotNull
        private Long problemId;

        private Boolean isCorrect;

        @PositiveOrZero
        private Integer elapsedSeconds;
    }
}
