package com.hhd1337.jatuli_quiz.domain.mentor.service;

import com.hhd1337.jatuli_quiz.domain.mentor.dto.MentorDto;
import com.hhd1337.jatuli_quiz.domain.mentor.dto.MentorResponse;
import com.hhd1337.jatuli_quiz.domain.mentor.entity.DailyMentorFeedback;
import com.hhd1337.jatuli_quiz.domain.mentor.entity.DailyReflection;
import com.hhd1337.jatuli_quiz.domain.mentor.entity.MentorPlan;
import com.hhd1337.jatuli_quiz.domain.mentor.entity.MentorPlanType;
import com.hhd1337.jatuli_quiz.domain.mentor.repository.DailyMentorFeedbackRepository;
import com.hhd1337.jatuli_quiz.domain.mentor.repository.DailyReflectionRepository;
import com.hhd1337.jatuli_quiz.domain.mentor.repository.MentorPlanRepository;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DailyMentorFeedbackService {

    private final MentorPlanRepository mentorPlanRepository;
    private final DailyReflectionRepository dailyReflectionRepository;
    private final DailyMentorFeedbackRepository dailyMentorFeedbackRepository;
    private final RoutineSummaryService routineSummaryService;
    private final MentorPromptBuilder mentorPromptBuilder;
    private final MentorFeedbackGenerator mentorFeedbackGenerator;

    @Transactional
    public MentorResponse.DailyMentorFeedbackResponse generateDailyFeedback(LocalDate date) {
        String careerPlanContent = getActivePlanContent(
                MentorPlanType.CAREER,
                "아직 등록된 취업 전반 계획이 없습니다."
        );

        String monthlyPlanContent = getActivePlanContent(
                MentorPlanType.MONTHLY,
                "아직 등록된 이번달 계획이 없습니다."
        );

        String weeklyPlanContent = getActivePlanContent(
                MentorPlanType.WEEKLY,
                "아직 등록된 이번주 계획이 없습니다."
        );

        MentorDto.DailyRoutineSummary dailyRoutineSummary =
                routineSummaryService.getDailyRoutineSummary(date);

        DailyReflection dailyReflection = dailyReflectionRepository.findByReflectionDate(date)
                .orElseThrow(() -> new IllegalArgumentException("해당 날짜의 오늘 소감이 없습니다. date=" + date));

        String promptSnapshot = mentorPromptBuilder.build(
                careerPlanContent,
                monthlyPlanContent,
                weeklyPlanContent,
                dailyRoutineSummary,
                dailyReflection
        );

        String feedbackContent = mentorFeedbackGenerator.generate(promptSnapshot);

        DailyMentorFeedback dailyMentorFeedback = dailyMentorFeedbackRepository
                .findByFeedbackDate(date)
                .map(existingFeedback -> {
                    existingFeedback.regenerate(promptSnapshot, feedbackContent);
                    return existingFeedback;
                })
                .orElseGet(() -> dailyMentorFeedbackRepository.save(
                        new DailyMentorFeedback(
                                date,
                                promptSnapshot,
                                feedbackContent
                        )
                ));

        return MentorResponse.DailyMentorFeedbackResponse.from(dailyMentorFeedback);
    }

    public MentorResponse.DailyMentorFeedbackResponse getDailyFeedback(LocalDate date) {
        DailyMentorFeedback dailyMentorFeedback = dailyMentorFeedbackRepository.findByFeedbackDate(date)
                .orElseThrow(() -> new IllegalArgumentException("해당 날짜의 AI 멘토 피드백이 없습니다. date=" + date));

        return MentorResponse.DailyMentorFeedbackResponse.from(dailyMentorFeedback);
    }

    private String getActivePlanContent(MentorPlanType type, String fallbackMessage) {
        return mentorPlanRepository.findByTypeAndActiveTrue(type)
                .map(MentorPlan::getContent)
                .filter(StringUtils::hasText)
                .orElse(fallbackMessage);
    }
}