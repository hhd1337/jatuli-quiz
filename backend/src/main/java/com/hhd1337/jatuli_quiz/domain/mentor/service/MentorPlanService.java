package com.hhd1337.jatuli_quiz.domain.mentor.service;

import com.hhd1337.jatuli_quiz.domain.mentor.dto.MentorRequest;
import com.hhd1337.jatuli_quiz.domain.mentor.dto.MentorResponse;
import com.hhd1337.jatuli_quiz.domain.mentor.entity.MentorPlan;
import com.hhd1337.jatuli_quiz.domain.mentor.entity.MentorPlanType;
import com.hhd1337.jatuli_quiz.domain.mentor.repository.MentorPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MentorPlanService {

    private final MentorPlanRepository mentorPlanRepository;

    @Transactional
    public MentorResponse.MentorPlanResponse savePlan(
            MentorPlanType type,
            MentorRequest.SaveMentorPlanRequest request
    ) {
        MentorPlan mentorPlan = mentorPlanRepository.findByTypeAndActiveTrue(type)
                .map(existingPlan -> {
                    existingPlan.updateContent(request.content());
                    return existingPlan;
                })
                .orElseGet(() -> mentorPlanRepository.save(
                        new MentorPlan(type, request.content())
                ));

        return MentorResponse.MentorPlanResponse.from(mentorPlan);
    }

    public MentorResponse.CurrentMentorPlansResponse getCurrentPlans() {
        MentorResponse.MentorPlanResponse careerPlan = mentorPlanRepository
                .findByTypeAndActiveTrue(MentorPlanType.CAREER)
                .map(MentorResponse.MentorPlanResponse::from)
                .orElse(null);

        MentorResponse.MentorPlanResponse monthlyPlan = mentorPlanRepository
                .findByTypeAndActiveTrue(MentorPlanType.MONTHLY)
                .map(MentorResponse.MentorPlanResponse::from)
                .orElse(null);

        MentorResponse.MentorPlanResponse weeklyPlan = mentorPlanRepository
                .findByTypeAndActiveTrue(MentorPlanType.WEEKLY)
                .map(MentorResponse.MentorPlanResponse::from)
                .orElse(null);

        return new MentorResponse.CurrentMentorPlansResponse(
                careerPlan,
                monthlyPlan,
                weeklyPlan
        );
    }
}