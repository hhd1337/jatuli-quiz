package com.hhd1337.jatuli_quiz.domain.exam.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record ExamQuestionCreateRequest(

        @NotEmpty(message = "시험 범위 폴더를 하나 이상 선택해야 합니다.")
        List<@Valid ExamFolderSelectionRequest> folderSelections
) {

    public ExamQuestionCreateRequest {
        if (folderSelections != null) {
            folderSelections = List.copyOf(folderSelections);
        }
    }
}