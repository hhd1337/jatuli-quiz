package com.hhd1337.jatuli_quiz.domain.practice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
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

        @Schema(description = "이번 문제풀이 세트에서 받아올 최대 문제 개수", example = "10")
        @NotNull(message = "조회할 문제 개수는 필수입니다.")
        @Min(value = 1, message = "조회할 문제 개수는 1개 이상이어야 합니다.")
        @Max(value = 50, message = "조회할 문제 개수는 50개 이하여야 합니다.")
        private Integer problemCount;
    }
}
