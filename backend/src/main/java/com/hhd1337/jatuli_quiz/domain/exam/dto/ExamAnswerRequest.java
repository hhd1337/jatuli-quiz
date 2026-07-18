package com.hhd1337.jatuli_quiz.domain.exam.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.List;

public record ExamAnswerRequest(

        @NotEmpty(message = "제출할 문제 ID가 하나 이상 필요합니다.")
        List<
                @NotNull(message = "문제 ID는 null일 수 없습니다.")
                @Positive(message = "문제 ID는 양수여야 합니다.")
                        Long
                > problemIds,

        @NotNull(message = "시험 전체 소요 시간은 필수입니다.")
        @PositiveOrZero(message = "시험 전체 소요 시간은 0초 이상이어야 합니다.")
        Integer totalElapsedSeconds
) {

    public ExamAnswerRequest {
        if (problemIds != null) {
            problemIds = List.copyOf(problemIds);
        }
    }
}