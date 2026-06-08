package com.hhd1337.jatuli_quiz.domain.routine.converter;

import com.hhd1337.jatuli_quiz.domain.routine.dto.RoutineRequest;
import com.hhd1337.jatuli_quiz.domain.routine.dto.RoutineResponse;
import com.hhd1337.jatuli_quiz.domain.routine.dto.RoutineResponse.RoutinePeriodResponse;
import com.hhd1337.jatuli_quiz.domain.routine.entity.DailyRoutine;
import com.hhd1337.jatuli_quiz.domain.routine.entity.RoutinePeriod;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class RoutineConverter {

    public RoutinePeriod toPeriod(RoutineRequest.RoutinePeriodRequest request) {
        return new RoutinePeriod(
                request.label(),
                request.startTime(),
                request.endTime(),
                request.taskContent(),
                request.sortOrder(),
                request.type()
        );
    }

    public RoutineResponse.DailyRoutineResponse toDailyRoutineResponse(DailyRoutine routine) {
        List<RoutinePeriodResponse> periods = routine.getPeriods()
                .stream()
                .map(this::toPeriodResponse)
                .toList();

        return new RoutineResponse.DailyRoutineResponse(
                routine.getId(),
                routine.getRoutineDate(),
                periods
        );
    }

    private RoutineResponse.RoutinePeriodResponse toPeriodResponse(RoutinePeriod period) {
        return new RoutineResponse.RoutinePeriodResponse(
                period.getId(),
                period.getLabel(),
                period.getStartTime(),
                period.getEndTime(),
                period.getTaskContent(),
                period.getSortOrder(),
                period.getType(),
                period.getStatus()
        );
    }
}
