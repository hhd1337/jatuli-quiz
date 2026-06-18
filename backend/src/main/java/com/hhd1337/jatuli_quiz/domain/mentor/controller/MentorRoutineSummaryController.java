package com.hhd1337.jatuli_quiz.domain.mentor.controller;

import com.hhd1337.jatuli_quiz.common.response.ApiResponse;
import com.hhd1337.jatuli_quiz.domain.mentor.dto.MentorResponse;
import com.hhd1337.jatuli_quiz.domain.mentor.service.RoutineSummaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(
        name = "Mentor Routine Summary API",
        description = "AI 멘토 피드백 및 프론트 요약 화면에 사용할 일일 루틴 결과 요약 API"
)
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/mentor/routine-summary")
public class MentorRoutineSummaryController {

    private final RoutineSummaryService routineSummaryService;

    @Operation(
            summary = "일일 루틴 결과 요약 조회",
            description = "특정 날짜의 루틴 전체 구간 수, 완료 수, 미완료 수, 완료율, "
                    + "완료한 일 목록, 미완료한 일 목록, 완료 처리 시각 정보를 요약해서 조회합니다."
    )
    @GetMapping("/daily")
    public ApiResponse<MentorResponse.DailyRoutineSummaryResponse> getDailyRoutineSummary(
            @RequestParam LocalDate date
    ) {
        return ApiResponse.onSuccess(
                MentorResponse.DailyRoutineSummaryResponse.from(
                        routineSummaryService.getDailyRoutineSummary(date)
                )
        );
    }
}
