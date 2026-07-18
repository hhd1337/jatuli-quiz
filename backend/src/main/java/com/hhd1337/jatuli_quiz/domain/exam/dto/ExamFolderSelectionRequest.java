package com.hhd1337.jatuli_quiz.domain.exam.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ExamFolderSelectionRequest(

        @NotNull(message = "폴더 ID는 필수입니다.")
        @Positive(message = "폴더 ID는 양수여야 합니다.")
        Long folderId,

        @NotNull(message = "출제 문제 수는 필수입니다.")
        @Positive(message = "출제 문제 수는 1개 이상이어야 합니다.")
        Integer problemCount
) {
}