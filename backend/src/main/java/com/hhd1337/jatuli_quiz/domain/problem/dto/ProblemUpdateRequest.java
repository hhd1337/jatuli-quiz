package com.hhd1337.jatuli_quiz.domain.problem.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class ProblemUpdateRequest {

    private ProblemUpdateRequest() {
    }

    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @AllArgsConstructor
    public static class UpdateProblemRequest {

        @NotBlank(message = "문제 내용은 비어 있을 수 없습니다.")
        private String questionText;

        @NotBlank(message = "해설 내용은 비어 있을 수 없습니다.")
        private String explanationText;

        @NotBlank(message = "정답 내용은 비어 있을 수 없습니다.")
        private String answerText;
    }
}