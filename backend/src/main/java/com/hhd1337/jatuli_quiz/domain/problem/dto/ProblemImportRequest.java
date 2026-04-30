package com.hhd1337.jatuli_quiz.domain.problem.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class ProblemImportRequest {
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportProblemsFromTextRequest {
        private Long folderId;
        private String rawText;
    }
}
