package com.hhd1337.jatuli_quiz.domain.exam.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ExamAnswerResponse(
        Integer submittedProblemCount,
        Integer totalElapsedSeconds,
        LocalDateTime submittedAt,
        List<ExamAnswerProblemResponse> problems
) {

    public ExamAnswerResponse {
        problems = problems == null
                ? List.of()
                : List.copyOf(problems);
    }

    public record ExamAnswerProblemResponse(
            Long problemId,
            Integer orderNumber,
            Integer problemNum,
            Long folderId,
            String folderName,
            String folderFullPath,
            String questionText,
            String answerText,
            String explanationText,
            Integer recordedElapsedSeconds
    ) {
    }
}