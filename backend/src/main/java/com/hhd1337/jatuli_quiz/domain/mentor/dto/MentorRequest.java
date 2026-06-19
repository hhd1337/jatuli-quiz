package com.hhd1337.jatuli_quiz.domain.mentor.dto;

import java.time.LocalDate;

public class MentorRequest {

    public record SaveMentorPlanRequest(
            String content
    ) {
    }

    public record SaveDailyReflectionRequest(
            LocalDate reflectionDate,
            String mood,
            String good,
            String regret,
            String freeText
    ) {
    }
}