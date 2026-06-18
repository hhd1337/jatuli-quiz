package com.hhd1337.jatuli_quiz.domain.mentor.dto;

import com.hhd1337.jatuli_quiz.domain.mentor.entity.DailyMentorFeedback;
import com.hhd1337.jatuli_quiz.domain.mentor.entity.DailyReflection;
import com.hhd1337.jatuli_quiz.domain.mentor.entity.MentorFeedbackSendStatus;
import com.hhd1337.jatuli_quiz.domain.mentor.entity.MentorPlan;
import com.hhd1337.jatuli_quiz.domain.mentor.entity.MentorPlanType;
import com.hhd1337.jatuli_quiz.domain.routine.entity.RoutinePeriodStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public class MentorResponse {

    public record MentorPlanResponse(
            Long id,
            MentorPlanType type,
            String content,
            Boolean active
    ) {
        public static MentorPlanResponse from(MentorPlan mentorPlan) {
            return new MentorPlanResponse(
                    mentorPlan.getId(),
                    mentorPlan.getType(),
                    mentorPlan.getContent(),
                    mentorPlan.getActive()
            );
        }
    }

    public record CurrentMentorPlansResponse(
            MentorPlanResponse careerPlan,
            MentorPlanResponse monthlyPlan,
            MentorPlanResponse weeklyPlan
    ) {
    }

    public record DailyReflectionResponse(
            Long id,
            LocalDate reflectionDate,
            String mood,
            String good,
            String regret,
            String freeText,
            LocalDateTime writtenAt
    ) {
        public static DailyReflectionResponse from(DailyReflection dailyReflection) {
            return new DailyReflectionResponse(
                    dailyReflection.getId(),
                    dailyReflection.getReflectionDate(),
                    dailyReflection.getMood(),
                    dailyReflection.getGood(),
                    dailyReflection.getRegret(),
                    dailyReflection.getFreeText(),
                    dailyReflection.getWrittenAt()
            );
        }
    }

    public record DailyMentorFeedbackResponse(
            Long id,
            LocalDate feedbackDate,
            String promptSnapshot,
            String feedbackContent,
            LocalDateTime generatedAt,
            MentorFeedbackSendStatus sendStatus
    ) {
        public static DailyMentorFeedbackResponse from(DailyMentorFeedback dailyMentorFeedback) {
            return new DailyMentorFeedbackResponse(
                    dailyMentorFeedback.getId(),
                    dailyMentorFeedback.getFeedbackDate(),
                    dailyMentorFeedback.getPromptSnapshot(),
                    dailyMentorFeedback.getFeedbackContent(),
                    dailyMentorFeedback.getGeneratedAt(),
                    dailyMentorFeedback.getSendStatus()
            );
        }
    }

    public record DailyRoutineSummaryResponse(
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
            List<RoutineTaskSummaryResponse> completedTasks,
            List<RoutineTaskSummaryResponse> uncompletedTasks
    ) {
        public static DailyRoutineSummaryResponse from(MentorDto.DailyRoutineSummary summary) {
            return new DailyRoutineSummaryResponse(
                    summary.date(),
                    summary.totalCount(),
                    summary.completedCount(),
                    summary.pendingCount(),
                    summary.skippedCount(),
                    summary.completionRate(),
                    summary.plannedAt(),
                    summary.lastRoutineModifiedAt(),
                    summary.firstCompletedAt(),
                    summary.lastCompletedAt(),
                    summary.completedTasks().stream()
                            .map(RoutineTaskSummaryResponse::from)
                            .toList(),
                    summary.uncompletedTasks().stream()
                            .map(RoutineTaskSummaryResponse::from)
                            .toList()
            );
        }
    }

    public record RoutineTaskSummaryResponse(
            String label,
            LocalTime startTime,
            LocalTime endTime,
            String taskContent,
            RoutinePeriodStatus status,
            LocalDateTime completedAt
    ) {
        public static RoutineTaskSummaryResponse from(MentorDto.RoutineTaskSummary task) {
            return new RoutineTaskSummaryResponse(
                    task.label(),
                    task.startTime(),
                    task.endTime(),
                    task.taskContent(),
                    task.status(),
                    task.completedAt()
            );
        }
    }
}