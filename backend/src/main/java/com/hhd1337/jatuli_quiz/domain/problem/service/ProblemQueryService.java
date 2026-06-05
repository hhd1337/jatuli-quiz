package com.hhd1337.jatuli_quiz.domain.problem.service;

import com.hhd1337.jatuli_quiz.domain.problem.dto.ProblemCopyResponse;

public interface ProblemQueryService {

    ProblemCopyResponse.CopyProblemsResponse getProblemsForCopy(Long folderId);
}