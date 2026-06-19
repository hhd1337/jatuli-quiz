package com.hhd1337.jatuli_quiz.domain.routine.service;

import com.hhd1337.jatuli_quiz.domain.routine.converter.RoutineConverter;
import com.hhd1337.jatuli_quiz.domain.routine.dto.RoutineRequest;
import com.hhd1337.jatuli_quiz.domain.routine.dto.RoutineRequest.RoutinePeriodRequest;
import com.hhd1337.jatuli_quiz.domain.routine.dto.RoutineResponse;
import com.hhd1337.jatuli_quiz.domain.routine.entity.DailyRoutine;
import com.hhd1337.jatuli_quiz.domain.routine.entity.RoutinePeriod;
import com.hhd1337.jatuli_quiz.domain.routine.repository.DailyRoutineRepository;
import com.hhd1337.jatuli_quiz.domain.routine.repository.RoutinePeriodRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class RoutineServiceImpl implements RoutineService {

    private final DailyRoutineRepository dailyRoutineRepository;
    private final RoutinePeriodRepository routinePeriodRepository;
    private final RoutineConverter routineConverter;

    @Override
    public RoutineResponse.DailyRoutineResponse saveDailyRoutine(
            RoutineRequest.SaveDailyRoutineRequest request
    ) {
        validatePeriods(request.periods());

        DailyRoutine routine = dailyRoutineRepository.findByRoutineDate(request.routineDate())
                .orElseGet(() -> new DailyRoutine(request.routineDate()));

        List<RoutinePeriod> periods = request.periods()
                .stream()
                .map(routineConverter::toPeriod)
                .toList();

        routine.replacePeriods(periods);

        DailyRoutine savedRoutine = dailyRoutineRepository.save(routine);

        return routineConverter.toDailyRoutineResponse(savedRoutine);
    }

    @Override
    @Transactional(readOnly = true)
    public RoutineResponse.DailyRoutineResponse getDailyRoutine(LocalDate routineDate) {
        DailyRoutine routine = dailyRoutineRepository.findByRoutineDate(routineDate)
                .orElseThrow(() -> new IllegalArgumentException("등록된 오늘 루틴이 없습니다."));

        return routineConverter.toDailyRoutineResponse(routine);
    }

    private void validatePeriods(List<RoutineRequest.RoutinePeriodRequest> periods) {
        if (periods == null || periods.isEmpty()) {
            throw new IllegalArgumentException("루틴 시간 구간은 최소 1개 이상이어야 합니다.");
        }

        List<RoutinePeriodRequest> sortedPeriods = periods.stream()
                .sorted(Comparator.comparing(RoutineRequest.RoutinePeriodRequest::startTime))
                .toList();

        for (RoutineRequest.RoutinePeriodRequest period : sortedPeriods) {
            if (!period.startTime().isBefore(period.endTime())) {
                throw new IllegalArgumentException("시작 시간은 종료 시간보다 빨라야 합니다.");
            }
        }

        for (int i = 0; i < sortedPeriods.size() - 1; i++) {
            RoutineRequest.RoutinePeriodRequest current = sortedPeriods.get(i);
            RoutineRequest.RoutinePeriodRequest next = sortedPeriods.get(i + 1);

            if (current.endTime().isAfter(next.startTime())) {
                throw new IllegalArgumentException("루틴 시간 구간은 서로 겹칠 수 없습니다.");
            }
        }
    }

    @Override
    public RoutineResponse.DailyRoutineResponse completePeriod(Long periodId) {
        RoutinePeriod period = routinePeriodRepository.findById(periodId)
                .orElseThrow(() -> new IllegalArgumentException("루틴 구간을 찾을 수 없습니다."));

        period.complete(LocalDateTime.now());

        return routineConverter.toDailyRoutineResponse(period.getDailyRoutine());
    }

    @Override
    public RoutineResponse.DailyRoutineResponse skipPeriod(Long periodId) {
        RoutinePeriod period = routinePeriodRepository.findById(periodId)
                .orElseThrow(() -> new IllegalArgumentException("루틴 구간을 찾을 수 없습니다."));

        period.skip();

        return routineConverter.toDailyRoutineResponse(period.getDailyRoutine());
    }

    @Override
    public RoutineResponse.DailyRoutineResponse resetPeriod(Long periodId) {
        RoutinePeriod period = routinePeriodRepository.findById(periodId)
                .orElseThrow(() -> new IllegalArgumentException("루틴 구간을 찾을 수 없습니다."));

        period.resetToPending();

        return routineConverter.toDailyRoutineResponse(period.getDailyRoutine());
    }
}
