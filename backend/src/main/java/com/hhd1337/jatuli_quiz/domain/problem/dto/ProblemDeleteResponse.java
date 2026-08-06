package com.hhd1337.jatuli_quiz.domain.problem.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class ProblemDeleteResponse {

    private ProblemDeleteResponse() {
    }

    @Getter
    @Builder
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @AllArgsConstructor
    public static class DeleteProblemResponse {

        private Long problemId;

        private Long folderId;
    }
}
