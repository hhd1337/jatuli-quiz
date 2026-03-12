package com.hhd1337.jatuli_quiz.domain.problemsubmission.service;

import com.hhd1337.jatuli_quiz.common.exception.GeneralException;
import com.hhd1337.jatuli_quiz.common.exception.code.status.ErrorStatus;
import com.hhd1337.jatuli_quiz.domain.dailystat.entity.DailyStat;
import com.hhd1337.jatuli_quiz.domain.dailystat.repository.DailyStatRepository;
import com.hhd1337.jatuli_quiz.domain.problem.entity.Problem;
import com.hhd1337.jatuli_quiz.domain.problem.repository.ProblemRepository;
import com.hhd1337.jatuli_quiz.domain.problemsubmission.converter.ProblemSubmissionConverter;
import com.hhd1337.jatuli_quiz.domain.problemsubmission.dto.ProblemSubmissionRequest;
import com.hhd1337.jatuli_quiz.domain.problemsubmission.dto.ProblemSubmissionResponse;
import com.hhd1337.jatuli_quiz.domain.problemsubmission.entity.ProblemSubmission;
import com.hhd1337.jatuli_quiz.domain.problemsubmission.repository.ProblemSubmissionRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProblemSubmissionCommandServiceImpl implements ProblemSubmissionCommandService {

    private final ProblemRepository problemRepository;
    private final ProblemSubmissionRepository problemSubmissionRepository;
    private final DailyStatRepository dailyStatRepository;

    @Override
    public ProblemSubmissionResponse.CreateProblemSubmissionResponse submit(
            ProblemSubmissionRequest.CreateProblemSubmissionRequest request
    ) {
        Problem problem = problemRepository.findById(request.getProblemId())
                .orElseThrow(() -> new GeneralException(ErrorStatus.PROBLEM_NOT_FOUND));

        int elapsedSeconds = request.getElapsedSeconds() == null ? 0 : request.getElapsedSeconds();

        problem.increaseSolvedCount();

        ProblemSubmission submission = new ProblemSubmission(
                problem,
                request.getIsCorrect(),
                elapsedSeconds,
                LocalDateTime.now()
        );
        problemSubmissionRepository.save(submission);

        DailyStat dailyStat = updateDailyStat(elapsedSeconds);

        return ProblemSubmissionConverter.toCreateProblemSubmissionResponse(problem, dailyStat);
    }

    private DailyStat updateDailyStat(int elapsedSeconds) {
        LocalDate today = LocalDate.now();

        Optional<DailyStat> todayStatOptional = dailyStatRepository.findByStatDate(today);

        if (todayStatOptional.isPresent()) {
            DailyStat todayStat = todayStatOptional.get();
            todayStat.applySubmission(elapsedSeconds);
            return todayStat;
        }

        Optional<DailyStat> lastStatOptional =
                dailyStatRepository.findTopByStatDateLessThanOrderByStatDateDesc(today);

        long previousAccumulatedFocusSeconds = lastStatOptional
                .map(DailyStat::getAccumulatedFocusSeconds)
                .orElse(0L);

        int daysInARow = calculateDaysInARow(lastStatOptional, today);

        DailyStat newDailyStat = DailyStat.createFirstSubmissionOfDay(
                today,
                elapsedSeconds,
                previousAccumulatedFocusSeconds,
                daysInARow
        );

        return dailyStatRepository.save(newDailyStat);
    }

    private int calculateDaysInARow(Optional<DailyStat> lastStatOptional, LocalDate today) {
        if (lastStatOptional.isEmpty()) {
            return 1;
        }

        DailyStat lastStat = lastStatOptional.get();
        LocalDate yesterday = today.minusDays(1);

        if (yesterday.equals(lastStat.getStatDate())) {
            Integer previousDaysInARow = lastStat.getDaysInARow();
            return (previousDaysInARow == null ? 0 : previousDaysInARow) + 1;
        }

        return 1;
    }
}