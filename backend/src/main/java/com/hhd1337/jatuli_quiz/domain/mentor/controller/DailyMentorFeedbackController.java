package com.hhd1337.jatuli_quiz.domain.mentor.controller;

import com.hhd1337.jatuli_quiz.common.response.ApiResponse;
import com.hhd1337.jatuli_quiz.domain.mentor.dto.MentorResponse;
import com.hhd1337.jatuli_quiz.domain.mentor.service.DailyMentorFeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(
        name = "Daily AI Mentor Feedback API",
        description = "일일 AI 멘토 피드백 생성 및 조회 API"
)
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/mentor/feedbacks")
public class DailyMentorFeedbackController {

    private final DailyMentorFeedbackService dailyMentorFeedbackService;

    @Operation(
            summary = "일일 AI 멘토 피드백 생성",
            description = "장기/월간/주간 계획, 오늘 루틴 결과, 오늘 소감, 시간 기록을 조합해 "
                    + "AI 멘토 피드백을 생성하고 DB에 저장합니다. "
                    + "같은 날짜의 피드백이 이미 있으면 새로 생성한 내용으로 갱신합니다."
    )
    @PostMapping("/daily")
    public ApiResponse<MentorResponse.DailyMentorFeedbackResponse> generateDailyFeedback(
            @RequestParam LocalDate date
    ) {
        return ApiResponse.onSuccess(dailyMentorFeedbackService.generateDailyFeedback(date));
    }

    @Operation(
            summary = "일일 AI 멘토 피드백 조회",
            description = "특정 날짜에 생성된 AI 멘토 피드백을 조회합니다."
    )
    @GetMapping("/daily")
    public ApiResponse<MentorResponse.DailyMentorFeedbackResponse> getDailyFeedback(
            @RequestParam LocalDate date
    ) {
        return ApiResponse.onSuccess(dailyMentorFeedbackService.getDailyFeedback(date));
    }
}