package com.hhd1337.jatuli_quiz.domain.problem.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

public class ProblemCopyResponse {

    @Getter
    @Builder
    @AllArgsConstructor
    public static class CopyProblemsResponse {
        private Long folderId;
        private Integer totalCount;
        private List<CopyProblemItem> problems;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class CopyProblemItem {
        private Long problemId;
        private Integer problemNum;
        private String questionText;
        private String explanationText;
        private String answerText;
    }
}