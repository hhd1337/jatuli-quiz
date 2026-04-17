package com.hhd1337.jatuli_quiz.domain.problem.service;

import com.hhd1337.jatuli_quiz.domain.problem.dto.ProblemBookmarkResponse;
import com.hhd1337.jatuli_quiz.domain.problem.dto.ProblemImportRequest;
import com.hhd1337.jatuli_quiz.domain.problem.dto.ProblemImportResponse;

public interface ProblemCommandService {

    ProblemBookmarkResponse.ToggleBookmarkResponse toggleBookmark(Long problemId);

    ProblemImportResponse.ImportProblemsFromTextResponse importProblemsFromText(
            ProblemImportRequest.ImportProblemsFromTextRequest request
    );
}