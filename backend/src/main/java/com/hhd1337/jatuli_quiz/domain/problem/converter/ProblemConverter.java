package com.hhd1337.jatuli_quiz.domain.problem.converter;

import com.hhd1337.jatuli_quiz.domain.problem.dto.ProblemBookmarkResponse;
import com.hhd1337.jatuli_quiz.domain.problem.dto.ProblemImportResponse;
import com.hhd1337.jatuli_quiz.domain.problem.entity.Problem;
import java.util.List;

public class ProblemConverter {

    private ProblemConverter() {
    }

    public static ProblemBookmarkResponse.ToggleBookmarkResponse toToggleBookmarkResponse(Problem problem) {
        return ProblemBookmarkResponse.ToggleBookmarkResponse.builder()
                .problemId(problem.getProblemId())
                .isBookmarked(problem.getIsBookmarked())
                .build();
    }

    public static ProblemImportResponse.ImportedProblemItem toImportedProblemItem(Problem problem) {
        return ProblemImportResponse.ImportedProblemItem.builder()
                .problemId(problem.getProblemId())
                .problemNum(problem.getProblemNum())
                .questionText(problem.getQuestionText())
                .build();
    }

    public static ProblemImportResponse.ImportProblemsFromTextResponse toImportProblemsFromTextResponse(
            Long folderId,
            List<Problem> savedProblems
    ) {
        return ProblemImportResponse.ImportProblemsFromTextResponse.builder()
                .folderId(folderId)
                .savedCount(savedProblems.size())
                .problems(savedProblems.stream()
                        .map(ProblemConverter::toImportedProblemItem)
                        .toList())
                .build();
    }
}