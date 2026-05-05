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
import com.hhd1337.jatuli_quiz.domain.progress.entity.LearningProgress;
import com.hhd1337.jatuli_quiz.domain.progress.repository.LearningProgressRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProblemSubmissionCommandServiceImpl implements ProblemSubmissionCommandService {

    private static final ZoneId SERVICE_ZONE = ZoneId.of("Asia/Seoul");

    private final ProblemRepository problemRepository;
    private final ProblemSubmissionRepository problemSubmissionRepository;
    private final DailyStatRepository dailyStatRepository;
    private final LearningProgressRepository learningProgressRepository;

    @Override
    public ProblemSubmissionResponse.CreateProblemSubmissionResponse submit(
            ProblemSubmissionRequest.CreateProblemSubmissionRequest request
    ) {
        Problem problem = problemRepository.findById(request.getProblemId())
                .orElseThrow(() -> new GeneralException(ErrorStatus.PROBLEM_NOT_FOUND));

        LearningProgress learningProgress = getOrCreateSingleUserLearningProgressWithLock();
        Integer currentRoundNo = learningProgress.getCurrentBookmarkedRoundNo();

        int elapsedSeconds = request.getElapsedSeconds() == null ? 0 : request.getElapsedSeconds();

        boolean isBookmarkedSubmission = Boolean.TRUE.equals(problem.getIsBookmarked());

        problem.increaseSolvedCount();

        if (isBookmarkedSubmission) {
            problem.markPracticedInBookmarkedRound(currentRoundNo);
        }

        ProblemSubmission submission = new ProblemSubmission(
                problem,
                request.getIsCorrect(),
                elapsedSeconds,
                LocalDateTime.now(SERVICE_ZONE)
        );
        problemSubmissionRepository.save(submission);

        DailyStat dailyStat = updateDailyStat(elapsedSeconds);

        if (isBookmarkedSubmission) {
            problemRepository.flush();
            completeBookmarkedRoundIfNeeded(learningProgress, currentRoundNo);
        }

        return ProblemSubmissionConverter.toCreateProblemSubmissionResponse(problem, dailyStat);
    }

    private LearningProgress getOrCreateSingleUserLearningProgressWithLock() {
        return learningProgressRepository.findByIdWithLock(LearningProgress.SINGLE_USER_PROGRESS_KEY)
                .orElseGet(() -> learningProgressRepository.save(
                        LearningProgress.createSingleUserProgress()
                ));
    }

    private void completeBookmarkedRoundIfNeeded(
            LearningProgress learningProgress,
            Integer currentRoundNo
    ) {
        if (currentRoundNo == null) {
            return;
        }

        int totalBookmarkedProblemCount = problemRepository.countByIsBookmarkedTrue();

        if (totalBookmarkedProblemCount == 0) {
            return;
        }

        int practicedBookmarkedProblemCount =
                problemRepository.countByIsBookmarkedTrueAndLastPracticedBookmarkedRoundNo(currentRoundNo);

        if (practicedBookmarkedProblemCount >= totalBookmarkedProblemCount) {
            learningProgress.completeCurrentBookmarkedRound();
        }
    }

    private DailyStat updateDailyStat(int elapsedSeconds) {
        LocalDate today = LocalDate.now(SERVICE_ZONE);

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