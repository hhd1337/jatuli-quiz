package com.hhd1337.jatuli_quiz.domain.mentor.controller;

import com.hhd1337.jatuli_quiz.common.response.ApiResponse;
import com.hhd1337.jatuli_quiz.domain.mentor.dto.MentorRequest;
import com.hhd1337.jatuli_quiz.domain.mentor.dto.MentorResponse;
import com.hhd1337.jatuli_quiz.domain.mentor.entity.MentorPlanType;
import com.hhd1337.jatuli_quiz.domain.mentor.service.MentorPlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(
        name = "AI Mentor Plan API",
        description = "AI 멘토 피드백에 사용할 장기/월간/주간 계획 저장 및 조회 API"
)
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/mentor/plans")
public class MentorPlanController {

    private final MentorPlanService mentorPlanService;

    @Operation(
            summary = "AI 멘토 계획 저장/수정",
            description = "취업 전반 계획, 이번달 계획, 이번주 계획을 저장하거나 수정합니다. "
                    + "type은 CAREER, MONTHLY, WEEKLY 중 하나입니다."
    )
    @PutMapping("/{type}")
    public ApiResponse<MentorResponse.MentorPlanResponse> savePlan(
            @PathVariable MentorPlanType type,
            @RequestBody MentorRequest.SaveMentorPlanRequest request
    ) {
        return ApiResponse.onSuccess(mentorPlanService.savePlan(type, request));
    }

    @Operation(
            summary = "현재 적용 중인 AI 멘토 계획 조회",
            description = "현재 활성화된 취업 전반 계획, 이번달 계획, 이번주 계획을 조회합니다."
    )
    @GetMapping("/current")
    public ApiResponse<MentorResponse.CurrentMentorPlansResponse> getCurrentPlans() {
        return ApiResponse.onSuccess(mentorPlanService.getCurrentPlans());
    }
}