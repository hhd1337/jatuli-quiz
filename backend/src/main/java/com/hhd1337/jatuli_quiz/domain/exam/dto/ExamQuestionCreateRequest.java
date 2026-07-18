package com.hhd1337.jatuli_quiz.domain.exam.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record ExamQuestionCreateRequest(

        @NotEmpty(message = "시험 범위 폴더를 하나 이상 선택해야 합니다.")
        List<@Valid ExamFolderSelectionRequest> folderSelections,

        @NotNull(message = "문제당 제한 시간은 필수입니다.")
        @Min(value = 1, message = "문제당 제한 시간은 최소 1분입니다.")
        @Max(value = 10, message = "문제당 제한 시간은 최대 10분입니다.")
        Integer minutesPerProblem
) {

    public ExamQuestionCreateRequest {
        if (folderSelections != null) {
            folderSelections = List.copyOf(folderSelections);
        }
    }
}