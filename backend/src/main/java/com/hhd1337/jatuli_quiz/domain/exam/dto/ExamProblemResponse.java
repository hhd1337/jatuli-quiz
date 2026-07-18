package com.hhd1337.jatuli_quiz.domain.exam.dto;

public record ExamProblemResponse(
        Long problemId,
        Integer orderNumber,
        Integer problemNum,
        Long folderId,
        String folderName,
        String folderFullPath,
        String questionText
) {
}