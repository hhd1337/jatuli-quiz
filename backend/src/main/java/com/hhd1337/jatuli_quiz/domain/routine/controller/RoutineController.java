package com.hhd1337.jatuli_quiz.domain.routine.controller;

import com.hhd1337.jatuli_quiz.common.response.ApiResponse;
import com.hhd1337.jatuli_quiz.domain.routine.dto.RoutineRequest;
import com.hhd1337.jatuli_quiz.domain.routine.dto.RoutineResponse;
import com.hhd1337.jatuli_quiz.domain.routine.service.RoutineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(
        name = "Routine API",
        description = "오늘 루틴 등록, 조회, 완료/건너뜀 처리를 위한 API"
)
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/routines")
public class RoutineController {

    private final RoutineService routineService;

    @Operation(
            summary = "오늘 루틴 저장/수정",
            description = "사용자가 등록한 특정 날짜의 하루 루틴을 저장하거나 수정합니다. "
                    + "루틴은 여러 개의 시간 구간으로 구성되며, 각 구간은 교시명, 시작 시간, 종료 시간, 할 일, 정렬 순서, 구간 타입을 가집니다. "
                    + "이미 해당 날짜의 루틴이 존재하면 기존 루틴을 새 요청 값으로 교체합니다."
    )
    @PutMapping("/daily")
    public ApiResponse<RoutineResponse.DailyRoutineResponse> saveDailyRoutine(
            @RequestBody RoutineRequest.SaveDailyRoutineRequest request
    ) {
        return ApiResponse.onSuccess(routineService.saveDailyRoutine(request));
    }

    @Operation(
            summary = "오늘 루틴 조회",
            description = "요청한 날짜에 등록된 하루 루틴을 조회합니다. "
                    + "프론트엔드는 응답으로 받은 시간 구간 목록의 시작 시간과 종료 시간을 기준으로 현재 진행 중인 교시를 계산합니다."
    )
    @GetMapping("/daily")
    public ApiResponse<RoutineResponse.DailyRoutineResponse> getDailyRoutine(
            @RequestParam LocalDate date
    ) {
        return ApiResponse.onSuccess(routineService.getDailyRoutine(date));
    }

    @Operation(
            summary = "루틴 구간 완료 처리",
            description = "특정 루틴 시간 구간을 완료 상태로 변경합니다. "
                    + "예를 들어 현재 2교시 작업을 끝냈을 때 해당 구간을 완료 처리하는 데 사용합니다."
    )
    @PatchMapping("/periods/{periodId}/complete")
    public ApiResponse<RoutineResponse.DailyRoutineResponse> completePeriod(
            @PathVariable Long periodId
    ) {
        return ApiResponse.onSuccess(routineService.completePeriod(periodId));
    }

    @Operation(
            summary = "루틴 구간 건너뜀 처리",
            description = "특정 루틴 시간 구간을 건너뜀 상태로 변경합니다. "
                    + "해당 교시의 작업을 수행하지 못했거나 의도적으로 넘긴 경우 사용합니다."
    )
    @PatchMapping("/periods/{periodId}/skip")
    public ApiResponse<RoutineResponse.DailyRoutineResponse> skipPeriod(
            @PathVariable Long periodId
    ) {
        return ApiResponse.onSuccess(routineService.skipPeriod(periodId));
    }
    
    @Operation(
            summary = "루틴 구간 대기 상태로 변경",
            description = "완료 처리된 특정 루틴 시간 구간을 다시 대기 상태로 변경합니다. "
                    + "사용자가 실수로 완료 처리했거나, 다시 미완료 상태로 되돌리고 싶을 때 사용합니다."
    )
    @PatchMapping("/periods/{periodId}/pending")
    public ApiResponse<RoutineResponse.DailyRoutineResponse> resetPeriod(
            @PathVariable Long periodId
    ) {
        return ApiResponse.onSuccess(routineService.resetPeriod(periodId));
    }
}