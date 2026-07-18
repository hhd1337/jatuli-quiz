package com.hhd1337.jatuli_quiz.domain.exam.dto;

import java.util.List;

public record ExamQuestionCreateResponse(
        Integer totalProblemCount,
        Integer timeLimitSeconds,
        List<ExamProblemResponse> problems
) {

    public ExamQuestionCreateResponse {
        problems = problems == null
                ? List.of()
                : List.copyOf(problems);
    }
}