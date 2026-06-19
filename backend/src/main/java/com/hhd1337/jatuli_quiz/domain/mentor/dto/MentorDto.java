package com.hhd1337.jatuli_quiz.domain.mentor.dto;

import com.hhd1337.jatuli_quiz.domain.routine.entity.RoutinePeriodStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public class MentorDto {

    public record DailyRoutineSummary(
            LocalDate date,
            int totalCount,
            int completedCount,
            int pendingCount,
            int skippedCount,
            int completionRate,
            LocalDateTime plannedAt,
            LocalDateTime lastRoutineModifiedAt,
            LocalDateTime firstCompletedAt,
            LocalDateTime lastCompletedAt,
            List<RoutineTaskSummary> completedTasks,
            List<RoutineTaskSummary> uncompletedTasks
    ) {
    }

    public record RoutineTaskSummary(
            String label,
            LocalTime startTime,
            LocalTime endTime,
            String taskContent,
            RoutinePeriodStatus status,
            LocalDateTime completedAt
    ) {
    }
}
