package com.hhd1337.jatuli_quiz.domain.dailyrecord.dto;

public record DailySolvedProblemDto(
        Integer problemNum,
        String folderPath,
        String question,
        String answer,
        String explanation,
        long totalSolvedCount
) {
}