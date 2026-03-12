package com.hhd1337.jatuli_quiz.domain.problemsubmission.converter;

import com.hhd1337.jatuli_quiz.domain.dailystat.entity.DailyStat;
import com.hhd1337.jatuli_quiz.domain.problem.entity.Problem;
import com.hhd1337.jatuli_quiz.domain.problemsubmission.dto.ProblemSubmissionResponse;

public class ProblemSubmissionConverter {

    private ProblemSubmissionConverter() {
    }

    public static ProblemSubmissionResponse.CreateProblemSubmissionResponse toCreateProblemSubmissionResponse(
            Problem problem,
            DailyStat dailyStat
    ) {
        return ProblemSubmissionResponse.CreateProblemSubmissionResponse.builder()
                .problemId(problem.getProblemId())
                .attemptCount(problem.getSolvedCount())
                .todaySolvedCount(dailyStat.getSolvedCount())
                .todayFocusSeconds(dailyStat.getFocusSeconds())
                .accumulatedFocusSeconds(dailyStat.getAccumulatedFocusSeconds())
                .daysInARow(dailyStat.getDaysInARow())
                .build();
    }
}