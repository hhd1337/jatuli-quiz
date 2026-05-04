package com.hhd1337.jatuli_quiz.domain.practice.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class PracticeRequest {
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GetBookmarkedPracticeProblemsRequest {

        @NotNull(message = "조회할 문제 개수는 필수입니다.")
        @Min(value = 1, message = "조회할 문제 개수는 1개 이상이어야 합니다.")
        @Max(value = 50, message = "조회할 문제 개수는 50개 이하여야 합니다.")
        private Integer size;
    }
}
