package com.hhd1337.jatuli_quiz.domain.practice.converter;

import com.hhd1337.jatuli_quiz.domain.practice.dto.PracticeResponse;
import com.hhd1337.jatuli_quiz.domain.problem.entity.Problem;
import java.util.List;

public class PracticeConverter {

    private PracticeConverter() {
    }

    public static PracticeResponse.PracticeProblemDto toPracticeProblemDto(Problem problem) {
        return PracticeResponse.PracticeProblemDto.builder()
                .problemId(problem.getProblemId())
                .problemNum(problem.getProblemNum())
                .question(problem.getQuestionText())
                .answer(problem.getAnswerText())
                .explanation(problem.getExplanationText())
                .meta(
                        PracticeResponse.PracticeProblemMetaDto.builder()
                                .attemptCount(problem.getSolvedCount() == null ? 0 : problem.getSolvedCount())
                                .isBookmarked(problem.getIsBookmarked())
                                .build()
                )
                .build();
    }

    public static PracticeResponse.GetPracticeProblemsResponse toGetPracticeProblemsResponse(
            String selectionRule,
            List<PracticeResponse.PracticeProblemDto> problems
    ) {
        return PracticeResponse.GetPracticeProblemsResponse.builder()
                .selectionRule(selectionRule)
                .problems(problems)
                .build();
    }
}