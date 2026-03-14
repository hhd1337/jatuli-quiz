package com.hhd1337.jatuli_quiz.domain.problem.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

public class ProblemImportResponse {

    @Getter
    @Builder
    @AllArgsConstructor
    public static class ImportProblemsFromTextResponse {
        private Long folderId;
        private Integer savedCount;
        private List<ImportedProblemItem> problems;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class ImportedProblemItem {
        private Long problemId;
        private Integer problemNum;
        private String questionText;
    }
}