package com.hhd1337.jatuli_quiz.domain.mentor.controller;

import com.hhd1337.jatuli_quiz.common.response.ApiResponse;
import com.hhd1337.jatuli_quiz.domain.mentor.dto.MentorRequest;
import com.hhd1337.jatuli_quiz.domain.mentor.dto.MentorResponse;
import com.hhd1337.jatuli_quiz.domain.mentor.service.DailyReflectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(
        name = "Daily Reflection API",
        description = "하루 마무리 소감 저장 및 조회 API"
)
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/mentor/reflections")
public class DailyReflectionController {

    private final DailyReflectionService dailyReflectionService;

    @Operation(
            summary = "오늘 소감 저장/수정",
            description = "특정 날짜의 오늘 컨디션, 잘한 점, 아쉬운 점, 자유 소감을 저장하거나 수정합니다. "
                    + "저장 시 소감 작성 시각이 기록됩니다."
    )
    @PutMapping("/daily")
    public ApiResponse<MentorResponse.DailyReflectionResponse> saveDailyReflection(
            @RequestBody MentorRequest.SaveDailyReflectionRequest request
    ) {
        return ApiResponse.onSuccess(dailyReflectionService.saveDailyReflection(request));
    }

    @Operation(
            summary = "오늘 소감 조회",
            description = "특정 날짜에 작성한 하루 마무리 소감을 조회합니다."
    )
    @GetMapping("/daily")
    public ApiResponse<MentorResponse.DailyReflectionResponse> getDailyReflection(
            @RequestParam LocalDate date
    ) {
        return ApiResponse.onSuccess(dailyReflectionService.getDailyReflection(date));
    }
}