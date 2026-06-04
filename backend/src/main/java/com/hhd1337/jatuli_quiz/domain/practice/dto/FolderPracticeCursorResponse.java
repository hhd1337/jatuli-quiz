package com.hhd1337.jatuli_quiz.domain.practice.dto;

public record FolderPracticeCursorResponse(
        boolean hasCursor,
        Long nextProblemId,
        int nextProblemIndex,
        int nextProblemNumber,
        int totalProblemCount
) {

    public static FolderPracticeCursorResponse noCursor(int totalProblemCount) {
        return new FolderPracticeCursorResponse(
                false,
                null,
                0,
                1,
                totalProblemCount
        );
    }

    public static FolderPracticeCursorResponse of(
            Long nextProblemId,
            int nextProblemIndex,
            int totalProblemCount
    ) {
        return new FolderPracticeCursorResponse(
                true,
                nextProblemId,
                nextProblemIndex,
                nextProblemIndex + 1,
                totalProblemCount
        );
    }
}