package com.hhd1337.jatuli_quiz.domain.problem.service;

import com.hhd1337.jatuli_quiz.common.exception.GeneralException;
import com.hhd1337.jatuli_quiz.common.exception.code.status.ErrorStatus;
import com.hhd1337.jatuli_quiz.domain.problem.converter.ProblemConverter;
import com.hhd1337.jatuli_quiz.domain.problem.dto.ProblemBookmarkResponse;
import com.hhd1337.jatuli_quiz.domain.problem.entity.Problem;
import com.hhd1337.jatuli_quiz.domain.problem.repository.ProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProblemCommandServiceImpl implements ProblemCommandService {

    private final ProblemRepository problemRepository;

    @Override
    public ProblemBookmarkResponse.ToggleBookmarkResponse toggleBookmark(Long problemId) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new GeneralException(ErrorStatus.PROBLEM_NOT_FOUND));

        problem.toggleBookmark();

        return ProblemConverter.toToggleBookmarkResponse(problem);
    }
}