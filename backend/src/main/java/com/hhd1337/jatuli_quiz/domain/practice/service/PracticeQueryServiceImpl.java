package com.hhd1337.jatuli_quiz.domain.practice.service;

import com.hhd1337.jatuli_quiz.domain.practice.converter.PracticeConverter;
import com.hhd1337.jatuli_quiz.domain.practice.dto.PracticeResponse;
import com.hhd1337.jatuli_quiz.domain.problem.entity.Problem;
import com.hhd1337.jatuli_quiz.domain.problem.repository.ProblemRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PracticeQueryServiceImpl implements PracticeQueryService {

    private static final String SELECTION_RULE_BOOKMARK_ATTEMPT_ASC = "BOOKMARK_ATTEMPT_ASC";

    private final ProblemRepository problemRepository;

    @Override
    public PracticeResponse.GetPracticeProblemsResponse getBookmarkedPracticeProblems() {
        List<Problem> bookmarkedProblems = problemRepository.findBookmarkedProblemsOrderByAttemptCountAsc();

        List<PracticeResponse.PracticeProblemDto> problems = bookmarkedProblems.stream()
                .map(PracticeConverter::toPracticeProblemDto)
                .toList();

        return PracticeConverter.toGetPracticeProblemsResponse(
                SELECTION_RULE_BOOKMARK_ATTEMPT_ASC,
                problems
        );
    }
}