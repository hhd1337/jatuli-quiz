package com.hhd1337.jatuli_quiz.domain.mentor.service;

import com.hhd1337.jatuli_quiz.domain.mentor.dto.MentorDto;
import com.hhd1337.jatuli_quiz.domain.routine.entity.DailyRoutine;
import com.hhd1337.jatuli_quiz.domain.routine.entity.RoutinePeriod;
import com.hhd1337.jatuli_quiz.domain.routine.entity.RoutinePeriodStatus;
import com.hhd1337.jatuli_quiz.domain.routine.entity.RoutinePeriodType;
import com.hhd1337.jatuli_quiz.domain.routine.repository.DailyRoutineRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoutineSummaryService {

    private final DailyRoutineRepository dailyRoutineRepository;

    public MentorDto.DailyRoutineSummary getDailyRoutineSummary(LocalDate date) {
        DailyRoutine dailyRoutine = dailyRoutineRepository.findByRoutineDate(date)
                .orElseThrow(() -> new IllegalArgumentException("해당 날짜의 루틴이 없습니다. date=" + date));

        List<RoutinePeriod> taskPeriods = dailyRoutine.getPeriods()
                .stream()
                .filter(this::isTaskTargetPeriod)
                .toList();

        int totalCount = taskPeriods.size();

        int completedCount = (int) taskPeriods.stream()
                .filter(period -> period.getStatus() == RoutinePeriodStatus.COMPLETED)
                .count();

        int pendingCount = (int) taskPeriods.stream()
                .filter(period -> period.getStatus() == RoutinePeriodStatus.PENDING)
                .count();

        int skippedCount = (int) taskPeriods.stream()
                .filter(period -> period.getStatus() == RoutinePeriodStatus.SKIPPED)
                .count();

        int completionRate = totalCount == 0
                ? 0
                : (int) Math.round((completedCount * 100.0) / totalCount);

        LocalDateTime firstCompletedAt = taskPeriods.stream()
                .filter(period -> period.getStatus() == RoutinePeriodStatus.COMPLETED)
                .map(RoutinePeriod::getCompletedAt)
                .filter(completedAt -> completedAt != null)
                .min(Comparator.naturalOrder())
                .orElse(null);

        LocalDateTime lastCompletedAt = taskPeriods.stream()
                .filter(period -> period.getStatus() == RoutinePeriodStatus.COMPLETED)
                .map(RoutinePeriod::getCompletedAt)
                .filter(completedAt -> completedAt != null)
                .max(Comparator.naturalOrder())
                .orElse(null);

        List<MentorDto.RoutineTaskSummary> completedTasks = taskPeriods.stream()
                .filter(period -> period.getStatus() == RoutinePeriodStatus.COMPLETED)
                .map(this::toRoutineTaskSummary)
                .toList();

        List<MentorDto.RoutineTaskSummary> uncompletedTasks = taskPeriods.stream()
                .filter(period -> period.getStatus() != RoutinePeriodStatus.COMPLETED)
                .map(this::toRoutineTaskSummary)
                .toList();

        return new MentorDto.DailyRoutineSummary(
                dailyRoutine.getRoutineDate(),
                totalCount,
                completedCount,
                pendingCount,
                skippedCount,
                completionRate,
                dailyRoutine.getPlannedAt(),
                dailyRoutine.getLastModifiedAt(),
                firstCompletedAt,
                lastCompletedAt,
                completedTasks,
                uncompletedTasks
        );
    }

    private boolean isTaskTargetPeriod(RoutinePeriod period) {
        return period.getType() != RoutinePeriodType.BREAK;
    }

    private MentorDto.RoutineTaskSummary toRoutineTaskSummary(RoutinePeriod period) {
        return new MentorDto.RoutineTaskSummary(
                period.getLabel(),
                period.getStartTime(),
                period.getEndTime(),
                period.getTaskContent(),
                period.getStatus(),
                period.getCompletedAt()
        );
    }
}