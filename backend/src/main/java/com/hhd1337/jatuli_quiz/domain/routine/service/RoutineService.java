package com.hhd1337.jatuli_quiz.domain.routine.service;

import com.hhd1337.jatuli_quiz.domain.routine.dto.RoutineRequest;
import com.hhd1337.jatuli_quiz.domain.routine.dto.RoutineResponse;
import java.time.LocalDate;

public interface RoutineService {

    RoutineResponse.DailyRoutineResponse saveDailyRoutine(
            RoutineRequest.SaveDailyRoutineRequest request
    );

    RoutineResponse.DailyRoutineResponse getDailyRoutine(LocalDate routineDate);

    RoutineResponse.DailyRoutineResponse completePeriod(Long periodId);

    RoutineResponse.DailyRoutineResponse skipPeriod(Long periodId);

    RoutineResponse.DailyRoutineResponse resetPeriod(Long periodId);
}
