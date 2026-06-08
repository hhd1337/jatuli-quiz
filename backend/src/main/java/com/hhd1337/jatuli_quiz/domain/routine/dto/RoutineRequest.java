package com.hhd1337.jatuli_quiz.domain.routine.dto;

import com.hhd1337.jatuli_quiz.domain.routine.entity.RoutinePeriodType;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class RoutineRequest {

    public record SaveDailyRoutineRequest(
            LocalDate routineDate,
            List<RoutinePeriodRequest> periods
    ) {
    }

    public record RoutinePeriodRequest(
            String label,
            LocalTime startTime,
            LocalTime endTime,
            String taskContent,
            Integer sortOrder,
            RoutinePeriodType type
    ) {
    }
}
