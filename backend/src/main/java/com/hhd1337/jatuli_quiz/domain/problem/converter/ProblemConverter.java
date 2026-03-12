package com.hhd1337.jatuli_quiz.domain.problem.converter;

import com.hhd1337.jatuli_quiz.domain.problem.dto.ProblemBookmarkResponse;
import com.hhd1337.jatuli_quiz.domain.problem.entity.Problem;

public class ProblemConverter {

    private ProblemConverter() {
    }

    public static ProblemBookmarkResponse.ToggleBookmarkResponse toToggleBookmarkResponse(Problem problem) {
        return ProblemBookmarkResponse.ToggleBookmarkResponse.builder()
                .problemId(problem.getProblemId())
                .isBookmarked(problem.getIsBookmarked())
                .build();
    }
}