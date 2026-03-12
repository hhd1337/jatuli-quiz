package com.hhd1337.jatuli_quiz.domain.problem.service;

import com.hhd1337.jatuli_quiz.domain.problem.dto.ProblemBookmarkResponse;

public interface ProblemCommandService {

    ProblemBookmarkResponse.ToggleBookmarkResponse toggleBookmark(Long problemId);
}