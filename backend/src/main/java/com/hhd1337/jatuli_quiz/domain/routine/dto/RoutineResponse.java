package com.hhd1337.jatuli_quiz.domain.routine.dto;

import com.hhd1337.jatuli_quiz.domain.routine.entity.RoutinePeriodStatus;
import com.hhd1337.jatuli_quiz.domain.routine.entity.RoutinePeriodType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public class RoutineResponse {

    public record DailyRoutineResponse(
            Long routineId,
            LocalDate routineDate,
            LocalDateTime plannedAt,
            LocalDateTime lastModifiedAt,
            List<RoutinePeriodResponse> periods
    ) {
    }

    public record RoutinePeriodResponse(
            Long periodId,
            String label,
            LocalTime startTime,
            LocalTime endTime,
            String taskContent,
            Integer sortOrder,
            RoutinePeriodType type,
            RoutinePeriodStatus status,
            LocalDateTime completedAt
    ) {
    }
}
